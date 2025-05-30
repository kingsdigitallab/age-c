<script>
	import { base } from '$app/paths';
	import StyleBlock from './StyleBlock.svelte';

	const themes = ['light', 'dark'];
	const colourVariants = ['primary', 'secondary', 'contrast'];
</script>

<article class="style-guide">
	<h1>Style Guide</h1>

	<section class="grid">
		{#each themes as theme}
			<article data-theme={theme}>
				<header>
					<h2>{theme.charAt(0).toUpperCase() + theme.slice(1)} theme</h2>
				</header>

				<section>
					<h3>Typography</h3>
					<StyleBlock>
						<div class="font-default">
							<h4>Default font</h4>
							<p>'Urbanist Variable', var(--pico-font-family-sans-serif);</p>
						</div>
					</StyleBlock>
					<StyleBlock>
						<div class="font-gothic">
							<h4>Gothic font</h4>
							<p>'League Gothic Variable', var(--pico-font-family-sans-serif);</p>
						</div>
					</StyleBlock>
					<StyleBlock>
						<div>
							<h1>Heading 1</h1>
							<h2>Heading 2</h2>
							<h3>Heading 3</h3>
							<h4>Heading 4</h4>
							<h5>Heading 5</h5>
							<h6>Heading 6</h6>
							<p>Paragraph</p>
							<p>
								<strong>Strong</strong>
							</p>
							<p>
								<em>Emphasis</em>
							</p>
						</div>
					</StyleBlock>
				</section>

				<section>
					<h3>Colours</h3>
					<StyleBlock>
						<div class="surface-primary">Primary</div>
					</StyleBlock>
					<StyleBlock>
						<div class="surface-secondary">Secondary</div>
					</StyleBlock>
					<StyleBlock>
						<div class="surface-contrast">Contrast</div>
					</StyleBlock>
				</section>

				<secion>
					<h3>Links</h3>
					<StyleBlock>
						<a href={base}>Primary</a>
					</StyleBlock>
					<StyleBlock>
						<a href={base} class="secondary">Secondary</a>
					</StyleBlock>
					<StyleBlock>
						<a href={base} class="contrast">Contrast</a>
					</StyleBlock>
				</secion>

				<section>
					<h3>Buttons</h3>
					{#each colourVariants as variant}
						<StyleBlock>
							<button class={variant}>{variant.charAt(0).toUpperCase() + variant.slice(1)}</button>
						</StyleBlock>
					{/each}
					{#each colourVariants as variant}
						<StyleBlock>
							<button class="{variant} outline"
								>{variant.charAt(0).toUpperCase() + variant.slice(1)}</button
							>
						</StyleBlock>
					{/each}
				</section>

				<section>
					<h3>Forms</h3>
					<StyleBlock>
						<input type="text" placeholder="Text input" />
					</StyleBlock>
					<StyleBlock>
						<input type="search" placeholder="Search input" />
					</StyleBlock>
					<StyleBlock>
						<select name="favorite-film" aria-label="Select your favorite film..." required>
							<option selected disabled value=""> Select your favorite film... </option>
							<option>100 Things</option>
							<option>The Duke</option>
						</select>
					</StyleBlock>
					<StyleBlock>
						<fieldset>
							<legend>Checkboxes:</legend>
							<label>
								<input type="checkbox" name="italy" checked />
								Italy
							</label>
							<label>
								<input type="checkbox" name="france" checked />
								France
							</label>
							<label>
								<input type="checkbox" name="spain" />
								Spain
							</label>
						</fieldset>
					</StyleBlock>
					<StyleBlock>
						<label>
							Slider
							<input type="range" value="40" min="0" max="100" />
						</label>
					</StyleBlock>
				</section>

				<section>
					<h3>Cards</h3>
					<StyleBlock>
						<article>
							<header>
								<h4>Card header</h4>
							</header>
							<section>
								<h5>Card content section</h5>
								<p>Card content</p>
							</section>
							<footer>
								<p>Card footer</p>
							</footer>
						</article>
					</StyleBlock>
				</section>
			</article>
		{/each}
	</section>
</article>

<style>
	article[data-theme] > section:not(:last-child) {
		border-bottom: var(--pico-border-width) solid var(--pico-primary-border);
		padding-block: var(--pico-spacing);
	}
</style>
