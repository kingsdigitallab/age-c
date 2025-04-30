import biographies from '$data/biographies.json' assert { type: 'json' };
import films from '$data/films.json' assert { type: 'json' };
import { getData } from '$lib/data';
import type { Item } from '$lib/types';
import { error, json } from '@sveltejs/kit';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async ({ params: { slug } }) => {
	try {
		const data = await getData(slug);
		return json(data);
	} catch (e) {
		error(404, `Failed to load ${slug}: ${e instanceof Error ? e.message : e}`);
	}
};

export const entries: EntryGenerator = async () => {
	const entries = [{ slug: 'films' }, { slug: 'biographies' }];
	entries.push(...films.map((film: Item) => ({ slug: `films/${film.slug}` })));
	entries.push(...biographies.map((bio: Item) => ({ slug: `biographies/${bio.slug}` })));

	return entries;
};
