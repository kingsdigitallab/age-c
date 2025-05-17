<script lang="ts">
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	const { title, content } = data;
</script>

<article>
	<h1>{title}</h1>
	{@html content.body}
</article>
