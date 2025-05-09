<script lang="ts">
	import { base } from '$app/paths';
	import type { Director } from '$lib/types';

	const { director }: { director: Director } = $props();
</script>

<a href={`${base}/biography/${director.slug}`}
	>{director.name} ({director.birthYear}–{director.deathYear}, {director.gender})</a
>
