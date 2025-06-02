<script lang="ts">
	import { base } from '$app/paths';
	import type { Person } from '$lib/types';

	const { director }: { director: Person } = $props();
</script>

{#if typeof director === 'object'}
	<a href={`${base}/biography/${director.slug}`}>
		{director.name}
		({director.birthYear || ''}–{director.deathYear || ''}, {director.gender})
	</a>
{:else}
	<span>{director}</span>
{/if}
