<script lang="ts">
	import { base } from '$app/paths';
	import type { Person } from '$lib/types';

	const { person, showAgeGender = true }: { person: Person; showAgeGender?: boolean } = $props();
</script>

{#if person?.slug}
	<a href={`${base}/person/${person?.slug}`}>
		{person?.name}
		{#if showAgeGender}
			{#if person.birthYear || person.deathYear}
				({person?.birthYear || ''}–{person?.deathYear || ''}, {person?.gender || ''})
			{:else}
				({person?.gender || ''})
			{/if}
		{/if}
	</a>
{/if}
