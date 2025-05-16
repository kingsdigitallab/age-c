<script lang="ts">
	import { config } from '$lib';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	const { metadata, content } = data;
</script>

<svelte:head>
	<title>{metadata?.title} | {config.siteName}</title>
	<meta name="description" content={metadata?.excerpt} />
	<meta name="tags" content={metadata?.tags?.join(', ') ?? ''} />
</svelte:head>

<article>
	<h1>{metadata?.title}</h1>
	{@render content?.()}
</article>
