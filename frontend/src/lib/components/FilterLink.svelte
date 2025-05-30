<script lang="ts">
	import { base } from '$app/paths';
	import type { Snippet } from 'svelte';

	const { name, value, children }: { name: string; value: string; children: Snippet } = $props();
</script>

<a href="{base}/?filters={JSON.stringify({ [name]: [value] })}&#skij">
	{#if children}
		{@render children()}
	{:else}
		{value}
	{/if}
</a>
