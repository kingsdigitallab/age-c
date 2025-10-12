<script lang="ts">
	let {
		title = 'Search',
		searchQuery = $bindable(''),
		searchScope = $bindable('full'),
		searchInputInFilters = false,
		searchScopeOptions = [],
		isLoading,
		isSearching,
		minSearchQueryLength = 3,
		onSearch,
		onScopeChange,
		onReset
	}: {
		title?: string;
		searchQuery: string;
		searchScope?: string;
		searchInputInFilters?: boolean;
		searchScopeOptions?: { label: string; fields: string }[];
		isLoading: boolean;
		isSearching: boolean;
		minSearchQueryLength?: number;
		onSearch: (e: Event) => void;
		onScopeChange?: (scope: string) => void;
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
		</fieldset>
		{#if searchScopeOptions && onScopeChange}
			<!-- svelte-ignore a11y_no_redundant_roles -->
			<fieldset class="skij-search-scope" aria-live="polite">
				<legend>Search in:</legend>
				{#each searchScopeOptions as scope, index (scope.label)}
					<input
						type="radio"
						name="skij-search-scope"
						value={scope.fields}
						bind:group={searchScope}
						defaultChecked={index === 0}
						disabled={isLoading || isSearching}
						aria-label={`Search ${scope.label}`}
						onchange={() => {
							onScopeChange(scope.fields);
						}}
					/>
					<label for={`skij-search-scope-${scope.label}`}>{scope.label}</label>
				{/each}
			</fieldset>
		{/if}
		{#if searchInputInFilters}
			<div class="grid">
				{@render buttons()}
			</div>
		{:else}
			{@render buttons()}
		{/if}
	</form>
</section>
