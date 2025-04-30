import { getDataForSearch } from '$lib/data';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params: { slug } }) => {
	try {
		const data = await getDataForSearch(slug);
		return json(data);
	} catch (e) {
		error(404, `Failed to load ${slug}: ${e instanceof Error ? e.message : e}`);
	}
};
