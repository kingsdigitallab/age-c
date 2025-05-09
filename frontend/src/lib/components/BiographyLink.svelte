<script lang="ts">
	import { base } from '$app/paths';
	import type { Person } from '$lib/types';

	const { person, showAgeGender = true }: { person: Person; showAgeGender?: boolean } = $props();
</script>

{#if person?.slug}
	<a href={`${base}/biography/${person?.slug}`}>
		{person?.name}
		{#if showAgeGender}
			({person?.birthYear}–{person?.deathYear}, {person?.gender})
		{/if}
	</a>
{/if}
