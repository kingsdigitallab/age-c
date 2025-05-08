<script lang="ts">
	import { base } from '$app/paths';
	import SearchWorker from '$lib/search/worker?worker';
	import pluralize from 'pluralize-esm';
	import { onDestroy, onMount } from 'svelte';
	import type { SearchConfig } from './types';
	import SearchControls from './SearchControls.svelte';
	import SearchFilters from './SearchFilters.svelte';
	import SearchInput from './SearchInput.svelte';
	import SearchPagination from './SearchPagination.svelte';
	import SearchResults from './SearchResults.svelte';
	import SearchResultsItems from './SearchResultsItems.svelte';
	import SearchShortcuts from './SearchShortcuts.svelte';
	import SearchStatus from './SearchStatus.svelte';

	const {
		dataSource,
		searchConfig,
		title,
		aggregationKey,
		SearchShortcutsComponent = SearchShortcuts,
		SearchStatusComponent = SearchStatus,
		SearchInputComponent = SearchInput,
		SearchFiltersComponent = SearchFilters,
		SearchControlsComponent = SearchControls,
		SearchResultsComponent = SearchResults,
		SearchResultsItemsComponent = SearchResultsItems,
		SearchPaginationComponent = SearchPagination,
		minSearchQueryLength = 3
	}: {
		dataSource: keyof typeof searchConfig;
		searchConfig: SearchConfig;
		title: string;
		aggregationKey?: string;
		SearchShortcutsComponent?: typeof SearchShortcuts;
		SearchStatusComponent?: typeof SearchStatus;
		SearchInputComponent?: typeof SearchInput;
		SearchFiltersComponent?: typeof SearchFilters;
		SearchControlsComponent?: typeof SearchControls;
		SearchResultsComponent?: typeof SearchResults;
		SearchResultsItemsComponent?: typeof SearchResultsItems;
		SearchPaginationComponent?: typeof SearchPagination;
		minSearchQueryLength?: number;
	} = $props();

	let searchQuery = $state('');
	let searchPage = $state(1);
	let searchFilters = $state<Record<string, string[]>>({});
	const searchFiltersCount = $derived(Object.keys(searchFilters).length);
	const searchSortOptions = $derived(
		Object.entries(searchConfig[dataSource].sortings).map(([key, value]) => ({
			label: value.label,
			value: key
		}))
	);
	let searchSortBy = $state<string>('');

	let searchWorker = $state<Worker | null>(null);
	let searchWorkerStatus = $state<'idle' | 'load' | 'ready'>('idle');
	let searchWorkerError = $state<string | null>(null);
	let searchResults = $state({ query: '', results: [] });

	const isLoading = $derived(['idle', 'load'].includes(searchWorkerStatus));
	let isSearching = $state(false);

	let showSearch = $state(false);

	// @ts-ignore
	const searchAggregations = $derived(searchResults.results?.data?.aggregations || {});
	// @ts-ignore
	const searchItems = $derived(searchResults.results?.data?.items || []);
	// @ts-ignore
	let searchPagination = $derived(searchResults.results?.pagination || {});

	const stats = $derived(aggregationKey ? searchAggregations[aggregationKey] : null);

	onMount(() => {
		initSearchEngine();
	});

	function initSearchEngine() {
		if (searchWorkerStatus === 'ready') {
			return;
		}

		searchWorkerStatus = 'load';

		searchWorker = new SearchWorker();
		searchWorker.onmessage = (event) => {
			const { action, payload } = event.data;
			searchWorkerError = null;

			if (action === 'ready') {
				searchWorkerStatus = 'ready';
				postSearchMessage();
			} else if (action === 'results') {
				searchResults = { query: payload.query, results: payload.results };
				isSearching = false;
			}
		};

		searchWorker.onerror = (error) => {
			searchWorkerError = 'An error occurred while searching';
			searchWorkerStatus = 'ready';
			console.error('Search worker error:', error);
		};

		searchWorker.postMessage({ action: 'load', payload: { basePath: base, dataSource } });
	}

	function handleToggleSearch() {
		showSearch = !showSearch;
	}

	function handleSearch(e: Event) {
		e.preventDefault();

		searchPage = 1;
		isSearching = true;
		postSearchMessage();
	}

	function postSearchMessage() {
		if (searchWorkerStatus === 'ready') {
			searchWorker?.postMessage({
				action: 'search',
				payload: {
					dataSource,
					query: searchQuery,
					page: searchPage,
					sort: searchSortBy || undefined,
					filters: $state.snapshot(searchFilters)
				}
			});
		}
	}

	function handleReset() {
		searchQuery = '';
		searchPage = 1;
		searchFilters = {};
		postSearchMessage();
	}

	function handleSortByChange(e: Event) {
		e.preventDefault();

		searchPage = 1;
		postSearchMessage();
	}

	function handlePageChange(page: number) {
		searchPage = page;
		postSearchMessage();
	}

	function handleSearchFiltersChange() {
		// remove empty keys, i.e. filters that no longer have any values
		searchFilters = Object.fromEntries(
			Object.entries(searchFilters).filter(([_, value]) => value.length > 0)
		);

		searchPage = 1;
		postSearchMessage();
	}

	onDestroy(() => {
		setTimeout(() => {
			if (searchWorker) {
				searchWorker.terminate();
				searchWorker = null;
			}
		}, 1000);
	});
</script>

<SearchShortcutsComponent onToggleSearch={handleToggleSearch} />

<article>
	<hgroup>
		<h1>{title}</h1>
		{#if stats}
			<ul class="search-summary-stats">
				{#each stats.buckets as bucket}
					{@const count = bucket.doc_count}
					{@const label = bucket.key}
					<li>
						{count.toLocaleString()}
						{pluralize(label, count)}
					</li>
				{/each}
			</ul>
		{/if}
	</hgroup>

	<SearchStatusComponent {isLoading} {isSearching} searchError={searchWorkerError} />

	<SearchInputComponent
		bind:searchQuery
		{isLoading}
		{isSearching}
		{minSearchQueryLength}
		onSearch={handleSearch}
		onReset={handleReset}
	/>

	<SearchControlsComponent
		{isLoading}
		{isSearching}
		{showSearch}
		{searchFiltersCount}
		sortOptions={searchSortOptions}
		bind:sortBy={searchSortBy}
		onToggleFilters={handleToggleSearch}
		onSortByChange={handleSortByChange}
	/>

	<SearchResultsComponent
		{isLoading}
		{isSearching}
		searchQuery={searchResults.query}
		{searchItems}
		{searchPagination}
		{SearchResultsItemsComponent}
	/>

	<SearchPaginationComponent
		{isLoading}
		{isSearching}
		count={searchPagination.total}
		page={searchPagination.page}
		perPage={searchPagination.per_page}
		onPageChange={handlePageChange}
	/>
</article>

<SearchFiltersComponent
	show={showSearch}
	bind:searchFilters
	{searchAggregations}
	{searchConfig}
	{dataSource}
	onClose={() => (showSearch = false)}
	onFiltersChange={handleSearchFiltersChange}
/>

<style>
	ul.search-summary-stats {
		display: flex;
		gap: var(--pico-spacing);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	ul.search-summary-stats li {
		list-style: none;
		padding: 0;
	}
</style>
