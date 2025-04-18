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

<style>
	output {
		font-size: 90%;
		opacity: 60%;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
</style>
