<script lang="ts">
	import { base } from '$app/paths';
	import type { Snippet } from 'svelte';

	const {
		name,
		value,
		children
	}: { name: string; value: string | number | undefined; children?: Snippet } = $props();
</script>

{#if value}
	<a href="{base}/?filters={JSON.stringify({ [name]: [value] })}&#skij">
		{#if children}
			{@render children()}
		{:else}
			{value}
		{/if}
	</a>
{:else if children}
	{@render children()}
{:else}
	<mark>{value}</mark>
{/if}
