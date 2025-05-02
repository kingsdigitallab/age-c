<script lang="ts">
	import { base } from '$app/paths';
	import SearchWorker from '$lib/search/worker?worker';
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
	const searchSort = $state<{
		options: string[];
		by: string;
		order: 'asc' | 'desc';
	}>({
		options: [...new Set(Object.values(searchConfig[dataSource].sortings).map((s) => s.field))],
		by: '',
		order: 'asc'
	});

	let searchStatus = $state<'idle' | 'load' | 'ready'>('idle');
	let searchWorker = $state<Worker | null>(null);
	let searchError = $state<string | null>(null);
	let searchResults = $state({ query: '', results: [] });

	const isLoading = $derived(['idle', 'load'].includes(searchStatus));
	let isSearching = $state(false);

	let showSearch = $state(false);

	// @ts-ignore
	const searchAggregations = $derived(searchResults.results?.data?.aggregations || {});
	// @ts-ignore
	const searchItems = $derived(searchResults.results?.data?.items || []);
	// @ts-ignore
	let searchPagination = $derived(searchResults.results?.pagination || {});

	onMount(() => {
		initSearchEngine();
	});

	function initSearchEngine() {
		if (searchStatus === 'ready') {
			return;
		}

		searchStatus = 'load';

		searchWorker = new SearchWorker();
		searchWorker.onmessage = (event) => {
			const { action, payload } = event.data;
			searchError = null;

			if (action === 'ready') {
				searchStatus = 'ready';
				postSearchMessage();
			} else if (action === 'results') {
				searchResults = { query: payload.query, results: payload.results };
				isSearching = false;
			}
		};

		searchWorker.onerror = (error) => {
			searchError = 'An error occurred while searching';
			searchStatus = 'ready';
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
		if (searchStatus === 'ready') {
			searchWorker?.postMessage({
				action: 'search',
				payload: {
					dataSource,
					query: searchQuery,
					page: searchPage,
					sort: searchSort.by ? `${searchSort.by}_${searchSort.order}` : undefined,
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

	function handleSortOrderChange(e: Event) {
		e.preventDefault();

		searchSort.order = searchSort.order === 'asc' ? 'desc' : 'asc';
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
	<h1>{title}</h1>

	<SearchStatusComponent {isLoading} {isSearching} {searchError} />

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
		sortOptions={searchSort.options}
		bind:sortBy={searchSort.by}
		sortOrder={searchSort.order}
		onToggleFilters={handleToggleSearch}
		onSortByChange={handleSortByChange}
		onSortOrderChange={handleSortOrderChange}
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
