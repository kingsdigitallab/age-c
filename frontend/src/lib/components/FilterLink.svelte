<script lang="ts">
	import { base as basePath } from '$app/paths';
	import type { Snippet } from 'svelte';

	const {
		name,
		value,
		base,
		children
	}: { name: string; value: string; base?: string; children: Snippet } = $props();

	const root = base ?? basePath;
</script>

<a href={`${root}/?filters={"${name}"%3A["${value}"]}#skij`}>
	{#if children}
		{@render children()}
	{:else}
		{value}
	{/if}
</a>
