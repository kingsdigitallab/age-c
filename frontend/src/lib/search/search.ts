import type { Item } from '$lib/types';
// @ts-expect-error Could not find a declaration file for module 'itemsjs'
import itemsjs from 'itemsjs';
import MiniSearch from 'minisearch';
import type { SearchConfig, SearchEngineKey, SearchParams } from './types';

const searchEngines = {} as Record<SearchEngineKey, Record<string, itemsjs | MiniSearch>>;

export function initSearchEngine(dataSource: SearchEngineKey, data: Item[], config: SearchConfig) {
	if (searchEngines[dataSource]) {
		return;
	}

	let searchConfig = config;

	if (config.skijCombineFilters) {
		searchConfig = expandConfigWithCombinations(config);
	}

	searchEngines[dataSource] = {};
	searchEngines[dataSource]['facetSearchEngine'] = itemsjs(data, searchConfig);

	if (!searchConfig.native_search_enabled) {
		searchEngines[dataSource]['nativeSearchEngine'] = new MiniSearch({
			idField: 'id',
			fields: searchConfig.searchableFields,
			storeFields: []
		});

		searchEngines[dataSource]['nativeSearchEngine'].addAll(data);
	}
}

function expandConfigWithCombinations(config: SearchConfig) {
	const expandedConfig = { ...config };

	for (const [facet, facetConfig] of Object.entries(config.aggregations)) {
		if (facetConfig.skijCombineWith) {
			for (const combineWith of facetConfig.skijCombineWith) {
				const [key, _] = Object.entries(combineWith)[0];
				expandedConfig.aggregations[`${facet}:::${key}`] = {
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
	config: Record<string, unknown>
) {
	searchEngines[dataSource]['facetSearchEngine'] = itemsjs(data, config);

	if (!config.native_search_enabled) {
		searchEngines[dataSource]['nativeSearchEngine'] = new MiniSearch({
			idField: 'id',
			fields: config.searchableFields,
			storeFields: []
		});
		searchEngines[dataSource]['nativeSearchEngine'].addAll(data);
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
	const facetSearchEngine = searchEngines[dataSource]['facetSearchEngine'];
	const nativeSearchEngine = searchEngines[dataSource]['nativeSearchEngine'];

	if (!facetSearchEngine) {
		throw new Error(`Search engine for ${dataSource} is not initialised`);
	}

	const searchOptions = {
		per_page: perPage,
		page,
		query,
		sort,
		filters
	};

	let results = undefined;

	if (nativeSearchEngine && query) {
		if (queryFields && queryFields.length > 0) {
			results = nativeSearchEngine.search(query, { fields: queryFields });
		} else {
			results = nativeSearchEngine.search(query);
		}

		delete searchOptions.query;
		searchOptions.ids = results.map((result) => result.id);
	}

	return facetSearchEngine.search(searchOptions);
}
