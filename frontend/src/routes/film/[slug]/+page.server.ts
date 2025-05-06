import { dev } from '$app/environment';
import { base } from '$app/paths';
import { getData, getFilmData } from '$lib/data';
import type { Item } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params: { slug } }) => {
	try {
		let film: Item;

		if (dev) {
			const response = await fetch(`${base}/api/films/${slug}.json`);
			film = await response.json();
		} else {
			film = await getFilmData(slug);
		}

		return {
			film
		};
	} catch (e) {
		error(404, `Film not found: ${e instanceof Error ? e.message : e}`);
	}
};

export const entries: EntryGenerator = async () => {
	const films = await getData('films');

	return Array.isArray(films) ? films.map((film: Item) => ({ slug: film.slug })) : [];
};
