import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Item, Character, Director } from './types';

export async function getSearchData(slug: string) {
	const data = await getData(slug);

	return data.map((item: Item) => ({
		...item,
		title: [item?.title?.native, item?.title?.english, item?.name].filter(Boolean).join(' / '),
		filmType: getField(item, 'filmType'),
		releaseType: getField(item, 'release.type'),
		releaseYear: getField(item, 'release.year'),
		productionCountry: getProduction(item, 'country'),
		productionShare: getProduction(item, 'share'),
		role: getRole(item),
		gender: getField(item, 'gender'),
		nationality: getField(item, 'nationality'),
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

export async function getData(slug: string) {
	const filePath = path.resolve('../data/2_final', `${slug}.json`);
	const data = JSON.parse(await readFile(filePath, 'utf-8'));

	return data;
}

const fieldSubpaths: Record<string, { character: string; director: string }> = {
	filmType: { character: 'film.filmType', director: 'filmType' },
	releaseType: { character: 'film.release.type', director: 'release.type' },
	releaseYear: { character: 'film.release.year', director: 'release.year' },
	gender: { character: 'person.gender', director: 'gender' },
	nationality: { character: 'person.nationality', director: 'nationality' }
};

function getField(item: Item, field: string) {
	const subpaths = fieldSubpaths[field];

	const mainValue = getNestedField(item, field);
	const characterValues = subpaths
		? (item.character || []).map((c: Character) => getNestedField(c, subpaths.character))
		: [];
	const directorValues = subpaths
		? (item.director || []).map((d: Director) => getNestedField(d, subpaths.director))
		: [];

	return [mainValue, ...characterValues, ...directorValues].filter(Boolean);
}

function getNestedField(obj: Item | Character | Director, path: string) {
	return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

function getProduction(item: Item, field: 'country' | 'share') {
	if (!item) {
		return [];
	}

	const mainValue = item.production?.map((p) => p[field]) || [];
	const characterValues = (item.character || []).flatMap((c) => c.film?.production?.[field]);
	const directorValues = (item.director || []).flatMap((d) => d.production?.[field]);

	return [...new Set([...mainValue, ...characterValues, ...directorValues].filter(Boolean))];
}

function getRole(item: Item) {
	const roles = [];

	if (item.director) {
		roles.push('Director of the film');
	}

	if (item.character) {
		roles.push(...item.character.map((c) => c.role));
	}

	return roles;
}

export async function getFilmData(slug: string) {
	const filePath = path.resolve('../data/2_final/films', `${slug}.json`);
	const data = JSON.parse(await readFile(filePath, 'utf-8'));

	return data;
}

export async function getBiographyData(slug: string) {
	const filePath = path.resolve('../data/2_final/biographies', `${slug}.json`);
	const data = JSON.parse(await readFile(filePath, 'utf-8'));

	return data;
}
