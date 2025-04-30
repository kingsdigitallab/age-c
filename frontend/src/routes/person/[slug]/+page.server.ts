import { base } from '$app/paths';
import biographies from '$data/biographies.json' assert { type: 'json' };
import type { Item } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params: { slug } }) => {
	try {
		const response = await fetch(`${base}/api/biographies/${slug}.json`);
		const bio = await response.json();

		return {
			bio: bio as Item
		};
	} catch (e) {
		error(404, `Biography not found: ${e instanceof Error ? e.message : e}`);
	}
};

export const entries: EntryGenerator = async () => {
	return Array.isArray(biographies) ? biographies.map((bio: Item) => ({ slug: bio.slug })) : [];
};
