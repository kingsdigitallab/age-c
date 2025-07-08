<script lang="ts">
	let {
		showSearch,
		searchFiltersCount,
		isLoading = false,
		onToggleFilters
	}: {
		showSearch: boolean;
		searchFiltersCount: number;
		isLoading: boolean;
		onToggleFilters: () => void;
	} = $props();
</script>

<section class="skij-controls">
	<button
		id="skij-toggle-filters-button"
		onclick={onToggleFilters}
		aria-label="{showSearch ? 'Hide' : 'Show'} search filters"
		disabled={isLoading}
	>
		Search and filters ({searchFiltersCount})
	</button>
</section>

<style>
	.skij-controls {
		display: flex;
		justify-content: space-around;
		align-items: flex-start;
	}
</style>
