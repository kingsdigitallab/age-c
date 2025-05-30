<script lang="ts">
	import { hero, searchConfig } from '$lib/index';
	import DataInsights from '$lib/components/insights/DataInsights.svelte';
	import SearchResultsItems from '$lib/components/SearchResultsItems.svelte';
	import Search from '$lib/search/Search.svelte';
	import { base } from '$app/paths';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { searchWorker } = data;

	const dataSource = $state('corpus');
</script>

<section class="hero">
	<h1 class="font-gothic">{hero.title.toUpperCase()}</h1>
	<h2>{hero.description}</h2>
	<p>
		<a role="button" href="{base}/about"> About </a>
	</p>
</section>

{#if searchWorker}
	<Search
		{dataSource}
		{searchConfig}
		{searchWorker}
		title="Explore the dataset"
		sortBy="film_title_asc"
		summaryFacet="type"
		dataInsightsFacets={[
			{
				facet: 'releaseYear',
				title: 'Films released per year',
				dynamicTitle: (count) => `Number of films released over ${count} years`
			},
			{
				facet: 'role',
				title: 'Cast and crew roles'
			},
			{
				facet: 'gender',
				title: 'Cast and crew gender'
			},
			{
				facet: 'characterAge',
				title: 'Character age groups'
			},
			{
				facet: 'characterSexuality',
				title: 'Character sexual orientation'
			}
		]}
		enableFullDataInsights={true}
		fullDataInsightsPerPage={15000}
		DataInsightsComponent={DataInsights}
		searchInputInFilters={true}
		SearchResultsItemsComponent={SearchResultsItems}
	/>
{:else}
	<article>
		<header>
			<h2>An error occurred</h2>
			<output>Undefined search worker</output>
		</header>
		<p>
			Please check your browser console for more details.
			<br />
			You can also try refreshing the page.
		</p>
	</article>
{/if}

<style>
	.hero {
		min-height: calc(100vh - var(--pico-spacing) * 10);
		text-align: center;
	}

	.hero h1 {
		--pico-color: var(--age-c-black);
		--pico-font-size: clamp(4rem, 25vw, 15rem);
		--pico-font-weight: 400;

		font-stretch: ultra-condensed;
		letter-spacing: -0.02rem;
		line-height: 0.8;
		text-align: center;
		text-transform: uppercase;
		text-wrap: balance;
	}

	.hero h2 {
		--pico-color: var(--age-c-black);
		--pico-font-size: clamp(1.5rem, 3vw, 3rem);

		font-weight: 600;
		margin-block-end: clamp(2rem, 10vh, 6rem);
		max-inline-size: 50%;
		margin-inline: auto;
		text-wrap: balance;
	}
</style>
