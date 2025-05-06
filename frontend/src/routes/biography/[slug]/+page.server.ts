import { dev } from '$app/environment';
import { base } from '$app/paths';
import { getBiographyData, getData } from '$lib/data';
import type { Item } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params: { slug } }) => {
	try {
		let bio: Item;

		if (dev) {
			const response = await fetch(`${base}/api/biographies/${slug}.json`);
			bio = await response.json();
		} else {
			bio = await getBiographyData(slug);
		}

		return {
			bio: bio as Item
		};
	} catch (e) {
		error(404, `Biography not found: ${e instanceof Error ? e.message : e}`);
	}
};

export const entries: EntryGenerator = async () => {
	const biographies = await getData('biographies');

	return Array.isArray(biographies) ? biographies.map((bio: Item) => ({ slug: bio.slug })) : [];
};
