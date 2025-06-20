import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const mdsvexOptions = {
	extensions: ['.md', '.svx'],
	smartypants: true
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		alias: { $data: '../data/2_final' },
		paths: {
			base: process.env.GITHUB_ACTIONS_BUILD === 'true' ? '/age-c' : ''
		},
		prerender: {
			handleMissingId: 'ignore'
		}
	},
	extensions: ['.svelte', ...mdsvexOptions.extensions]
};

export default config;
