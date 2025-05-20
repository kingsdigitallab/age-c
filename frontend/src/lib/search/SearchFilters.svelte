<script lang="ts">
	import type { SearchConfig } from './types';
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
		show,
		searchFilters = $bindable({}),
		searchAggregations,
		conjunctions = $bindable({}),
		searchConfig,
		dataSource,
		isLoading,
		onClose,
		onFiltersChange,
		onConjunctionChange,
		children = null
	}: {
		show: boolean;
		searchFilters: Record<string, string[]>;
		searchAggregations: Record<string, { buckets: Array<{ key: string; doc_count: number }> }>;
		searchConfig: SearchConfig;
		conjunctions: Record<string, boolean>;
		dataSource: keyof typeof searchConfig;
		isLoading: boolean;
		onClose: () => void;
		onFiltersChange: () => void;
		onConjunctionChange: () => void;
		children?: Snippet | null | undefined;
	} = $props();

	const hasFilters = $derived(Object.keys(searchFilters).length > 0);
	const currentFilters = $derived(
		Object.entries(searchFilters).filter(([_, value]) => value.length > 0)
	);

	const aggregations = Object.entries(searchConfig[dataSource].aggregations);
	const filterSearchTerms = $state<Record<string, string>>({});

	let expandFilters = $state(false);
	let expandFiltersByField = $state<boolean[]>(aggregations.map(() => false));

	function handleExpandFilters() {
		expandFilters = !expandFilters;
		expandFiltersByField = expandFiltersByField.map(() => expandFilters);
	}

	function handleClearFilters() {
		searchFilters = {};
		onFiltersChange();
	}

	function handleFilterFieldToggle(e: Event, index: number) {
		e.preventDefault();
		expandFiltersByField[index] = !expandFiltersByField[index];
	}

	function handleRemoveFilter(key: string, value: string) {
		searchFilters[key] = searchFilters[key].filter((v) => v !== value);
		onFiltersChange();
	}

	function searchBuckets(key: string, buckets: Array<{ key: string; doc_count: number }>) {
		if (!filterSearchTerms[key]) {
			return buckets;
		}

		return buckets.filter((bucket) =>
			bucket.key.toLowerCase().includes(filterSearchTerms[key].toLowerCase())
		);
	}
</script>

{#if show}
	<aside transition:slide={{ axis: 'x' }}>
		<h2>Filters</h2>

		<button
			class="skij-close-filters-button"
			id="skij-close-filters-button"
			aria-label="Close search filters"
			onclick={onClose}
		>
			<span aria-hidden="true">&times;</span>
		</button>

		<section class="skij-filters-controls">
			<button
				class="skij-expand-filters-button"
				aria-label="{expandFilters ? 'Collapse' : 'Expand'} search filters"
				onclick={handleExpandFilters}
			>
				{expandFilters ? 'Collapse' : 'Expand'} all filters
			</button>
			<button
				class="skij-clear-filters-button"
				aria-label="Clear search filters"
				onclick={handleClearFilters}
				disabled={!hasFilters}
			>
				Clear all filters
			</button>
		</section>

		<section class="skij-filters-current-filters">
			<ul>
				{#each currentFilters as [key, values]}
					{#each values as value}
						<li>
							<button
								class="skij-filters-current-filter-button secondary"
								aria-label="Remove filter {key} with value {value}"
								title="Remove filter {key} with value {value}"
								onclick={() => handleRemoveFilter(key, value)}
							>
								{value}
								<span aria-hidden="true">&times;</span>
							</button>
						</li>
					{/each}
				{/each}
			</ul>
		</section>

		{#if children}
			{@render children()}
		{/if}

		{#if searchAggregations}
			{#each aggregations as [key, aggregation], index}
				{@const buckets = searchBuckets(key, searchAggregations[key].buckets)}
				<section class="skij-filter-section">
					<details class:disabled={buckets.length === 0} open={expandFiltersByField[index]}>
						<summary onclick={(e) => handleFilterFieldToggle(e, index)}>
							{aggregation.title}
							<small>({searchAggregations[key].buckets.length.toLocaleString()})</small>
						</summary>
						{#if searchAggregations[key].buckets.length > 10}
							<input
								name="skij-filters-search-{key}"
								type="text"
								placeholder="Search {aggregation.title.toLowerCase()} options..."
								aria-label="Search {aggregation.title.toLowerCase()} options..."
								bind:value={filterSearchTerms[key]}
								disabled={isLoading}
							/>
						{/if}
						<label class="skij-filter-conjunction" aria-busy={isLoading}>
							<small>
								<input
									type="checkbox"
									bind:checked={conjunctions[key]}
									onchange={onConjunctionChange}
									disabled={isLoading}
								/>
								Match all selected {aggregation.title.toLowerCase()}
							</small>
						</label>
						<fieldset>
							{#each buckets as bucket}
								<label>
									<input
										name={key}
										type="checkbox"
										value={bucket.key}
										bind:group={searchFilters[key]}
										onchange={onFiltersChange}
										disabled={isLoading}
									/>
									<span>{bucket.key}</span>
									<small>({bucket.doc_count.toLocaleString()})</small>
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
		overflow-y: auto;
		padding: var(--pico-spacing);
		min-width: 400px;
		z-index: 10;
	}

	@media (max-width: 992px) {
		aside {
			left: 0;
			position: fixed;
			top: 0;
		}
	}

	@media (min-width: 992px) {
		aside {
			height: calc(100vh - 2 * var(--pico-spacing));
			position: sticky;
			top: var(--pico-spacing);
		}
	}

	.skij-close-filters-button {
		background: transparent;
		border: none;
		color: var(--pico-muted-color);
		padding: 0;
		position: absolute;
		right: var(--pico-spacing);
		top: var(--pico-spacing);
	}

	.skij-close-filters-button:hover {
		color: var(--pico-primary-color);
	}

	.skij-filters-controls button {
		--pico-background-color: transparent;
		--pico-color: var(--pico-primary);

		border: none;
		padding: 0;
		text-decoration: underline;
	}

	.skij-filters-current-filters ul {
		display: flex;
		flex-wrap: wrap;
		gap: calc(var(--pico-spacing) / 2);
		padding: 0;
	}

	.skij-filters-current-filters ul li {
		padding: 0;
	}

	.skij-filters-current-filter-button {
		padding-block: calc(var(--pico-form-element-spacing-vertical) / 4);
	}

	details {
		border-bottom: var(--pico-border-width) solid var(--pico-primary-border);
		padding-bottom: var(--pico-spacing);
	}

	details.disabled summary {
		opacity: 0.5;
		pointer-events: none;
		user-select: none;
	}

	details fieldset {
		background: var(--pico-form-element-background-color);
		max-height: var(--skij-filter-height);
		overflow-y: scroll;
		padding-block: calc(var(--pico-spacing) / 4);
	}

	label {
		padding-block: calc(var(--pico-form-element-spacing-vertical) / 8);
		padding-inline: calc(var(--pico-form-element-spacing-vertical) / 4);
		width: 100%;
	}

	label:hover {
		background: var(--pico-secondary-hover-background);
		color: var(--pico-secondary-inverse);
	}

	label:has(input:checked) {
		--pico-primary-border: var(--pico-primary-inverse);

		background: var(--pico-primary-background);
		color: var(--pico-primary-inverse);
	}
</style>
