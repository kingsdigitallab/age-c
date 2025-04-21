<script lang="ts">
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { film } = data;
</script>

<article>
	<hgroup>
		<h1>{film.title}</h1>
		<p>{film.releaseYear}</p>
		<p><em>{film.titleEn}</em></p>
	</hgroup>

	<blockquote>{film.synopsisEn || film.synopsis}</blockquote>

	<dl>
		<dt>Genre</dt>
		<dd>
			{Array.isArray(film?.genre) ? film?.genre?.join(', ') : film?.genre || 'Unknown'}
		</dd>
	</dl>
</article>
