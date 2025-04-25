<script lang="ts">
	import BiographyItem from '$lib/components/BiographiesTable.svelte';
	import Search from '$lib/search/Search.svelte';
</script>

<Search dataSource="biographies" title="Biographies" ItemComponent={BiographyItem} />
