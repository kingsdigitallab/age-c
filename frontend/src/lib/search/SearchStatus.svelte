<script lang="ts">
	const {
		isLoading,
		isSearching,
		searchError
	}: {
		isLoading: boolean;
		isSearching: boolean;
		searchError: string | null;
	} = $props();
</script>

<section>
	{#if isLoading}
		<p aria-busy={true}>Loading...</p>
	{:else if isSearching}
		<p aria-busy={true}>Searching...</p>
	{/if}

	{#if searchError}
		<p role="alert" class="error">{searchError}</p>
	{/if}
</section>
