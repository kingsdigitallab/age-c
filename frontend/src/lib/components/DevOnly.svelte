<script lang="ts">
	import { dev } from '$app/environment';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();

	let debug = $state(false);
	const showDebugElements = $derived(dev && debug);
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.ctrlKey || e.metaKey) {
			if (e.shiftKey) {
				if (e.key === 'e' || e.key === 'E') {
					debug = !debug;
				}
			}
		}
	}}
/>

{#if showDebugElements}
	<code>
		{@render children?.()}
	</code>
{/if}

<style>
	code {
		margin-block: 0.25rem;
	}
</style>
