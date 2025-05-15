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
			<div class="skij-pagination">
				<Pagination.PrevButton class="skij-pagination-prev-button">❮</Pagination.PrevButton>
				<div class="skij-pagination-pages">
					{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<span class="skij-pagination-ellipsis">&#x2026;</span>
						{:else}
							<Pagination.Page {page} class="skij-pagination-page">
								{page.value}
							</Pagination.Page>
						{/if}
					{/each}
				</div>
				<Pagination.NextButton class="skij-pagination-next-button">❯</Pagination.NextButton>
			</div>
			<p class="skij-pagination-info">
				<small>Showing {range.start} - {range.end}</small>
			</p>
		{/snippet}
	</Pagination.Root>
{/if}

<style>
	.skij-pagination,
	.skij-pagination-pages {
		align-items: center;
		display: flex;
		gap: calc(var(--pico-spacing) / 2);
		justify-content: center;
	}

	.skij-pagination-info {
		text-align: center;
	}
</style>
