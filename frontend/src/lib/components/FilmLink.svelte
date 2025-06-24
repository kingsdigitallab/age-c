<script lang="ts">
	import { base } from '$app/paths';
	import type { Film } from '$lib/types';

	const { film }: { film: Film } = $props();
</script>

{#if typeof film === 'object'}
	<a href={`${base}/film/${film.slug}`}>
		{film.title.native}
		{#if film.title.english}
			/ {film.title.english}
		{/if}
		{#if film.release?.year}
			({film.release?.year})
		{/if}
	</a>
{:else}
	<span>{film}</span>
{/if}
