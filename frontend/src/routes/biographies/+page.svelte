<script lang="ts">
	import BiographyItem from '$lib/components/BiographyItem.svelte';
	import Search from '$lib/search/Search.svelte';
</script>

<article>
	<h1>Biographies</h1>

	<Search dataSource="biographies" title="Biographies" ItemComponent={BiographyItem} />
</article>
