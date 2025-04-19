<script lang="ts">
	import { config } from '$lib';
</script>

<h1>{config.fullTitle}</h1>

<style>
	h1 {
		--pico-color: var(--pico-secondary);
		--pico-font-family: var(--font-family-gothic);
		--pico-font-size: clamp(4rem, 20vw, 10rem);
		--pico-font-weight: 800;

		font-stretch: ultra-condensed;
	}
</style>
