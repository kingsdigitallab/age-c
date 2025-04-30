<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Item } from '$lib/types';
	import SearchResultsItems from './SearchResultsItems.svelte';

	const {
		isLoading,
		isSearching,
		searchQuery,
		searchItems,
		searchPagination,
		title = 'Results',
		SearchResultsItemsComponent = SearchResultsItems
	}: {
		isLoading: boolean;
		isSearching: boolean;
		searchQuery: string;
		searchItems: Item[];
		searchPagination: { total?: number };
		title: string;
		SearchResultsItemsComponent: typeof SearchResultsItems;
	} = $props();
</script>

<section aria-busy={isSearching}>
	{#if !isLoading}
		<hgroup>
			<h2>{title}</h2>
			<small>
				{#if searchPagination?.total !== undefined}
					{searchPagination.total.toLocaleString()} found
				{:else}
					No results
				{/if}
			</small>
		</hgroup>

		<div transition:fade>
			{#if searchItems?.length > 0}
				<SearchResultsItemsComponent items={searchItems} />
			{:else if searchQuery && !isSearching}
				<p>No results found for "{searchQuery}"</p>
			{/if}
		</div>
	{/if}
</section>
