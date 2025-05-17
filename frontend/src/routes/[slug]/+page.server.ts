import { error } from '@sveltejs/kit';
import { render } from 'svelte/server';
import type { PageServerLoad } from './$types';

export const load = (async ({ params: { slug } }: { params: { slug: string } }) => {
	try {
		const page = await import(`../../pages/${slug}.md`);

		return {
			slug,
			title: page.metadata.title,
			excerpt: page.metadata.excerpt,
			tags: page.metadata.tags,
			content: render(page.default)
		};
	} catch (e) {
		error(404, `Failed to load ${slug}: ${e instanceof Error ? e.message : e}`);
	}
}) satisfies PageServerLoad;
