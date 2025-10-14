import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WORKER_STATUS } from './config';

// Capture the message event handler the worker registers
let registeredHandler: ((event: MessageEvent) => void) | null = null;

// Mock addEventListener before importing the worker module
const addEventListenerMock = vi.fn((type: string, handler: any) => {
	if (type === 'message') registeredHandler = handler;
});

// Mock global functions used by worker
const postMessageMock = vi.fn();
const fetchMock = vi.fn();

// Mock search functions used inside worker
const initSearchEngineMock = vi.fn();
const reloadSearchEngineMock = vi.fn();
const searchMock = vi.fn();

vi.stubGlobal('addEventListener', addEventListenerMock as any);
vi.stubGlobal('postMessage', postMessageMock as any);
vi.stubGlobal('fetch', fetchMock as any);

vi.mock('./search', () => ({
	initSearchEngine: initSearchEngineMock,
	reloadSearchEngine: reloadSearchEngineMock,
	search: searchMock
}));

// Import after globals/mocks are set so the worker registers its listener
import './worker';

describe('worker.ts message handling', () => {
	beforeEach(() => {
		postMessageMock.mockClear();
		fetchMock.mockReset();
		initSearchEngineMock.mockReset();
		reloadSearchEngineMock.mockReset();
		searchMock.mockReset();
	});

	it('handles LOAD by posting LOAD, fetching, initialising, and posting READY', async () => {
		const payload = {
			basePath: '/bp',
			dataSource: 'ds',
			config: { any: 'cfg' },
			reload: false
		} as any;
		const data = [{ id: 1 }];
		fetchMock.mockResolvedValueOnce({ json: async () => data });

		// Simulate message
		await registeredHandler?.({ data: { action: WORKER_STATUS.LOAD, payload } } as any);

		// First postMessage should be LOAD
		expect(postMessageMock).toHaveBeenNthCalledWith(1, { action: WORKER_STATUS.LOAD });

		// Should fetch correct URL
		expect(fetchMock).toHaveBeenCalledWith('/bp/api/search/ds.json');
		expect(initSearchEngineMock).toHaveBeenCalledWith('ds', data, payload.config);

		// Final postMessage should be READY
		expect(postMessageMock).toHaveBeenLastCalledWith({ action: WORKER_STATUS.READY });
	});

	it('handles LOAD with reload=true by calling reloadSearchEngine', async () => {
		const payload = {
			basePath: '/bp',
			dataSource: 'ds',
			config: { any: 'cfg' },
			reload: true
		} as any;
		const data = [{ id: 2 }];
		fetchMock.mockResolvedValueOnce({ json: async () => data });

		await registeredHandler?.({ data: { action: WORKER_STATUS.LOAD, payload } } as any);

		expect(reloadSearchEngineMock).toHaveBeenCalledWith('ds', data, payload.config);
	});

	it('handles SEARCH by delegating to search and returning RESULTS', async () => {
		const payload = { dataSource: 'ds', query: 'q', page: 1 };
		const results = { ok: true };
		searchMock.mockReturnValueOnce(results);

		await registeredHandler?.({ data: { action: WORKER_STATUS.SEARCH, payload } } as any);

		expect(searchMock).toHaveBeenCalledWith(payload);
		expect(postMessageMock).toHaveBeenLastCalledWith({
			action: WORKER_STATUS.RESULTS,
			payload: { query: 'q', results }
		});
	});

	it('handles INSIGHTS by delegating to search and returning INSIGHTS_RESULTS', async () => {
		const payload = { dataSource: 'ds', query: 'q2', perPage: 1000 };
		const results = { ok: 'insights' };
		searchMock.mockReturnValueOnce(results);

		await registeredHandler?.({ data: { action: WORKER_STATUS.INSIGHTS, payload } } as any);

		expect(searchMock).toHaveBeenCalledWith(payload);
		expect(postMessageMock).toHaveBeenLastCalledWith({
			action: WORKER_STATUS.INSIGHTS_RESULTS,
			payload: { query: 'q2', results }
		});
	});
});

