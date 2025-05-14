<script lang="ts">
	import { config } from '$lib';
	import { searchConfig } from '$lib/index';
	import SearchResultsItems from '$lib/components/SearchResultsItems.svelte';
	import Search from '$lib/search/Search.svelte';
	import { base } from '$app/paths';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { searchWorker } = data;

	const dataSource = $state('corpus');
</script>

<section class="hero">
	<h1>{config.siteTitle}</h1>
	<p>{config.siteDescription}</p>
	<a role="button" href="{base}/about"> About </a>
</section>

{#if searchWorker}
	<Search
		{dataSource}
		{searchConfig}
		{searchWorker}
		title="Explore the dataset"
		sortBy="film_title_asc"
		summaryFacet="type"
		distributionFacets={[
			{
				facet: 'releaseYear',
				title: 'Release year distribution'
			},
			{
				facet: 'role',
				title: 'Role distribution'
			},
			{
				facet: 'gender',
				title: 'Gender distribution'
			},
			{
				facet: 'characterAge',
				title: 'Character age distribution'
			},
			{
				facet: 'characterSexuality',
				title: 'Character sexuality distribution'
			}
		]}
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
		--pico-color: var(--pico-primary);
		--pico-font-family: var(--font-family-gothic);
		--pico-font-size: clamp(4rem, 20vw, 10rem);
		--pico-font-weight: 400;

		font-stretch: ultra-condensed;
		text-align: center;
		text-wrap: balance;
	}

	.hero p {
		--pico-font-size: clamp(1.5rem, 5vw, 2rem);
	}
</style>
