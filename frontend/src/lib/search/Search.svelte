<script lang="ts">
	import { base } from '$app/paths';
	import { WORKER_STATUS } from '$lib/search/config';
	import DataInsights from '$lib/search/DataInsights.svelte';
	import pluralize from 'pluralize-esm';
	import { onMount } from 'svelte';
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
	import { getWorkerError, getWorkerStatus } from './worker.svelte';

	const {
		dataSource,
		searchConfig,
		searchWorker,
		title,
		sortBy,
		summaryFacet,
		dataInsightsFacets,
		enableFullDataInsights = false,
		fullDataInsightsPerPage = 1000,
		SearchShortcutsComponent = SearchShortcuts,
		SearchStatusComponent = SearchStatus,
		SearchInputComponent = SearchInput,
		searchInputInFilters = false,
		DataInsightsComponent = DataInsights,
		SearchFiltersComponent = SearchFilters,
		SearchControlsComponent = SearchControls,
		SearchResultsComponent = SearchResults,
		SearchResultsItemsComponent = SearchResultsItems,
		SearchPaginationComponent = SearchPagination,
		minSearchQueryLength = 3
	}: {
		dataSource: keyof typeof searchConfig;
		searchConfig: SearchConfig;
		searchWorker: Worker;
		title: string;
		sortBy?: string;
		searchInputInFilters?: boolean;
		summaryFacet?: string;
		dataInsightsFacets?: {
			facet: string;
			title: string;
			dynamicTitle?: (count: number) => string;
		}[];
		enableFullDataInsights?: boolean;
		fullDataInsightsPerPage?: number;
		SearchShortcutsComponent?: typeof SearchShortcuts;
		SearchStatusComponent?: typeof SearchStatus;
		SearchInputComponent?: typeof SearchInput;
		DataInsightsComponent?: typeof DataInsights;
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

	let conjunctions = $state(
		Object.fromEntries(
			Object.entries(searchConfig[dataSource].aggregations).map(([key, aggregation]) => [
				key,
				aggregation.conjunction
			])
		)
	);

	let searchFilters = $state({});
	const searchFiltersCount = $derived(Object.keys(searchFilters).length);
	const searchSortOptions = $derived(
		Object.entries(searchConfig[dataSource].sortings).map(([key, value]) => ({
			label: value.skijLabel,
			value: key
		}))
	);

	const searchWorkerStatus = $derived(getWorkerStatus());
	const searchWorkerError = $derived(getWorkerError());

	let searchResults = $state({ query: '', results: [] });
	let insightsResults = $state({ query: '', results: [] });

	const isLoading = $derived([WORKER_STATUS.IDLE, WORKER_STATUS.LOAD].includes(searchWorkerStatus));
	let isSearching = $state(false);

	let showSearch = $state(false);

	// @ts-ignore
	const searchAggregations = $derived(searchResults.results?.data?.aggregations || {});
	// @ts-ignore
	const searchItems = $derived(searchResults.results?.data?.items || []);
	// @ts-ignore
	let searchPagination = $derived(searchResults.results?.pagination || {});

	const insightsItems = $derived(insightsResults.results?.data?.items || []);

	const summaryStats = $derived(summaryFacet ? searchAggregations[summaryFacet] : null);

	onMount(() => {
		if (searchParams.filters) {
			searchFilters = searchParams.filters;
		}

		prepareSearchWorker();
	});

	function prepareSearchWorker() {
		if (searchWorkerStatus === WORKER_STATUS.READY) {
			postSearchMessage();
		}

		const defaultOnMessage = searchWorker.onmessage;
		searchWorker.onmessage = (event) => {
			if (defaultOnMessage) {
				defaultOnMessage.call(searchWorker, event);
			}

			const { action, payload } = event.data;

			switch (action) {
				case WORKER_STATUS.READY:
					postSearchMessage();
					break;
				case WORKER_STATUS.RESULTS:
					searchResults = { query: payload.query, results: payload.results };
					isSearching = false;
					break;
				case WORKER_STATUS.INSIGHTS_RESULTS:
					insightsResults = { query: payload.query, results: payload.results };
					isSearching = false;
					break;
			}
		};
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
			if (enableFullDataInsights) {
				searchWorker?.postMessage({
					action: 'insights',
					payload: {
						dataSource,
						query: searchParams.query,
						perPage: fullDataInsightsPerPage,
						filters: $state.snapshot(searchFilters)
					}
				});
			}
		}
	}

	function handleToggleSearch() {
		showSearch = !showSearch;
	}

	function handleSearch(e: Event) {
		e.preventDefault();

		const previousQuery = searchResults.query;
		const newQuery = searchParams.query;

		if (newQuery !== previousQuery) {
			searchParams.filters = {};
			searchFilters = {};
		}

		searchParams.page = 1;
		isSearching = true;
		postSearchMessage();
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

	function handleConjunctionChange() {
		const config = $state.snapshot(searchConfig[dataSource]);

		for (const key in conjunctions) {
			config.aggregations[key].conjunction = conjunctions[key];
		}

		searchWorker.postMessage({
			action: 'load',
			payload: { basePath: base, dataSource, config, reload: true }
		});
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
</script>

<SearchShortcutsComponent onToggleSearch={handleToggleSearch} />

<div class="skij-search-layout">
	<SearchFiltersComponent
		show={showSearch}
		bind:searchFilters
		{searchAggregations}
		bind:conjunctions
		{searchConfig}
		{dataSource}
		{isLoading}
		onClose={() => (showSearch = false)}
		onFiltersChange={handleSearchFiltersChange}
		onConjunctionChange={handleConjunctionChange}
	>
		{#if searchInputInFilters}
			<SearchInputComponent
				bind:searchQuery={searchParams.query}
				searchInputInFilters
				{isLoading}
				{isSearching}
				{minSearchQueryLength}
				onSearch={handleSearch}
				onReset={handleReset}
			/>
		{/if}
	</SearchFiltersComponent>

	<article id="skij">
		<hgroup>
			<h1>{title}</h1>
			<p class="skij-summary-stats">
				<span>
					<strong>{searchPagination?.total?.toLocaleString()}</strong> Total Records
				</span>
				{#if summaryStats}
					{#each summaryStats.buckets as bucket}
						{@const count = bucket.doc_count}
						{@const label = bucket.key}
						<small>
							<strong>{count.toLocaleString()}</strong>
							{pluralize(label, count)}
						</small>
					{/each}
				{/if}
			</p>
		</hgroup>

		<SearchStatusComponent {isLoading} {isSearching} searchError={searchWorkerError} />

		{#if !searchInputInFilters}
			<SearchInputComponent
				bind:searchQuery={searchParams.query}
				{isLoading}
				{isSearching}
				{minSearchQueryLength}
				onSearch={handleSearch}
				onReset={handleReset}
			/>
		{/if}

		<SearchControlsComponent
			{showSearch}
			{searchFiltersCount}
			onToggleFilters={handleToggleSearch}
		/>

		{#if dataInsightsFacets}
			<DataInsightsComponent
				{isLoading}
				facets={dataInsightsFacets}
				searchItems={enableFullDataInsights ? insightsItems : undefined}
				{searchFilters}
				{searchAggregations}
				{searchConfig}
				{dataSource}
			/>
		{/if}

		<article>
			<SearchResultsComponent
				{isLoading}
				{isSearching}
				searchQuery={searchResults.query}
				{searchItems}
				{searchPagination}
				{SearchResultsItemsComponent}
				sortOptions={searchSortOptions}
				bind:sortBy={searchParams.sort}
				onSortByChange={handleSortByChange}
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
	</article>
</div>

<style>
	.skij-search-layout {
		display: flex;
		gap: calc(var(--pico-spacing) / 2);
	}

	@media (max-width: 992px) {
		.skij-search-layout {
			flex-direction: column;
		}
	}

	@media (min-width: 992px) {
		.skij-search-layout {
			flex-direction: row;
		}

		.skij-search-layout > article {
			flex: 1;
			min-width: 0;
		}
	}

	.skij-summary-stats {
		align-items: baseline;
		display: flex;
		gap: var(--pico-spacing);
		margin: 0;
		padding: 0;
	}
</style>
