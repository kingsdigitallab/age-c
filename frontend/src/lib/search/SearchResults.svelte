<script lang="ts">
	import type { Item } from '$lib/types';
	import { fade } from 'svelte/transition';
	import SearchResultsItems from './SearchResultsItems.svelte';

	const {
		isLoading,
		isSearching,
		searchQuery,
		searchItems,
		searchPagination,
		title = 'List of records',
		SearchResultsItemsComponent = SearchResultsItems
	}: {
		isLoading: boolean;
		isSearching: boolean;
		searchQuery: string;
		searchItems: Item[];
		searchPagination: { total?: number; page?: number; per_page?: number };
		title?: string;
		SearchResultsItemsComponent: typeof SearchResultsItems;
	} = $props();

	const start = $derived(
		searchPagination?.page && searchPagination?.per_page
			? searchPagination.page * searchPagination.per_page - searchPagination.per_page + 1
			: 1
	);
</script>

<section class="skij-results">
	<hgroup>
		<h2>{title}</h2>
		<small aria-busy={isLoading || isSearching} aria-live="polite">
			{#if searchPagination?.total !== undefined}
				{searchPagination.total.toLocaleString()} Records
				{#if searchQuery}for <span class="skij-query">{searchQuery}</span>{/if}
			{:else}
				No records
			{/if}
		</small>
	</hgroup>

	<div transition:fade aria-live="polite">
		{#if searchItems?.length > 0}
			<SearchResultsItemsComponent items={searchItems} {start} />
		{:else if searchQuery && !isSearching}
			<p>No records found for <span class="skij-query">{searchQuery}</span></p>
		{/if}
	</div>
</section>

<style>
	.skij-query::before {
		content: '"';
		font-weight: normal;
	}

	.skij-query::after {
		content: '"';
		font-weight: normal;
	}
</style>
