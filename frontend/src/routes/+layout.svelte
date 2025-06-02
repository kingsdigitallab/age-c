<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { config } from '$lib';
	import DevOnly from '$lib/components/DevOnly.svelte';
	import type { Snippet } from 'svelte';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { PageProps } from './$types';

	import '@picocss/pico';
	import '@picocss/pico/css/pico.slate.min.css';
	import '../app.css';

	const { data, children }: { data: PageProps; children: Snippet } = $props();
	const { searchWorker } = data;

	const headTitle = $derived(
		page.data.title ? `${config.siteName} | ${page.data.title}` : config.siteName
	);
	const headDescription = $derived(page.data.excerpt ? page.data.excerpt : config.siteDescription);
	const headKeywords = $derived(page.data?.tags?.join(', ') ?? config.siteKeywords.join(', '));

	onDestroy(() => {
		setTimeout(() => {
			if (searchWorker) {
				searchWorker.terminate();
			}
		}, 5000);
	});
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={headDescription} />
	<meta name="keywords" content={headKeywords} />
	<link rel="canonical" href={page.url.pathname} />
</svelte:head>

<header class="container-fluid">
	<nav aria-label="Main navigation">
		<ul>
			<li>
				<strong><a href="{base}/">{config.siteName}</a></strong>
				<DevOnly>dev</DevOnly>
			</li>
		</ul>
		<ul>
			<li><a href="{base}/about">About</a></li>
			<li><a href="{base}/glossary">Glossary</a></li>
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

<footer class="container-fluid surface-primary">
	<nav aria-label="Footer navigation">
		<ul class="surface-primary">
			<li>
				<small><a href="{base}/">{config.siteName}</a></small>
			</li>
			<li>
				<small><a href="{base}/accessibility-statement">Accessibility statement</a></small>
			</li>
			<li>
				<small><a href="{base}/_styleguide">Styleguide</a></small>
			</li>
		</ul>
		<ul class="surface-primary">
			<li><small><a href={config.repoUrl}>GitHub</a></small></li>
			<li>
				<code>
					<a href="{config.repoUrl}/blob/v{config.appVersion}/CHANGELOG.md">v{config.appVersion}</a>
				</code>
			</li>
		</ul>
	</nav>
	<p class="surface-primary">
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
		flex-grow: 1;
		padding-block: var(--pico-spacing);
	}

	footer {
		border-top: var(--pico-border-width) solid var(--pico-primary-border);
		padding-block: var(--pico-spacing);
	}

	footer a:not(code a) {
		color: var(--pico-primary-inverse);
	}

	footer p {
		padding-block-start: var(--pico-spacing);
		text-align: center;
	}
</style>
