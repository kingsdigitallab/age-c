import { getSearchData } from '$lib/data';
import { error, json } from '@sveltejs/kit';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async ({ params: { slug } }) => {
	try {
		const data = await getSearchData(slug);
		return json(data);
	} catch (e) {
		error(404, `Failed to load ${slug}: ${e instanceof Error ? e.message : e}`);
	}
};

export const entries: EntryGenerator = async () => {
	return [{ slug: 'corpus' }];
};
