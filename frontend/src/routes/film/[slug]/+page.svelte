<script lang="ts">
	import BiographyLink from '$lib/components/BiographyLink.svelte';
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
		<p class="metadata">
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
		<dd>
			{#each genres as genre}
				<FilterLink name="genre" value={genre} />
			{:else}
				<span>{config.emptyPlaceholder}</span>
			{/each}
		</dd>
		<dt>Tags</dt>
		<dd>
			{#each tags as tag}
				<FilterLink name="tags" value={tag} />
			{:else}
				<span>{config.emptyPlaceholder}</span>
			{/each}
		</dd>
		<dt>Director</dt>
		<dd>
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
		<table>
			<thead>
				<tr>
					<th>Actor</th>
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
			{#each characters as character}
				<tr>
					<td><BiographyLink person={character?.person} showAgeGender={false} /></td>
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
		</table>
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
	.metadata,
	dd {
		display: flex;
		flex-wrap: wrap;
		gap: calc(var(--pico-spacing) / 4);
	}

	:global(.metadata *:not(:last-child)::after),
	:global(dd *:not(:last-child)::after) {
		content: ',';
	}

	table > * {
		font-size: 0.8rem;
	}
</style>
