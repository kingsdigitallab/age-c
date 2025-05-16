import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params: { slug } }) => {
	try {
		let path = '../../pages';
		for (const part of slug.split('/')) {
			path = `${path}/${part}`;
		}

		const page = await import(`${path}.md`);

		return {
			slug,
			metadata: page.metadata,
			content: page.default
		};
	} catch (e) {
		error(404, `Failed to load ${slug}: ${e instanceof Error ? e.message : e}`);
	}
}) satisfies PageLoad;
