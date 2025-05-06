<script lang="ts">
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { bio } = data;
</script>

<article>
	<hgroup>
		<h1>{bio.name}</h1>
	</hgroup>

	<dl>
		<dt>Gender</dt>
		<dd>{bio.gender}</dd>
	</dl>
</article>
