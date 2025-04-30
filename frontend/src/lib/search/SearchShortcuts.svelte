<script lang="ts">
	const {
		onToggleSearch
	}: {
		onToggleSearch: () => void;
	} = $props();
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.ctrlKey || e.metaKey) {
			if (e.key === 'k' || e.key === 'K') {
				e.preventDefault();
				onToggleSearch();
			}
		}
	}}
/>
