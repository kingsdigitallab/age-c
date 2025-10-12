import type { Item } from '$lib/types';
// @ts-expect-error Could not find a declaration file for module 'itemsjs'
import itemsjs from 'itemsjs';
import MiniSearch from 'minisearch';
import type { CorpusConfig, SearchEngineKey, SearchParams } from './types';

type FacetEngine = ReturnType<typeof itemsjs>;
type NativeEngine = MiniSearch<{ id: string | number }>;
type EngineStore = {
	facetSearchEngine: FacetEngine;
	nativeSearchEngine?: NativeEngine;
};

const searchEngines = {} as Record<SearchEngineKey, EngineStore>;

export function initSearchEngine(dataSource: SearchEngineKey, data: Item[], config: CorpusConfig) {
	if (searchEngines[dataSource]) {
		return;
	}

	let searchConfig = config;

	if (config.skijCombineFilters) {
		searchConfig = expandConfigWithCombinations(config);
	}

	searchEngines[dataSource] = {
		facetSearchEngine: itemsjs(data, searchConfig)
	};

	if (searchConfig.nativeSearchConfig && searchConfig.searchableFields) {
		searchEngines[dataSource].nativeSearchEngine = new MiniSearch(searchConfig.nativeSearchConfig);

		searchEngines[dataSource].nativeSearchEngine.addAll(data);
	}
}

function expandConfigWithCombinations(config: CorpusConfig) {
	const expandedConfig: CorpusConfig = { ...config, aggregations: { ...config.aggregations } };

	for (const facet in config.aggregations) {
		const facetConfig = config.aggregations[facet];
		if (facetConfig.skijCombineWith) {
			for (const combineWith of facetConfig.skijCombineWith) {
				const [key] = Object.keys(combineWith);
				(expandedConfig.aggregations as Record<string, unknown>)[`${facet}:::${key}`] = {
					title: `${facetConfig.title} and ${key}`
				};
			}
		}
	}

	return expandedConfig;
}

export function reloadSearchEngine(
	dataSource: SearchEngineKey,
	data: Item[],
	config: CorpusConfig
) {
	if (!searchEngines[dataSource]) {
		searchEngines[dataSource] = {
			facetSearchEngine: itemsjs(data, config)
		};
	} else {
		searchEngines[dataSource].facetSearchEngine = itemsjs(data, config);
	}

	if (config.nativeSearchConfig && config.searchableFields) {
		searchEngines[dataSource].nativeSearchEngine = new MiniSearch(config.nativeSearchConfig);
		searchEngines[dataSource].nativeSearchEngine.addAll(data);
	}
}

export function search({
	dataSource,
	query,
	queryFields = [],
	page = 1,
	perPage = 25,
	sort = 'title_asc',
	filters = {}
}: SearchParams) {
	const facetSearchEngine = searchEngines[dataSource].facetSearchEngine;
	const nativeSearchEngine = searchEngines[dataSource].nativeSearchEngine;

	if (!facetSearchEngine) {
		throw new Error(`Search engine for ${dataSource} is not initialised`);
	}

	const baseOptions = {
		per_page: perPage,
		page,
		sort,
		filters
	};

	const trimmedQuery = typeof query === 'string' ? query.trim() : query;

	if (nativeSearchEngine && trimmedQuery) {
		const results =
			queryFields && queryFields.length > 0
				? nativeSearchEngine.search(trimmedQuery, { fields: queryFields })
				: nativeSearchEngine.search(trimmedQuery);

		return facetSearchEngine.search({ ...baseOptions, ids: results.map((result) => result.id) });
	}

	return facetSearchEngine.search({ ...baseOptions, query: trimmedQuery });
}
