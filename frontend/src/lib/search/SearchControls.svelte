<script lang="ts">
	let {
		isLoading,
		isSearching,
		showSearch,
		searchFiltersCount,
		sortOptions,
		sortBy = $bindable(''),
		onToggleFilters,
		onSortByChange
	}: {
		isLoading: boolean;
		isSearching: boolean;
		showSearch: boolean;
		searchFiltersCount: number;
		sortOptions: { label: string; value: string }[];
		sortBy: string;
		onToggleFilters: () => void;
		onSortByChange: (e: Event) => void;
	} = $props();

	const areFiltersDisabled = $derived(isLoading || isSearching || showSearch);
	const isSortByDisabled = $derived(isLoading || isSearching);
</script>

<section class="skij-controls">
	<button onclick={onToggleFilters} disabled={areFiltersDisabled}>
		Filters ({searchFiltersCount})
	</button>
	<select
		name="sort-by"
		aria-label="Sort results by"
		bind:value={sortBy}
		onchange={onSortByChange}
		disabled={isSortByDisabled}
	>
		<option selected disabled value="">Sort by</option>
		{#each sortOptions as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</section>

<style>
	.skij-controls {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.skij-controls select {
		width: fit-content;
	}
</style>
