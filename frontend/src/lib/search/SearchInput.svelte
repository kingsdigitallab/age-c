<script lang="ts">
	let {
		title = 'Search',
		searchQuery = $bindable(''),
		searchInputInFilters = false,
		isLoading,
		isSearching,
		minSearchQueryLength = 3,
		onSearch,
		onReset
	}: {
		title?: string;
		searchQuery: string;
		searchInputInFilters?: boolean;
		isLoading: boolean;
		isSearching: boolean;
		minSearchQueryLength?: number;
		onSearch: (e: Event) => void;
		onReset: (e: Event) => void;
	} = $props();

	let isValidSearch = $derived(searchQuery.trim().length >= minSearchQueryLength);
</script>

{#snippet buttons()}
	<button
		type="submit"
		disabled={isLoading || !isValidSearch}
		aria-label={!isValidSearch
			? `Please enter at least ${minSearchQueryLength} characters`
			: 'Search'}
	>
		Search
	</button>
	<button type="reset" disabled={isLoading} aria-label="Reset search"> Reset </button>
{/snippet}

<section class="skij-search-input">
	<h2>{title}</h2>
	<form onsubmit={onSearch} onreset={onReset}>
		<!-- svelte-ignore a11y_no_redundant_roles -->
		<fieldset role={!searchInputInFilters ? 'group' : ''}>
			<input
				id="skij-search-query"
				type="search"
				bind:value={searchQuery}
				disabled={isLoading || isSearching}
				placeholder={`Enter a ${title.toLowerCase()} query...`}
				aria-label={`Enter a ${title.toLowerCase()} query...`}
				spellcheck="false"
			/>
			{#if searchInputInFilters}
				<div class="grid">
					{@render buttons()}
				</div>
			{:else}
				{@render buttons()}
			{/if}
		</fieldset>
	</form>
</section>
