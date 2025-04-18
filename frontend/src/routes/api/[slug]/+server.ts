import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
	try {
		const data = await import(`$data/${params.slug}.json`);

		return json(data.default);
	} catch (e) {
		error(404, `Failed to load ${params.slug}: ${e instanceof Error ? e.message : e}`);
	}
};
