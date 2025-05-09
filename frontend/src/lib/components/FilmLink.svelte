<script lang="ts">
	import { base } from '$app/paths';
	import type { Film } from '$lib/types';

	const { film }: { film: Film } = $props();
</script>

<a href={`${base}/film/${film.slug}`}>
	{film.title.native}
	{#if film.title.english}
		/ {film.title.english}
	{/if}
	({film.release.year})
</a>
