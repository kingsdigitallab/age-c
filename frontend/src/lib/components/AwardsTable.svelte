<script lang="ts">
	import { base } from '$app/paths';
	import type { Award } from '$lib/types';
	import BiographyLink from './BiographyLink.svelte';
	import FilmLink from './FilmLink.svelte';

	const { awards } = $props<{ awards: Award[] }>();

	const hasFilm = awards.some((award: Award) => award.film);
	const hasPerson = awards.some((award: Award) => award.person);
</script>

<table>
	<thead>
		<tr>
			<th>Year</th>
			<th>Award</th>
			<th>Category</th>
			{#if hasFilm}
				<th>Film</th>
			{/if}
			{#if hasPerson}
				<th>Person</th>
			{/if}
			<th>Result</th>
		</tr>
	</thead>
	<tbody>
		{#each awards as award}
			<tr>
				<td>{award.year}</td>
				<td>{award.award}</td>
				<td>{award.category}</td>
				{#if hasFilm}
					<td><FilmLink film={award.film} /></td>
				{/if}
				{#if hasPerson}
					<td><BiographyLink person={award.person} showAgeGender={false} /></td>
				{/if}
				<td>{award.result}</td>
			</tr>
		{/each}
	</tbody>
</table>
