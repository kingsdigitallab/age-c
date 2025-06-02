import { dev } from '$app/environment';
import { base } from '$app/paths';
import { getData, getFilmData } from '$lib/data';
import type { Film } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params: { slug } }) => {
	try {
		let film: Film;

		if (dev) {
			const response = await fetch(`${base}/api/films/${slug}.json`);
			film = await response.json();
		} else {
			film = await getFilmData(slug);
		}

		return {
			title:
				film.title.english && film.title.native !== film.title.english
					? `${film.title.native} (${film.title.english})`
					: film.title.native,
			excerpt: film.synopsis?.english
				? `${film.synopsis.native} (${film.synopsis.english})`
				: film.synopsis?.native,
			tags: film?.tags ?? [],
			film
		};
	} catch (e) {
		error(404, `Film not found: ${e instanceof Error ? e.message : e}`);
	}
};

export const entries: EntryGenerator = async () => {
	const films = await getData('films');

	return Array.isArray(films) ? films.map((film: Film) => ({ slug: film.slug })) : [];
};
