<script lang="ts">
	import { base } from '$app/paths';
	import { searchConfig } from '$lib';
	import SearchWorker from '$lib/search/worker?worker';
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Component } from 'svelte';
	import type { Item } from '$lib/types';

	const {
		dataSource,
		title,
		ItemComponent,
		minSearchQueryLength = 3
	}: {
		dataSource: keyof typeof searchConfig;
		title: string;
		ItemComponent: Component<{ item: Item }>;
		minSearchQueryLength?: number;
	} = $props();

	let searchQuery = $state('');
	let searchFilters = $state<Record<string, string[]>>({});
	let searchStatus = $state<'idle' | 'load' | 'ready'>('idle');
	let searchWorker = $state<Worker | null>(null);
	let searchError = $state<string | null>(null);

	const aggregations = $derived(Object.entries(searchConfig[dataSource].aggregations));

	let isLoading = $derived(['idle', 'load'].includes(searchStatus));
	let isValidSearch = $derived(searchQuery.trim().length >= minSearchQueryLength);

	let isSearching = $state(false);
	let searchResults = $state([]);
	// @ts-ignore
	const searchAggregations = $derived(searchResults?.data?.aggregations);
	// @ts-ignore
	const searchItems = $derived(searchResults?.data?.items);
	// @ts-ignore
	const searchPagination = $derived(searchResults?.pagination);

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

	function handleSearch() {
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

<section>
	{#if isLoading}
		<p aria-busy={true}>Loading search engine...</p>
	{:else if isSearching}
		<p aria-busy={true}>Searching...</p>
	{/if}

	{#if searchError}
		<p role="alert" class="error">{searchError}</p>
	{/if}
</section>

<div class="grid">
	<aside>
		<h2>Search</h2>
		<form onsubmit={handleSearch} onreset={handleReset}>
			<fieldset>
				<input
					id="search-query"
					type="text"
					bind:value={searchQuery}
					disabled={isLoading || isSearching}
					placeholder="Enter a search query..."
					aria-label="Search query"
				/>
				<div role="group">
					<button
						type="submit"
						disabled={isLoading || !isValidSearch}
						aria-label={!isValidSearch
							? `Please enter at least ${minSearchQueryLength} characters`
							: 'Search'}>Search</button
					>
					<button type="reset" disabled={isLoading} aria-label="Reset search">Reset</button>
				</div>
			</fieldset>
		</form>

		<section>
			<h3>Filters</h3>
			{#if searchAggregations}
				{#each aggregations as [key, aggregation]}
					<details>
						<summary>{aggregation.title}</summary>
						<fieldset>
							{#each searchAggregations[key].buckets as bucket}
								<label>
									<input
										type="checkbox"
										value={bucket.key}
										bind:group={searchFilters[key]}
										onchange={handleSearchFiltersChange}
									/>
									<span>{bucket.key}</span>
									<small>({bucket.doc_count})</small>
								</label>
							{/each}
						</fieldset>
					</details>
				{/each}
			{/if}
		</section>
	</aside>

	<section aria-busy={isSearching}>
		{#if !isLoading}
			<hgroup>
				<h2>Results</h2>
				<small>
					{#if searchPagination?.total !== undefined}
						{searchPagination.total.toLocaleString()}
						{title.toLowerCase()} found
					{:else}
						No results
					{/if}
				</small>
			</hgroup>

			{#if searchItems?.length > 0}
				<ol transition:fade>
					{#each searchItems as item}
						<li>
							<a href={`${base}/${dataSource}/${item.slug}`}>
								<ItemComponent {item} />
							</a>
						</li>
					{/each}
				</ol>
			{:else if searchQuery && !isSearching}
				<p transition:fade>No results found for "{searchQuery}"</p>
			{/if}
		{/if}
	</section>
</div>

<style>
	details fieldset {
		max-height: var(--search-filter-height);
		overflow-y: scroll;
	}

	label {
		width: 100%;
	}
</style>
