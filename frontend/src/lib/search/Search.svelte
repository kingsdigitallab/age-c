<script lang="ts">
	import { base } from '$app/paths';
	import SearchWorker from '$lib/search/worker?worker';
	import { WORKER_STATUS } from '$lib/search/config';
	import FacetDistributionPlot from '$lib/search/FacetDistributionPlot.svelte';
	import pluralize from 'pluralize-esm';
	import { onDestroy, onMount } from 'svelte';
	import { queryParameters, ssp } from 'sveltekit-search-params';
	import SearchControls from './SearchControls.svelte';
	import SearchFilters from './SearchFilters.svelte';
	import SearchInput from './SearchInput.svelte';
	import SearchPagination from './SearchPagination.svelte';
	import SearchResults from './SearchResults.svelte';
	import SearchResultsItems from './SearchResultsItems.svelte';
	import SearchShortcuts from './SearchShortcuts.svelte';
	import SearchStatus from './SearchStatus.svelte';
	import type { SearchConfig } from './types';

	const {
		dataSource,
		searchConfig,
		title,
		sortBy,
		summaryFacet,
		distributionFacets,
		SearchShortcutsComponent = SearchShortcuts,
		SearchStatusComponent = SearchStatus,
		SearchInputComponent = SearchInput,
		SearchFacetDistributionPlotComponent = FacetDistributionPlot,
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
		sortBy?: string;
		summaryFacet?: string;
		distributionFacets?: {
			facet: string;
			title: string;
		}[];
		SearchShortcutsComponent?: typeof SearchShortcuts;
		SearchStatusComponent?: typeof SearchStatus;
		SearchInputComponent?: typeof SearchInput;
		SearchFacetDistributionPlotComponent?: typeof FacetDistributionPlot;
		SearchFiltersComponent?: typeof SearchFilters;
		SearchControlsComponent?: typeof SearchControls;
		SearchResultsComponent?: typeof SearchResults;
		SearchResultsItemsComponent?: typeof SearchResultsItems;
		SearchPaginationComponent?: typeof SearchPagination;
		minSearchQueryLength?: number;
	} = $props();

	const searchParams = queryParameters(
		{
			query: ssp.string(''),
			page: ssp.number(1),
			filters: ssp.object({}),
			sort: ssp.string('')
		},
		{ showDefaults: false }
	);

	let searchFilters = $state({});
	const searchFiltersCount = $derived(Object.keys(searchFilters).length);
	const searchSortOptions = $derived(
		Object.entries(searchConfig[dataSource].sortings).map(([key, value]) => ({
			label: value.label,
			value: key
		}))
	);

	let searchWorker = $state<Worker | null>(null);
	let searchWorkerStatus = $state(WORKER_STATUS.IDLE);
	let searchWorkerError = $state<string | null>(null);
	let searchResults = $state({ query: '', results: [] });

	const isLoading = $derived([WORKER_STATUS.IDLE, WORKER_STATUS.LOAD].includes(searchWorkerStatus));
	let isSearching = $state(false);

	let showSearch = $state(false);

	// @ts-ignore
	const searchAggregations = $derived(searchResults.results?.data?.aggregations || {});
	// @ts-ignore
	const searchItems = $derived(searchResults.results?.data?.items || []);
	// @ts-ignore
	let searchPagination = $derived(searchResults.results?.pagination || {});

	const summaryStats = $derived(summaryFacet ? searchAggregations[summaryFacet] : null);

	let selectedDistributionFacet = $state(distributionFacets?.[0]?.facet);
	const distributionStats = $derived(
		selectedDistributionFacet ? searchAggregations[selectedDistributionFacet]?.buckets : null
	);

	onMount(() => {
		if (searchParams.filters) {
			searchFilters = searchParams.filters;
		}

		initSearchEngine();
	});

	function initSearchEngine() {
		if (searchWorkerStatus === WORKER_STATUS.READY) {
			return;
		}

		searchWorkerStatus = WORKER_STATUS.LOAD;

		searchWorker = new SearchWorker();
		searchWorker.onmessage = (event) => {
			const { action, payload } = event.data;
			searchWorkerError = null;

			if (action === 'ready') {
				searchWorkerStatus = WORKER_STATUS.READY;
				postSearchMessage();
			} else if (action === 'results') {
				searchResults = { query: payload.query, results: payload.results };
				isSearching = false;
			}
		};

		searchWorker.onerror = (error) => {
			searchWorkerError = 'An error occurred while searching';
			searchWorkerStatus = WORKER_STATUS.READY;
			console.error('Search worker error:', error);
		};

		searchWorker.postMessage({ action: 'load', payload: { basePath: base, dataSource } });
	}

	function handleToggleSearch() {
		showSearch = !showSearch;
	}

	function handleSearch(e: Event) {
		e.preventDefault();

		searchParams.page = 1;
		isSearching = true;
		postSearchMessage();
	}

	function postSearchMessage() {
		if (searchWorkerStatus === WORKER_STATUS.READY) {
			searchWorker?.postMessage({
				action: 'search',
				payload: {
					dataSource,
					query: searchParams.query,
					page: searchParams.page,
					sort: searchParams.sort || sortBy || undefined,
					filters: $state.snapshot(searchFilters)
				}
			});
		}
	}

	function handleReset() {
		searchParams.query = '';
		searchParams.page = 1;
		searchParams.filters = {};
		searchFilters = {};
		searchParams.sort = '';
		postSearchMessage();
	}

	function handleSortByChange(e: Event) {
		e.preventDefault();

		searchParams.page = 1;
		postSearchMessage();
	}

	function handlePageChange(page: number) {
		searchParams.page = page;
		postSearchMessage();
	}

	function handleSearchFiltersChange() {
		// remove empty keys, i.e. filters that no longer have any values
		searchFilters = Object.fromEntries(
			Object.entries(searchFilters).filter(([_, value]) => value.length > 0)
		);

		searchParams.page = 1;
		searchParams.filters = $state.snapshot(searchFilters);
		postSearchMessage();
	}

	onDestroy(() => {
		setTimeout(() => {
			if (searchWorker) {
				searchWorker.terminate();
				searchWorker = null;
			}
		}, 5000);
	});
</script>

<SearchShortcutsComponent onToggleSearch={handleToggleSearch} />

<article id="skij">
	<hgroup>
		<h1>{title}</h1>
		{#if summaryStats}
			<ul class="search-summary-stats">
				{#each summaryStats.buckets as bucket}
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
		bind:searchQuery={searchParams.query}
		{isLoading}
		{isSearching}
		{minSearchQueryLength}
		onSearch={handleSearch}
		onReset={handleReset}
	/>

	{#if distributionFacets}
		{#if selectedDistributionFacet}
			{#key distributionStats}
				<SearchFacetDistributionPlotComponent
					title={distributionFacets.find((facet) => facet.facet === selectedDistributionFacet)
						?.title}
					data={distributionStats}
					x="key"
					y="doc_count"
					xLabel={searchConfig[dataSource].aggregations[selectedDistributionFacet].title}
					yLabel="Count"
				/>
			{/key}
		{/if}
		<select bind:value={selectedDistributionFacet}>
			{#each distributionFacets as facet}
				<option value={facet.facet}>{facet.title}</option>
			{/each}
		</select>
	{/if}

	<SearchControlsComponent
		{isLoading}
		{isSearching}
		{showSearch}
		{searchFiltersCount}
		sortOptions={searchSortOptions}
		bind:sortBy={searchParams.sort}
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
