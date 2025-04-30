<script lang="ts">
	import { config } from '$lib';
	import { searchConfig } from '$lib/index';
	import Search from '$lib/search/Search.svelte';

	const dataSource = $state('corpus');
</script>

<section>
	<h1>{config.siteTitle}</h1>
</section>

<Search {dataSource} {searchConfig} title="Explore the dataset" />

<style>
	h1 {
		--pico-color: var(--pico-secondary);
		--pico-font-family: var(--font-family-gothic);
		--pico-font-size: clamp(4rem, 20vw, 12rem);
		--pico-font-weight: 400;

		font-stretch: ultra-condensed;
		text-align: center;
		text-wrap: balance;
	}
</style>
