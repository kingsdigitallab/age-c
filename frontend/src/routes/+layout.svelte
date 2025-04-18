<script lang="ts">
	import { dev } from '$app/environment';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { config } from '$lib';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	import '@picocss/pico';
	import '@picocss/pico/css/pico.fuchsia.css';
	import '@picocss/pico/css/pico.colors.css';
	import '../app.css';

	const { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	{#if page.data.title}
		<title>{config.title} | {page.data.title}</title>
	{:else}
		<title>{config.title}</title>
	{/if}
</svelte:head>

<div class="container">
	<header>
		<nav>
			<ul>
				<li>
					<strong><a href={`${base}/`}>{config.title}</a></strong>
					{#if dev}<mark>dev</mark>{/if}
				</li>
			</ul>
			<ul>
				<li><a href={`${base}/about`}>About</a></li>
				<li><a href={`${base}/films`}>Films</a></li>
				<li><a href={`${base}/biographies`}>Biographies</a></li>
			</ul>
		</nav>
	</header>

	<main transition:fade>
		{#if children}
			{@render children()}
		{/if}
	</main>

	<footer>
		<nav>
			<ul>
				<li><small>{config.title}</small></li>
			</ul>
		</nav>
		<p>
			<small>
				Designed and developed by
				<a href="https://kdl.kcl.ac.uk/">King's Digital Lab</a>
			</small>
		</p>
	</footer>
</div>

<style>
	div.container {
		align-items: start;
		display: grid;
		grid-template-rows: auto 1fr auto;
		min-height: 100vh;
	}

	header {
		border-bottom: var(--pico-border-width) solid var(--pico-primary-border);
	}

	main {
		padding-block: var(--pico-spacing);
	}

	footer {
		border-top: var(--pico-border-width) solid var(--pico-primary-border);
	}
</style>
