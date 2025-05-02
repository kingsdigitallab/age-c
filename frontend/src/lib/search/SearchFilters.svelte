<script lang="ts">
	import type { SearchConfig } from './types';
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
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

	let expandFilters = $state(false);
	const searchFiltersCount = $derived(Object.keys(searchFilters).length);
	const hasFilters = $derived(searchFiltersCount > 0);

	const aggregations = $derived(Object.entries(searchConfig[dataSource].aggregations));

	const handleClearFilters = () => {
		searchFilters = {};
		onFiltersChange();
	};
</script>

{#if show}
	<aside tabindex="-1" transition:slide={{ axis: 'x' }}>
		<h3>Filters</h3>

		<button class="close-search-filters-button" aria-label="Close search filters" onclick={onClose}>
			<span aria-hidden="true">&times;</span>
		</button>

		<section class="search-filters-controls">
			<button
				class="expand-search-filters-button"
				aria-label="{expandFilters ? 'Collapse' : 'Expand'} search filters"
				onclick={() => (expandFilters = !expandFilters)}
			>
				{expandFilters ? 'Collapse' : 'Expand'} all filters
			</button>
			<button
				class="clear-search-filters-button"
				aria-label="Clear search filters"
				onclick={handleClearFilters}
				disabled={!hasFilters}
			>
				Clear all filters
			</button>
		</section>

		{#if children}
			{@render children()}
		{/if}

		{#if searchAggregations}
			{#each aggregations as [key, aggregation]}
				<section class="search-filters-section">
					<details open={expandFilters}>
						<summary>{aggregation.title}</summary>
						<fieldset>
							{#each searchAggregations[key].buckets as bucket}
								<label>
									<input
										name={key}
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

	.search-filters-controls button {
		--pico-background-color: transparent;
		--pico-color: var(--pico-primary);

		border: none;
		padding: 0;
		text-decoration: underline;
	}

	details {
		border-bottom: var(--pico-border-width) solid var(--pico-primary-border);
		padding-bottom: var(--pico-spacing);
	}

	details fieldset {
		background: var(--pico-code-background-color);
		max-height: var(--search-filter-height);
		overflow-y: scroll;
		padding-block: calc(var(--pico-spacing) / 4);
		padding-inline: calc(var(--pico-spacing) / 2);
	}

	label {
		width: 100%;
	}
</style>
