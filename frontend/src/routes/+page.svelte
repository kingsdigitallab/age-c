<script lang="ts">
	import { config } from '$lib';
</script>

<h1>{config.siteTitle}</h1>

<style>
	h1 {
		--pico-color: var(--pico-secondary);
		--pico-font-family: var(--font-family-gothic);
		--pico-font-size: clamp(4rem, 25vw, 16rem);
		--pico-font-weight: 400;

		font-stretch: ultra-condensed;
	}
</style>
