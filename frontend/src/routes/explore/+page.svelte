<script lang="ts">
	import BiographiesTable from '$lib/components/BiographiesTable.svelte';
	import FilmsTable from '$lib/components/FilmsTable.svelte';
	import Search from '$lib/search/Search.svelte';
	import type { PageData } from './$types';

	let dataSource = $state<'films' | 'biographies'>('films');
</script>

<article>
	<h1>Explore</h1>
	<select bind:value={dataSource} aria-label="Select data source">
		<option value="films">Films</option>
		<option value="biographies">Biographies</option>
	</select>

	{#if dataSource === 'films'}
		<Search dataSource="films" title="Films" ItemComponent={FilmsTable} />
	{:else if dataSource === 'biographies'}
		<Search dataSource="biographies" title="Biographies" ItemComponent={BiographiesTable} />
	{/if}
</article>
