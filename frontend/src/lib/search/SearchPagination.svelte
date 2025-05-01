<script lang="ts">
	import { Pagination } from 'bits-ui';

	const {
		isLoading,
		isSearching,
		page,
		perPage,
		count,
		onPageChange
	}: {
		isLoading: boolean;
		isSearching: boolean;
		page: number;
		perPage: number;
		count: number;
		onPageChange: (page: number) => void;
	} = $props();
</script>

{#if !isLoading && !isSearching}
	<Pagination.Root {count} {page} {perPage} {onPageChange}>
		{#snippet children({ pages, range })}
			<div class="search-pagination">
				<Pagination.PrevButton class="search-pagination-prev-button">❮</Pagination.PrevButton>
				<div class="search-pagination-pages">
					{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<span class="search-pagination-ellipsis">&#x2026;</span>
						{:else}
							<Pagination.Page {page} class="search-pagination-page">
								{page.value}
							</Pagination.Page>
						{/if}
					{/each}
				</div>
				<Pagination.NextButton class="search-pagination-next-button">❯</Pagination.NextButton>
			</div>
			<p class="search-pagination-info">
				<small>Showing {range.start} - {range.end}</small>
			</p>
		{/snippet}
	</Pagination.Root>
{/if}

<style>
	.search-pagination,
	.search-pagination-pages {
		align-items: center;
		display: flex;
		gap: calc(var(--pico-spacing) / 2);
		justify-content: center;
	}

	.search-pagination-info {
		text-align: center;
	}
</style>
