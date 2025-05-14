<script>
	import { page } from '$app/state';
</script>

<article>
	<header>
		<h1>{page.status}</h1>
		<output>{page.error?.message}</output>
	</header>
	<p>Error loading the page {page.url.pathname}.</p>
</article>
