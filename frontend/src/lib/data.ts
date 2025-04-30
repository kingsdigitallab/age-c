import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Item } from './types';

export async function getData(slug: string) {
	const filePath = path.resolve('../data/2_final', `${slug}.json`);
	const data = JSON.parse(await readFile(filePath, 'utf-8'));

	return data;
}

export async function getDataForSearch(slug: string) {
	const data = await getData(slug);

	return data.map((item: Item) => ({
		...item,
		title: [item?.title?.native, item?.title?.english, item?.name].filter(Boolean).join(' / '),
		filmType: [item?.filmType, ...(item?.character || []).map((c) => c?.film?.filmType)],
		releaseType: item?.release?.type,
		releaseYear: item?.release?.year,
		productionCountry: item?.production?.country,
		productionShare: item?.production?.share,
		directorGender: item?.director?.map((d) => d?.gender),
		directorNationality: item?.director?.map((d) => d?.nationality),
		characterAbility: item?.character?.map((c) => c?.ability),
		characterAge: item?.character?.map((c) => c?.age),
		characterClass: item?.character?.map((c) => c?.class),
		characterGender: item?.character?.map((c) => c?.gender),
		characterOrigin: item?.character?.map((c) => c?.origin),
		characterProfession: item?.character?.map((c) => c?.profession),
		characterSexuality: item?.character?.map((c) => c?.sexuality),
		assistedMobility: item?.character?.map((c) => c?.assistedMobility),
		synopsis: [item?.synopsis?.native, item?.synopsis?.english].filter(Boolean)
	}));
}
