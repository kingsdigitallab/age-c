import type { Item } from '$lib/types';
// @ts-expect-error Could not find a declaration file for module 'itemsjs'
import itemsjs from 'itemsjs';

type SearchEngineKey = keyof typeof searchEngines;
const searchEngines = {} as Record<string, itemsjs>;

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

export function search(
	dataSource: SearchEngineKey,
	query: string,
	filters: Record<string, string[]>
) {
	const engine = searchEngines[dataSource];

	if (!engine) {
		throw new Error(`Search engine for ${dataSource} is not initialised`);
	}

	return engine.search({ per_page: 25, query, filters });
}
