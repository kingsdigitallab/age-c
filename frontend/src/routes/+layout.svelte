<script lang="ts">
	import { dev } from '$app/environment';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { config } from '$lib';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	import '@picocss/pico';
	import '@picocss/pico/css/pico.zinc.css';
	import '@picocss/pico/css/pico.colors.css';
	import '../app.css';

	const { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	{#if page.data.title}
		<title>{config.siteName} | {page.data.title}</title>
	{:else}
		<title>{config.siteName}</title>
	{/if}
	<meta name="description" content={config.siteDescription} />
	<meta name="keywords" content={config.siteKeywords.join(', ')} />
</svelte:head>

<header class="container">
	<nav aria-label="Main navigation">
		<ul>
			<li>
				<strong><a href={`${base}/`}>{config.siteName}</a></strong>
				{#if dev}<mark>dev</mark>{/if}
			</li>
		</ul>
		<ul>
			<li><a href={`${base}/about`}>About</a></li>
		</ul>
	</nav>
</header>

<main class="container">
	{#key page.url.pathname}
		<div transition:fade={{ duration: 100 }}>
			{#if children}
				{@render children()}
			{/if}
		</div>
	{/key}
</main>

<footer class="container">
	<nav aria-label="Footer navigation">
		<ul>
			<li><small>{config.siteName}</small></li>
		</ul>
		<ul>
			<li><small><a href={config.repoUrl}>GitHub</a></small></li>
			<li>
				<code>
					<a href="{config.repoUrl}/blob/v{config.appVersion}/CHANGELOG.md">v{config.appVersion}</a>
				</code>
			</li>
		</ul>
	</nav>
	<p>
		<small>
			Designed and developed by
			<a href="https://kdl.kcl.ac.uk/">King's Digital Lab</a>
		</small>
	</p>
</footer>

<style>
	header {
		border-bottom: var(--pico-border-width) solid var(--pico-primary-border);
	}

	main {
		padding-block: var(--pico-spacing);
	}

	footer {
		border-top: var(--pico-border-width) solid var(--pico-primary-border);
	}

	footer code {
		--pico-font-family: var(--pico-font-family);
	}

	footer p {
		text-align: center;
	}
</style>
