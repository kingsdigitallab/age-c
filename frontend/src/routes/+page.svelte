<script lang="ts">
	import { config } from '$lib';
	import { searchConfig } from '$lib/index';
	import SearchResultsItems from '$lib/components/SearchResultsItems.svelte';
	import Search from '$lib/search/Search.svelte';
	import { base } from '$app/paths';

	const dataSource = $state('corpus');
</script>

<section class="hero">
	<h1>{config.siteTitle}</h1>
	<p>{config.siteDescription}</p>
	<a role="button" href="{base}/about"> About </a>
</section>

<Search
	{dataSource}
	{searchConfig}
	title="Explore the dataset"
	SearchResultsItemsComponent={SearchResultsItems}
/>

<style>
	.hero {
		min-height: calc(100vh - var(--pico-spacing) * 10);
		text-align: center;
	}

	.hero h1 {
		--pico-color: var(--pico-secondary);
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
