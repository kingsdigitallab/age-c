import type { Item } from '$lib/types';
// @ts-expect-error Could not find a declaration file for module 'itemsjs'
import itemsjs from 'itemsjs';
import type { SearchParams, SearchEngineKey } from './types';

const searchEngines = {} as Record<SearchEngineKey, itemsjs>;

export function initSearchEngine(
	dataSource: SearchEngineKey,
	data: Item[],
	config: Record<string, unknown>
) {
	if (searchEngines[dataSource]) {
		return;
	}

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
