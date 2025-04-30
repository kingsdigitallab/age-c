<script lang="ts">
	import { base } from '$app/paths';
	import type { Item } from '$lib/types';

	const {
		items
	}: {
		items: Item[];
	} = $props();
</script>

<ol>
	{#each items as item}
		<li>
			<a href={`${base}/${item.type}/${item.slug}`}>{item.title}</a>
		</li>
	{/each}
</ol>
