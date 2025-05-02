<script lang="ts">
	let {
		isLoading,
		isSearching,
		showSearch,
		searchFiltersCount,
		sortOptions,
		sortBy = $bindable(''),
		sortOrder = $bindable('asc'),
		onToggleFilters,
		onSortByChange,
		onSortOrderChange
	}: {
		isLoading: boolean;
		isSearching: boolean;
		showSearch: boolean;
		searchFiltersCount: number;
		sortOptions: string[];
		sortBy: string;
		sortOrder: 'asc' | 'desc';
		onToggleFilters: () => void;
		onSortByChange: (e: Event) => void;
		onSortOrderChange: (e: Event) => void;
	} = $props();

	const areFiltersDisabled = $derived(isLoading || isSearching || showSearch);
	const isSortByDisabled = $derived(isLoading || isSearching);
</script>

<section class="grid">
	<div>
		<button onclick={onToggleFilters} disabled={areFiltersDisabled}>
			Filters ({searchFiltersCount})
		</button>
	</div>
	<form>
		<fieldset role="group">
			<select
				name="sort-by"
				aria-label="Sort results by"
				bind:value={sortBy}
				onchange={onSortByChange}
				disabled={isSortByDisabled}
			>
				<option selected disabled value="">Sort by</option>
				{#each sortOptions as option}
					<option value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
				{/each}
			</select>
			<button aria-label="Toggle sort order" onclick={onSortOrderChange} disabled={!sortBy}>
				{sortOrder === 'asc' ? '↑' : '↓'}
			</button>
		</fieldset>
	</form>
</section>
