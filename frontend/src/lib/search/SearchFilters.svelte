<script lang="ts">
	import type { SearchConfig } from './types';
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	const {
		show,
		searchFilters = $bindable({}),
		searchAggregations,
		searchConfig,
		dataSource,
		onClose,
		onFiltersChange,
		children = null
	}: {
		show: boolean;
		searchFilters: Record<string, string[]>;
		searchAggregations: Record<string, { buckets: Array<{ key: string; doc_count: number }> }>;
		searchConfig: SearchConfig;
		dataSource: keyof typeof searchConfig;
		onClose: () => void;
		onFiltersChange: () => void;
		children?: Snippet | null | undefined;
	} = $props();

	const aggregations = $derived(Object.entries(searchConfig[dataSource].aggregations));
</script>

{#if show}
	<aside tabindex="-1" transition:slide={{ axis: 'x' }}>
		<h3>Filters</h3>

		<button class="close-search-filters-button" aria-label="Close search filters" onclick={onClose}>
			<span aria-hidden="true">&times;</span>
		</button>

		{#if children}
			{@render children()}
		{/if}

		{#if searchAggregations}
			{#each aggregations as [key, aggregation]}
				<section>
					<details>
						<summary>{aggregation.title}</summary>
						<fieldset>
							{#each searchAggregations[key].buckets as bucket}
								<label>
									<input
										type="checkbox"
										value={bucket.key}
										bind:group={searchFilters[key]}
										onchange={onFiltersChange}
									/>
									<span>{bucket.key}</span>
									<small>({bucket.doc_count})</small>
								</label>
							{/each}
						</fieldset>
					</details>
				</section>
			{/each}
		{/if}
	</aside>
{/if}

<style>
	aside {
		background: var(--pico-background-color);
		border: var(--pico-border-width) solid var(--pico-primary-border);
		border-radius: var(--pico-border-radius);
		height: 100vh;
		left: 0;
		overflow-y: auto;
		padding: var(--pico-spacing);
		position: fixed;
		top: 0;
		width: min(500px, 100vw);
		z-index: 10;
	}

	.close-search-filters-button {
		background: transparent;
		border: none;
		color: var(--pico-muted-color);
		padding: 0;
		position: absolute;
		right: var(--pico-spacing);
		top: var(--pico-spacing);
	}

	.close-search-filters-button:hover {
		color: var(--pico-primary-color);
	}

	details fieldset {
		max-height: var(--search-filter-height);
		overflow-y: scroll;
	}

	label {
		width: 100%;
	}
</style>
