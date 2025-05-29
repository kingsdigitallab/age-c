<script lang="ts">
	let {
		showSearch,
		searchFiltersCount,
		onToggleFilters
	}: {
		showSearch: boolean;
		searchFiltersCount: number;
		onToggleFilters: () => void;
	} = $props();
</script>

<section class="skij-controls">
	<button
		id="skij-toggle-filters-button"
		onclick={onToggleFilters}
		aria-label="{showSearch ? 'Hide' : 'Show'} search filters"
	>
		Refine results ({searchFiltersCount})
	</button>
</section>

<style>
	.skij-controls {
		display: flex;
		justify-content: space-around;
		align-items: flex-start;
	}
</style>
