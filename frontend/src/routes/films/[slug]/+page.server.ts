import { base } from '$app/paths';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Item } from '$lib/types';
export const load = (async ({ fetch, params: { slug } }) => {
	try {
		const response = await fetch(`${base}/api/films/${slug}`);
		const film = await response.json();

		return {
			film: film as Item
		};
	} catch (e) {
		error(404, `Film not found: ${e instanceof Error ? e.message : e}`);
	}
}) satisfies PageServerLoad;
