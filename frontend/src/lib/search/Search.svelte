<script lang="ts">
	import { base } from '$app/paths';
	import SearchWorker from '$lib/search/worker?worker';
	import { onDestroy, onMount } from 'svelte';
	import type { SearchConfig } from './types';
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
		SearchResultsComponent?: typeof SearchResults;
		SearchResultsItemsComponent?: typeof SearchResultsItems;
		SearchPaginationComponent?: typeof SearchPagination;
		minSearchQueryLength?: number;
	} = $props();

	let searchQuery = $state('');
	let searchPage = $state(1);
	let searchFilters = $state<Record<string, string[]>>({});
	let searchStatus = $state<'idle' | 'load' | 'ready'>('idle');
	let searchWorker = $state<Worker | null>(null);
	let searchError = $state<string | null>(null);

	let isLoading = $derived(['idle', 'load'].includes(searchStatus));

	let showSearch = $state(false);

	let isSearching = $state(false);
	let searchResults = $state([]);
	// @ts-ignore
	const searchAggregations = $derived(searchResults?.data?.aggregations || {});
	// @ts-ignore
	const searchItems = $derived(searchResults?.data?.items || []);
	// @ts-ignore
	let searchPagination = $derived(searchResults?.pagination || {});

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
				searchResults = payload.results;
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
					filters: $state.snapshot(searchFilters)
				}
			});
		}
	}

	function handleReset() {
		searchQuery = '';
		searchFilters = {};
		postSearchMessage();
	}

	function handlePageChange(page: number) {
		searchPage = page;
		postSearchMessage();
	}

	function handleSearchFiltersChange() {
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

	<section>
		<button onclick={handleToggleSearch} disabled={isLoading || isSearching || showSearch}>
			Filters
		</button>
	</section>

	<SearchResultsComponent
		{isLoading}
		{isSearching}
		{searchQuery}
		{searchItems}
		{searchPagination}
		{SearchResultsItemsComponent}
	/>

	<SearchPaginationComponent
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
