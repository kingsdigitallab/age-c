<script lang="ts">
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
			<a href={`/${item.type}/${item.slug}`}>{item.title}</a>
		</li>
	{/each}
</ol>
