import { base } from '$app/paths';
import type { Item } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params: { slug } }) => {
	try {
		const response = await fetch(`${base}/api/films/${slug}.json`);
		const film = await response.json();

		return {
			film: film as Item
		};
	} catch (e) {
		error(404, `Film not found: ${e instanceof Error ? e.message : e}`);
	}
};

export const entries: EntryGenerator = async () => {
	const filmsModule = await import('$data/films.json', { assert: { type: 'json' } });
	const films = filmsModule.default;

	return Array.isArray(films) ? films.map((film: Item) => ({ slug: film.slug })) : [];
};
