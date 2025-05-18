import { base } from '$app/paths';
import { config } from '$lib';
import { entries as bioEntries } from '../biography/[slug]/+page.server';
import { entries as filmEntries } from '../film/[slug]/+page.server';
import * as sitemap from 'super-sitemap';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const bioSlugs = await bioEntries();
	const filmSlugs = await filmEntries();

	return await sitemap.response({
		origin: config.siteUrl,
		paramValues: {
			[`${base}/[slug]`]: ['about', 'glossary'],
			[`${base}/biography/[slug]`]: bioSlugs.map((slug) => slug.slug),
			[`${base}/film/[slug]`]: filmSlugs.map((slug) => slug.slug)
		}
	});
};
