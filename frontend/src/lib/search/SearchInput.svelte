<script lang="ts">
	let {
		title = 'Search',
		searchQuery = $bindable(''),
		isLoading,
		isSearching,
		minSearchQueryLength = 3,
		onSearch,
		onReset
	}: {
		title?: string;
		searchQuery: string;
		isLoading: boolean;
		isSearching: boolean;
		minSearchQueryLength?: number;
		onSearch: (e: Event) => void;
		onReset: (e: Event) => void;
	} = $props();

	let isValidSearch = $derived(searchQuery.trim().length >= minSearchQueryLength);
</script>

<section>
	<h2>{title}</h2>
	<form onsubmit={onSearch} onreset={onReset}>
		<!-- svelte-ignore a11y_no_redundant_roles -->
		<fieldset role="group">
			<input
				id="skij-query"
				type="text"
				bind:value={searchQuery}
				disabled={isLoading || isSearching}
				placeholder={`Enter a ${title.toLowerCase()} query...`}
				aria-label={`Enter a ${title.toLowerCase()} query...`}
				spellcheck="false"
			/>
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
		</fieldset>
	</form>
</section>
