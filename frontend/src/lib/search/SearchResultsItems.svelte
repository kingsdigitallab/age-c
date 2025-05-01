<script lang="ts">
	import { base } from '$app/paths';
	import type { Item } from '$lib/types';

	const {
		items,
		start = 1
	}: {
		items: Item[];
		start?: number;
	} = $props();
</script>

<ol {start}>
	{#each items as item}
		<li>
			<a href={`${base}/${item.type}/${item.slug}`}>{item.title}</a>
		</li>
	{/each}
</ol>
