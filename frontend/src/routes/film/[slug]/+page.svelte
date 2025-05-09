<script lang="ts">
	import CharactersTable from '$lib/components/CharactersTable.svelte';
	import DirectorLink from '$lib/components/DirectorLink.svelte';
	import FilterLink from '$lib/components/FilterLink.svelte';
	import { config } from '$lib/index';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { film } = data;

	const genres = $derived(film?.genre?.sort());
	const tags = $derived(film?.tags?.sort());
	const directors = $derived(film?.director?.sort((a, b) => a.name.localeCompare(b.name)));
	const characters = $derived(
		film?.character?.sort((a, b) => a.person.name.localeCompare(b.person.name))
	);
	const media = $derived(film?.media);
</script>

<article>
	<hgroup>
		<h1>
			{film.title.native}
			{#if film.title.english}
				<small>(original)</small> / {film.title.english}{/if}
		</h1>
		<p class="inline">
			<FilterLink name="filmType" value={film.filmType} />
			<FilterLink name="releaseType" value={film.release.type} />
			<FilterLink name="releaseYear" value={film.release.year} />
			<FilterLink name="productionCountry" value={film.production.country} />
			{#if film.production.share}
				<FilterLink name="productionShare" value={film.production.share} />
			{/if}
		</p>
	</hgroup>

	<dl>
		<dt>Genre</dt>
		<dd class="inline">
			{#each genres as genre}
				<FilterLink name="genre" value={genre} />
			{:else}
				<span>{config.emptyPlaceholder}</span>
			{/each}
		</dd>
		<dt>Tags</dt>
		<dd class="inline">
			{#each tags as tag}
				<FilterLink name="tags" value={tag} />
			{:else}
				<span>{config.emptyPlaceholder}</span>
			{/each}
		</dd>
		<dt>Director</dt>
		<dd class="inline">
			{#each directors as director}
				<DirectorLink {director} />
			{:else}
				<span>{config.emptyPlaceholder}</span>
			{/each}
		</dd>
		{#if media?.posterUrl || media?.trailerUrl}
			<dt>Media</dt>
			<dd>
				{#if media?.posterUrl}
					<a href={media.posterUrl} target="_blank">Poster</a>
				{/if}
				{#if media?.trailerUrl}
					<a href={media.trailerUrl} target="_blank">Trailer</a>
				{/if}
			</dd>
		{/if}
	</dl>

	{#if characters}
		<h2>Characters</h2>
		<CharactersTable {characters} />
	{/if}

	{#if film.synopsis?.native}
		<h2>Synopsis (original)</h2>
		<blockquote>{film.synopsis?.native}</blockquote>
	{/if}

	{#if film.synopsis?.english}
		<h2>Synopsis</h2>
		<blockquote>{film.synopsis?.english}</blockquote>
	{/if}
</article>

<style>
	table > * {
		font-size: 0.8rem;
	}
</style>
