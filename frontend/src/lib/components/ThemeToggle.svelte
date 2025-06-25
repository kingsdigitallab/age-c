<script>
	import { browser } from '$app/environment';
	import { MoonIcon, SunIcon } from 'lucide-svelte';

	let theme = (browser && localStorage.getItem('data-theme')) || 'light';

	if (browser) {
		const preference = window.matchMedia('(prefers-color-scheme: dark)');

		if (preference.matches) {
			theme = 'dark';
		}

		setTheme();

		preference.addEventListener('change', (mediaQuery) => {
			if (mediaQuery.matches) {
				theme = 'dark';
			} else {
				theme = 'light';
			}

			setTheme();
		});
	}

	function setTheme() {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('data-theme', theme);
	}

	function handleThemeToggle() {
		theme = theme === 'light' ? 'dark' : 'light';

		setTheme();
	}
</script>

<svelte:head>
	<script type="module">
		let theme = localStorage.getItem('data-theme') || 'light';
		const preference = window.matchMedia('(prefers-data-theme: dark)');

		if (preference.matches) {
			theme = 'dark';
		}

		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('data-theme', theme);
	</script>
</svelte:head>

<button on:click={handleThemeToggle} aria-label="Toggle colour scheme">
	{#if theme === 'light'}
		<SunIcon />
	{:else}
		<MoonIcon />
	{/if}
</button>

<style>
	button {
		background: none;
		border: none;
		color: var(--pico-primary);
		display: inline;
		margin: 0;
		padding: 0;
		text-decoration: underline;
	}

	button:hover {
		color: var(--pico-primary-hover);
		text-decoration: none;
	}
</style>
