<script lang="ts">
	import type { Item } from '$lib/types';

	const { item = undefined }: { item: Item | undefined } = $props();
</script>

{#if item}
	<strong>{item.perName}</strong>
{/if}
