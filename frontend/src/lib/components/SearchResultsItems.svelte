<script lang="ts">
	import { base } from '$app/paths';
	import BiographyLink from '$lib/components/BiographyLink.svelte';
	import type { Film, Item, Person } from '$lib/types';

	const {
		items,
		start = 1
	}: {
		items: Item[];
		start?: number;
	} = $props();
</script>

<ol {start}>
	{#each items as item}
		{@const itemType = item.type.toLowerCase()}
		<li>
			{#if itemType === 'film'}
				{@const film = item as Film}
				<a href={`${base}/${itemType}/${film.slug}`}><strong>{film.title.join(' / ')}</strong></a>
				<ul>
					{#if film?.release?.year}
						<li>
							<time datetime={film.release.date} class="year">{film.release.year}</time>
						</li>
					{/if}
					{#if film?.production}
						{#each film.production as production}
							<li>
								{production.country}
							</li>
						{/each}
					{/if}
				</ul>
				{#if film.roles && film.roles.length > 0}
					{@const roles = film.roles}
					<ul>
						{#each roles as role}
							{@const person = role.person}
							{#if person}
								<li>
									{#if typeof person === 'object'}
										<BiographyLink {person} />
									{:else}
										{person}
									{/if}
								</li>
							{/if}
						{/each}
					</ul>
				{/if}
			{:else}
				{@const person = item as Person}
				<a href={`${base}/${itemType}/${person.slug}`}><strong>{person.name}</strong></a>
				{#if person.roles && person.roles.length > 0}
					<ul>
						<li>Roles</li>
						{#each person.roles as role}
							{@const film = role.film}
							<li>
								<a href={`${base}/film/${film?.slug}`}>{film?.title?.native} </a>
							</li>
						{/each}
					</ul>
				{/if}
			{/if}
		</li>
	{/each}
</ol>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	ul > li {
		list-style: none;
	}

	ul > li:not(:last-child) {
		margin-right: calc(var(--pico-spacing) / 2);
	}

	ul > li:not(:last-child)::after {
		content: ', ';
	}
</style>
