<script lang="ts">
	import FilmItem from '$lib/components/FilmItem.svelte';
	import Search from '$lib/search/Search.svelte';
</script>

<article>
	<h1>Films</h1>

	<Search dataSource="films" title="Films" ItemComponent={FilmItem} />
</article>
