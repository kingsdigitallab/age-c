<script lang="ts">
	import type { Character, Film, Person } from '$lib/types';
	import BiographyLink from './BiographyLink.svelte';
	import FilmLink from './FilmLink.svelte';
	import FilterLink from './FilterLink.svelte';

	const { characters, linkToFilm = false }: { characters: Character[]; linkToFilm?: boolean } =
		$props();
</script>

<div class="overflow-auto">
	<table class="striped">
		<thead>
			<tr>
				<th>{linkToFilm ? 'Film' : 'Actor'}</th>
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
								<FilmLink film={character.film as Film} />
							{:else}
								<BiographyLink person={character?.person as Person} showAgeGender={false} />
							{/if}
						</strong>
					</td>
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
</div>
