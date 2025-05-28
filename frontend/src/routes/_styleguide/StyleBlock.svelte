<script>
	const { children } = $props();

	/**
	 * @param {HTMLElement} node
	 */
	function escapeHtml(node) {
		const content = node.innerHTML;
		node.textContent = content
			.replaceAll('<!---->', '')
			.replaceAll(/\s?s-\w+\b/g, '')
			.replaceAll(' class=""', '');

		return {
			update() {
				node.textContent = node.innerHTML;
			}
		};
	}
</script>

<section class="style-block">
	{@render children?.()}

	{#if children}
		<details>
			<summary>Code</summary>
			<pre class="surface-4"><code use:escapeHtml>{@render children?.()}</code></pre>
		</details>
	{/if}
</section>

<style>
	:global(.style-block > *) {
		padding-block: var(--pico-spacing);
	}

	pre {
		border-radius: var(--pico-radius);
	}

	code {
		font-family: var(--font-monospace);
	}
</style>
