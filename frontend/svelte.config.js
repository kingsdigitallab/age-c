import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const mdsvexOptions = {
	extensions: ['.svx'],
	layout: {
		_: './src/lib/mdsvex/BaseLayout.svelte'
	},
	smartypants: true
};

const config = {
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	kit: { adapter: adapter(), alias: { $data: '../data/2_final' } },
	extensions: ['.svelte', '.svx']
};

export default config;
