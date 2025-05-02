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
		searchPagination: { total?: number; page?: number; per_page?: number };
		title?: string;
		SearchResultsItemsComponent: typeof SearchResultsItems;
	} = $props();
</script>

<section>
	<hgroup>
		<h2>{title}</h2>
		<small aria-busy={isLoading || isSearching} aria-live="polite">
			{#if searchPagination?.total !== undefined}
				{searchPagination.total.toLocaleString()} found
			{:else}
				No results
			{/if}
		</small>
	</hgroup>

	<div transition:fade aria-live="polite">
		{#if searchItems?.length > 0}
			<SearchResultsItemsComponent
				items={searchItems}
				start={searchPagination.page * searchPagination.per_page - searchPagination.per_page + 1}
			/>
		{:else if searchQuery && !isSearching}
			<p>No results found for "{searchQuery}"</p>
		{/if}
	</div>
</section>
