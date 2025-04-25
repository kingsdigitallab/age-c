<script lang="ts">
	import FilmItem from '$lib/components/FilmsTable.svelte';
	import Search from '$lib/search/Search.svelte';
</script>

<Search dataSource="films" title="Films" ItemComponent={FilmItem} />
