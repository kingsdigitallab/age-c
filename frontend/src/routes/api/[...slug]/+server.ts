import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { getData } from '$lib/data';

export const prerender = true;

export const GET: RequestHandler = async ({ params: { slug } }) => {
	try {
		const data = await getData(slug);
		return json(data);
	} catch (e) {
		error(404, `Failed to load ${slug}: ${e instanceof Error ? e.message : e}`);
	}
};
