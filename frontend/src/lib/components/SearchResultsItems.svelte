<script lang="ts">
	import { base } from '$app/paths';
	import BiographyLink from '$lib/components/BiographyLink.svelte';
	import type { Film, Item, Person, Role } from '$lib/types';
	import { ClapperboardIcon, UserRoundIcon } from 'lucide-svelte';

	const {
		items,
		start = 1
	}: {
		items: Item[];
		start?: number;
	} = $props();

	function getUniquePersonRoles(roles: Role[]): Role[] {
		return Object.values(
			roles.reduce(
				(acc, role) => {
					if (role.person?.slug && !acc[role.person.slug]) {
						acc[role.person.slug] = role;
					}

					return acc;
				},
				{} as Record<string, Role>
			)
		);
	}

	function getUniqueFilmRoles(roles: Role[]): Role[] {
		return Object.values(
			roles.reduce(
				(acc, role) => {
					if (role.film?.slug && !acc[role.film.slug]) {
						acc[role.film.slug] = role;
					}

					return acc;
				},
				{} as Record<string, Role>
			)
		);
	}
</script>

<p class="key">
	<span>Type:</span>
	<span><ClapperboardIcon /> Film</span>
	<span><UserRoundIcon /> Person</span>
</p>

<hr />

<ol {start}>
	{#each items as item (item.slug)}
		{@const itemType = item?.type?.toLowerCase()}
		<li>
			{#if itemType === 'film'}
				{@const film = item as Film}
				<ClapperboardIcon size={24} />
				<a href={`${base}/${itemType}/${film.slug}`}><strong>{film.title.join(' / ')}</strong></a>
				<ul>
					{#if film?.release?.year}
						<li>
							<time datetime={film.release.date} class="year">{film.release.year}</time>
						</li>
					{/if}
					{#if film?.production}
						{#each film.production as production (production)}
							<li>
								{production.country}
							</li>
						{/each}
					{/if}
				</ul>
				{#if film.roles && film.roles.length > 0}
					{@const roles = getUniquePersonRoles(film.roles)}
					<ul>
						{#each roles as role (role)}
							{@const person = role.person}
							{#if person}
								<li>
									<small>
										{#if typeof person === 'object'}
											<BiographyLink {person} />
										{:else}
											{person}
										{/if}
									</small>
								</li>
							{/if}
						{/each}
					</ul>
				{/if}
			{:else}
				{@const person = item as Person}
				<UserRoundIcon size={24} />
				<a href={`${base}/${itemType}/${person.slug}`}><strong>{person.name}</strong></a>
				{#if person.roles && person.roles.length > 0}
					{@const roles = getUniqueFilmRoles(person.roles)}
					<ul>
						{#each roles as role (role)}
							{@const film = role.film}
							<li>
								<small>
									<a href={`${base}/film/${film?.slug}`}>{film?.title?.native}</a>
								</small>
							</li>
						{/each}
					</ul>
				{/if}
			{/if}
		</li>
	{/each}
</ol>

<style>
	.key {
		display: flex;
		align-items: center;
		gap: calc(var(--pico-spacing) / 2);
	}

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
