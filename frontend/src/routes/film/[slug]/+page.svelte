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
	const directors = $derived(
		film?.director?.sort((a, b) => (a?.slug ?? '').localeCompare(b?.slug ?? ''))
	);
	const characters = $derived(
		film?.character?.sort((a, b) => (a?.person?.name ?? '').localeCompare(b?.person?.name ?? ''))
	);
	const media = $derived(
		Object.entries(film?.media ?? {})
			.filter(([_, value]) => typeof value === 'string' && value.startsWith('http'))
			.map(([key, value]) => ({
				label: key
					.replace(/Url$/, '')
					.trim()
					.replace(/^\w/, (c) => c.toUpperCase()),
				url: value
			}))
			.sort((a, b) => a.label.localeCompare(b.label))
	);
</script>

<article>
	<hgroup>
		<h1>
			{film.title.native}
			{#if film.title.english}
				<small>(original)</small> / {film.title.english}{/if}
		</h1>
		<p class="layout-inline">
			<FilterLink name="filmType" value={film.filmType} />
			<FilterLink name="releaseType" value={film.release.type} />
			<FilterLink name="releaseYear" value={film.release.year} />
			{#each film.production as { country, share }}
				<FilterLink name="productionCountry" value={country} />
				<FilterLink name="productionShare" value={share} />
			{/each}
		</p>
	</hgroup>

	<dl>
		<dt>Genre</dt>
		<dd class="layout-inline">
			{#each genres as genre}
				<FilterLink name="genre" value={genre} />
			{:else}
				<span>{config.emptyPlaceholder}</span>
			{/each}
		</dd>
		<dt>Tags</dt>
		<dd class="layout-inline">
			{#each tags as tag}
				<FilterLink name="tags" value={tag} />
			{:else}
				<span>{config.emptyPlaceholder}</span>
			{/each}
		</dd>
		<dt>Director</dt>
		<dd class="layout-inline">
			{#each directors as director}
				<DirectorLink {director} />
			{:else}
				<span>{config.emptyPlaceholder}</span>
			{/each}
		</dd>
		{#if media && media.length > 0}
			<dt>Media</dt>
			<dd class="layout-inline">
				{#each media as { label, url }}
					<a href={url} aria-label="{label} for {film.title.native}" target="_blank">{label}</a>
				{/each}
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
