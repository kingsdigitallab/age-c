<script lang="ts">
	import { config } from '$lib';
	import type { Snippet } from 'svelte';

	const {
		title,
		excerpt,
		tags,
		children
	}: { title: string; excerpt: string; tags: string[]; children: Snippet } = $props();
</script>

<svelte:head>
	<title>{title} | {config.siteName}</title>
	<meta name="description" content={excerpt} />
	<meta name="tags" content={tags?.join(', ') ?? ''} />
</svelte:head>

<article>
	<h1>{title}</h1>
	{@render children?.()}
</article>
