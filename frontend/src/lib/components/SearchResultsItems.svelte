<script lang="ts">
	import { base } from '$app/paths';
	import type { Item } from '$lib/types';

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
			<a href={`${base}/${itemType}/${item.slug}`}><strong>{item.title}</strong></a>
			{#if itemType === 'film'}
				<ul>
					{#if item?.release?.year}
						<li>
							<time datetime={item.release.date} class="year">{item.release.year}</time>
						</li>
					{/if}
					{#if item?.production?.country}
						<li>
							{item.production.country}
						</li>
					{/if}
				</ul>
				{#if item.director && item.director.length > 0}
					<ul>
						<li>Director</li>
						{#each item.director as director}
							<li>
								<a href={`${base}/biography/${director.slug}`}
									>{director.name} ({director.birthYear}–{director.deathYear}, {director.gender})</a
								>
							</li>
						{/each}
					</ul>
				{/if}
				{#if item.character && item.character.length > 0}
					<ul>
						{#each item.character as character}
							{@const person = character.person}
							<li>
								<a href={`${base}/biography/${person?.slug}`}
									>{person?.name}
									({person?.birthYear}–{person?.deathYear}, {person?.gender})
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			{:else}
				{#if item.director && item.director.length > 0}
					<ul>
						<li>Director</li>
						{#each item.director as director}
							<li>
								<a href={`${base}/film/${director.slug}`}>{director.title?.native}</a>
							</li>
						{/each}
					</ul>
				{/if}
				{#if item.character && item.character.length > 0}
					<ul>
						<li>Character</li>
						{#each item.character as character}
							{@const film = character.film}
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
