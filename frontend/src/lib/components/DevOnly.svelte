<script lang="ts">
	import { dev } from '$app/environment';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

{#if dev}
	<code>
		{@render children?.()}
	</code>
{/if}

<style>
	code {
		margin-block: 0.25rem;
	}
</style>
