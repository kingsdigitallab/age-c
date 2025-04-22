<script lang="ts">
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { bio } = data;
</script>

<article>
	<hgroup>
		<h1>{bio.perName}</h1>
	</hgroup>

	<dl>
		<dt>Gender</dt>
		<dd>{bio.perGender}</dd>
	</dl>
</article>
