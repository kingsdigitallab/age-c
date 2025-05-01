<script lang="ts">
	import { Pagination } from 'bits-ui';

	const { page, perPage, count, onPageChange } = $props();
</script>

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
