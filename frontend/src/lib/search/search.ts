import type { Item } from '$lib/types';
// @ts-expect-error Could not find a declaration file for module 'itemsjs'
import itemsjs from 'itemsjs';
import type { SearchParams, SearchEngineKey, SearchConfig } from './types';

const searchEngines = {} as Record<SearchEngineKey, itemsjs>;

export function initSearchEngine(dataSource: SearchEngineKey, data: Item[], config: SearchConfig) {
	if (searchEngines[dataSource]) {
		return;
	}

	if (config.skijCombineFilters) {
		const configWithCombinations = expandConfigWithCombinations(config);
		console.log('configWithCombinations', configWithCombinations);
		searchEngines[dataSource] = itemsjs(data, configWithCombinations);
	} else {
		searchEngines[dataSource] = itemsjs(data, config);
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
	searchEngines[dataSource] = itemsjs(data, config);
}

export function search({
	dataSource,
	query,
	page = 1,
	perPage = 25,
	sort = 'title_asc',
	filters = {}
}: SearchParams) {
	const engine = searchEngines[dataSource];

	if (!engine) {
		throw new Error(`Search engine for ${dataSource} is not initialised`);
	}

	return engine.search({ per_page: perPage, page, query, sort, filters });
}
