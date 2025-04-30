<script lang="ts">
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { film } = data;
</script>

<article>
	<hgroup>
		<h1>{film.title.native}</h1>
		<p>{film.release.year}</p>
		<p><em>{film.title.english}</em></p>
	</hgroup>

	<blockquote>{film.synopsis.english}</blockquote>

	<dl>
		<dt>Genre</dt>
		<dd>
			{film?.genre?.join(', ') || 'Unknown'}
		</dd>
	</dl>
</article>
