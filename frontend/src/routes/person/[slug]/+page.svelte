<script lang="ts">
	import FilterLink from '$lib/components/FilterLink.svelte';
	import CharactersTable from '$lib/components/CharactersTable.svelte';
	import RolesTable from '$lib/components/PersonRolesTable.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { bio } = data;

	const characters = $derived(
		bio.characters?.sort((a, b) =>
			(a.film?.title?.native ?? '').localeCompare(b.film?.title?.native ?? '')
		)
	);
	const roles = $derived(
		bio.roles?.sort((a, b) =>
			(a.film?.title?.native ?? '').localeCompare(b.film?.title?.native ?? '')
		)
	);
</script>

<article>
	<hgroup>
		<h1>{bio.name}</h1>
		<p class="layout-inline">
			{#if bio.birthYear || bio.deathYear}
				<span>{bio.birthYear || ''}–{bio.deathYear || ''}</span>
			{/if}
			<FilterLink name="gender" value={bio.gender} />
			<FilterLink name="nationality" value={bio.nationality} />
		</p>
	</hgroup>

	{#if roles && roles.length > 0}
		<h2>Roles</h2>
		<RolesTable {roles} />
	{/if}

	{#if characters && characters.length > 0}
		<h2>Characters</h2>
		<CharactersTable {characters} linkToFilm />
	{/if}
</article>
