<script lang="ts">
	import { base } from '$app/paths';

	const { name, value }: { name: string; value: string } = $props();
</script>

<a href={`${base}/?filters={"${name}"%3A["${value}"]}#skij`}>{value}</a>
