<script lang="ts">
	import { config } from '$lib/index';
	import type { Character } from '$lib/types';
	import BiographyLink from './BiographyLink.svelte';
	import FilmLink from './FilmLink.svelte';
	import FilterLink from './FilterLink.svelte';

	const { characters, linkToFilm = false }: { characters: Character[]; linkToFilm?: boolean } =
		$props();
</script>

<table>
	<thead>
		<tr>
			<th>{linkToFilm ? 'Film' : 'Actor'}</th>
			<th>Role</th>
			<th>Age</th>
			<th>Gender</th>
			<th>Sexuality</th>
			<th>Origin</th>
			<th>Class</th>
			<th>Profession</th>
			<th>Ability</th>
			<th>Assisted Mobility</th>
		</tr>
	</thead>
	<tbody>
		{#each characters as character}
			<tr>
				<td>
					<strong>
						{#if linkToFilm}
							<FilmLink film={character.film} />
						{:else}
							<BiographyLink person={character?.person} showAgeGender={false} />
						{/if}
					</strong>
				</td>
				<td>{character?.role || config.emptyPlaceholder}</td>
				<td><FilterLink name="characterAge" value={character?.age} /></td>
				<td><FilterLink name="characterGender" value={character?.gender} /></td>
				<td><FilterLink name="characterSexuality" value={character?.sexuality} /></td>
				<td><FilterLink name="characterOrigin" value={character?.origin} /></td>
				<td><FilterLink name="characterClass" value={character?.class} /></td>
				<td><FilterLink name="characterProfession" value={character?.profession} /></td>
				<td><FilterLink name="characterAbility" value={character?.ability} /></td>
				<td><FilterLink name="assistedMobility" value={character?.assistedMobility} /></td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table > * {
		font-size: 0.8rem;
	}
</style>
