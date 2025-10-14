import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock itemsjs and minisearch BEFORE importing the module under test
const itemsJsSearchMock = vi.fn();
const itemsJsFactoryMock = vi.fn(() => ({ search: itemsJsSearchMock }));
vi.mock('itemsjs', () => ({ default: itemsJsFactoryMock }));

class MiniSearchMock {
	public options: unknown;
	public added: unknown[] = [];
	constructor(options: unknown) {
		this.options = options;
	}
	addAll(items: unknown[]) {
		this.added = items;
	}
	search(query: string, opts?: { fields?: string[] }) {
		// Return results that echo back IDs based on input data previously added
		// Here we simply map to ids 1..n for predictability in tests
		const ids = this.added.map((v: any) => v?.id).filter((v) => v !== undefined);
		return ids.map((id) => ({ id, query, fields: opts?.fields }));
	}
}
vi.mock('minisearch', () => ({ default: MiniSearchMock }));

// Now import after mocks
import { initSearchEngine, reloadSearchEngine, search } from './search';
import type { CorpusConfig } from './types';

const sampleData = [
	{ id: 1, title: 'Alpha', description: 'First' },
	{ id: 2, title: 'Beta', description: 'Second' }
] as any[];

const baseConfig: CorpusConfig = {
	aggregations: {
		category: {
			conjunction: false,
			title: 'Category',
			hide_zero_doc_count: true,
			size: 10,
			sort: 'count',
			skijShowConjunctionToggle: true
		}
	},
	nativeSearchConfig: {
		idField: 'id',
		fields: ['title', 'description'],
		storeFields: ['id']
	} as any,
	searchableFields: ['title', 'description'],
	skijCombineFilters: false,
	sortings: {
		title_asc: { skijLabel: 'Title (A–Z)', field: 'title', order: 'asc' }
	}
};

describe('search.ts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('initialises search engine with itemsjs and minisearch', () => {
		initSearchEngine('ds', sampleData as any, baseConfig);

		// itemsjs called once with data and config
		expect(itemsJsFactoryMock).toHaveBeenCalledTimes(1);
		expect(itemsJsFactoryMock).toHaveBeenCalledWith(sampleData, expect.any(Object));
	});

	it('search falls back to itemsjs query when no native engine or empty query', () => {
		initSearchEngine('ds2', sampleData as any, {
			...baseConfig,
			nativeSearchConfig: undefined as any
		});
		itemsJsSearchMock.mockReturnValueOnce({ ok: true });

		const res = search({
			dataSource: 'ds2',
			query: '  ',
			page: 1,
			perPage: 25,
			sort: 'title_asc',
			filters: {}
		});
		expect(itemsJsSearchMock).toHaveBeenCalledWith({
			per_page: 25,
			page: 1,
			sort: 'title_asc',
			filters: {},
			query: ''
		});
		expect(res).toEqual({ ok: true });
	});

	it('search uses minisearch then filters ids through itemsjs when native engine is present', () => {
		initSearchEngine('ds3', sampleData as any, baseConfig);
		itemsJsSearchMock.mockReturnValueOnce({ ok: true });

		const res = search({
			dataSource: 'ds3',
			query: 'alpha',
			page: 2,
			perPage: 10,
			sort: 'title_asc',
			filters: { category: ['x'] }
		});
		// Should call itemsjs with ids instead of query
		expect(itemsJsSearchMock).toHaveBeenCalledWith({
			per_page: 10,
			page: 2,
			sort: 'title_asc',
			filters: { category: ['x'] },
			ids: [1, 2]
		});
		expect(res).toEqual({ ok: true });
	});

	it('search respects queryFields when provided', () => {
		initSearchEngine('ds4', sampleData as any, baseConfig);
		itemsJsSearchMock.mockReturnValueOnce({});

		search({
			dataSource: 'ds4',
			query: 'beta',
			queryFields: ['title'],
			page: 1,
			perPage: 25,
			sort: 'title_asc',
			filters: {}
		});

		// MiniSearchMock stores last search via results; we just assert itemsjs call received ids
		expect(itemsJsSearchMock).toHaveBeenCalledWith(expect.objectContaining({ ids: [1, 2] }));
	});

	it('throws if search engine not initialised', () => {
		expect(() => search({ dataSource: 'unknown', query: 'x' } as any)).toThrow(
			'Search engine for unknown is not initialised'
		);
	});

	it('reloadSearchEngine reinitialises itemsjs and minisearch', () => {
		reloadSearchEngine('ds5', sampleData as any, baseConfig);
		// itemsjs called to set facet engine
		expect(itemsJsFactoryMock).toHaveBeenCalled();

		itemsJsSearchMock.mockReturnValueOnce({ ok: true });
		const res = search({ dataSource: 'ds5', query: 'foo' } as any);
		expect(res).toEqual({ ok: true });
	});

	it('expands aggregations when skijCombineFilters is true', () => {
		const cfg: CorpusConfig = {
			...baseConfig,
			skijCombineFilters: true,
			aggregations: {
				a: {
					conjunction: false,
					title: 'A',
					hide_zero_doc_count: true,
					size: 10,
					sort: 'count',
					skijShowConjunctionToggle: true,
					skijCombineWith: [{ b: 'B' }]
				},
				b: {
					conjunction: false,
					title: 'B',
					hide_zero_doc_count: true,
					size: 10,
					sort: 'count',
					skijShowConjunctionToggle: true
				}
			}
		};

		initSearchEngine('ds6', sampleData as any, cfg);
		// itemsjs was called with expanded aggregations
		const [, passedConfig] = itemsJsFactoryMock.mock.calls.at(-1) as [unknown, any];
		expect(Object.keys(passedConfig.aggregations)).toContain('a:::b');
		expect(passedConfig.aggregations['a:::b'].title).toBe('A and b');
	});
});
