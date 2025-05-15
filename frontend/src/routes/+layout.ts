import { browser } from '$app/environment';
import { base } from '$app/paths';
import { searchConfig } from '$lib';
import { initWorker } from '$lib/search/worker.svelte';
import type { LayoutLoad } from './$types';

export const prerender = true;

export const load: LayoutLoad = async () => {
	const searchWorker = browser ? initWorker(base, 'corpus', searchConfig.corpus) : undefined;

	return {
		searchWorker
	};
};
