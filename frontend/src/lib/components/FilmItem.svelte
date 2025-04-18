<script lang="ts">
	import type { Item } from '$lib/types';

	const { item = undefined }: { item: Item | undefined } = $props();
</script>

{#if item}
	<strong>{item.title}</strong>
	{#if item.titleEn}
		<em>({item.titleEn})</em>
	{/if}
{/if}
