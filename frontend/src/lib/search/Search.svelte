<script lang="ts">
	import { base } from '$app/paths';
	import { WORKER_STATUS } from '$lib/search/config';
	import FacetDistributionPlot from '$lib/search/FacetDistributionPlot.svelte';
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
		searchWorker: Worker;
		title: string;
		sortBy?: string;
		summaryFacet?: string;
		distributionFacets?: {
			facet: string;
			title: string;
			dynamicTitle?: (count: number) => string;
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
			label: value.label,
			value: key
		}))
	);

	const searchWorkerStatus = $derived(getWorkerStatus());
	const searchWorkerError = $derived(getWorkerError());
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
		}
	}

	function handleToggleSearch() {
		showSearch = !showSearch;

		if (showSearch) {
			setTimeout(() => {
				document.getElementById('skij-close-filters-button')?.focus();
			}, 100);
		}
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
	/>

	<article id="skij">
		<hgroup>
			<h1>{title}</h1>
			{#if summaryStats}
				<ul class="skij-summary-stats">
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

		{#if distributionFacets && !isLoading}
			<section>
				{#if selectedDistributionFacet}
					{#key distributionStats}
						<SearchFacetDistributionPlotComponent
							title={distributionFacets.find((facet) => facet.facet === selectedDistributionFacet)
								?.title}
							dynamicTitle={distributionFacets.find(
								(facet) => facet.facet === selectedDistributionFacet
							)?.dynamicTitle}
							data={distributionStats}
							x="key"
							y="doc_count"
							xLabel={searchConfig[dataSource].aggregations[selectedDistributionFacet].title}
							yLabel="Count"
						/>
					{/key}
				{/if}
				<fieldset>
					<label>
						Choose what to visualise
						<select name="distribution-facet" bind:value={selectedDistributionFacet}>
							{#each distributionFacets as facet}
								<option value={facet.facet}>{facet.title}</option>
							{/each}
						</select>
					</label>
				</fieldset>
			</section>
		{/if}

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
</div>

<style>
	.skij-search-layout {
		display: flex;
		gap: var(--pico-spacing);
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

	ul.skij-summary-stats {
		display: flex;
		gap: var(--pico-spacing);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	ul.skij-summary-stats li {
		list-style: none;
		padding: 0;
	}
</style>
