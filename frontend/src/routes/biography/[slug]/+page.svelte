<script lang="ts">
	import CharactersTable from '$lib/components/CharactersTable.svelte';
	import FilmLink from '$lib/components/FilmLink.svelte';
	import FilterLink from '$lib/components/FilterLink.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { bio } = data;

	const directors = $derived(bio.director);
	const characters = $derived(
		bio.character?.sort((a, b) => a.film.title.native.localeCompare(b.film.title.native))
	);
</script>

<article>
	<hgroup>
		<h1>{bio.name}</h1>
		<p class="inline">
			<span>{bio.birthYear}–{bio.deathYear}</span>
			<FilterLink name="gender" value={bio.gender} />
			<FilterLink name="nationality" value={bio.nationality} />
		</p>
	</hgroup>

	{#if directors}
		<h2>Director</h2>
		<ul>
			{#each directors as director}
				<li><FilmLink film={director} /></li>
			{/each}
		</ul>
	{/if}

	{#if characters}
		<h2>Characters</h2>
		<CharactersTable {characters} linkToFilm />
	{/if}
</article>
