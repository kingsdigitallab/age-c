import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Item, Character, Role, Synopsis } from './types';

export async function getSearchData(slug: string) {
	const data = await getData(slug);

	return data.map((item: Item) => ({
		...item,
		title: getTitle(item),
		filmType: getField(item, 'filmType'),
		releaseType: getField(item, 'release.type'),
		releaseYear: getField(item, 'release.year'),
		productionCountry: getProduction(item, 'country'),
		productionShare: getProduction(item, 'share'),
		role: getRole(item),
		gender: getField(item, 'gender'),
		nationality: getField(item, 'nationality'),
		characterAbility: item?.characters?.map((c) => c?.ability),
		characterAge: item?.characters?.map((c) => c?.age),
		characterClass: item?.characters?.map((c) => c?.class),
		characterGender: item?.characters?.map((c) => c?.gender),
		characterOrigin: item?.characters?.map((c) => c?.origin),
		characterProfession: item?.characters?.map((c) => c?.profession),
		characterSexuality: item?.characters?.map((c) => c?.sexuality),
		assistedMobility: item?.characters?.map((c) => c?.assistedMobility),
		synopsis: getSynopsis(item),
		text: getText(item)
	}));
}

export async function getData(slug: string) {
	const filePath = path.resolve('../data/2_final', `${slug}.json`);
	const data = JSON.parse(await readFile(filePath, 'utf-8'));

	return data;
}

function getTitle(item: Item) {
	if (item.type === 'Film') {
		return [item?.title?.native, item?.title?.english].filter(Boolean);
	}

	return item.name;
}

const fieldSubpaths: Record<string, { character: string; role: string }> = {
	filmType: { character: 'film.filmType', role: 'filmType' },
	'release.type': { character: 'film.release.type', role: 'release.type' },
	'release.year': { character: 'film.release.year', role: 'release.year' },
	gender: { character: 'person.gender', role: 'person.gender' },
	nationality: { character: 'person.nationality', role: 'person.nationality' }
};

function getField(item: Item, field: string) {
	const subpaths = fieldSubpaths[field];

	const mainValue = getNestedField(item, field);
	const characterValues = subpaths
		? (item.characters || []).map((c: Character) => getNestedField(c, subpaths.character))
		: [];
	const roleValues = subpaths
		? (item.roles || []).map((d: Role) => getNestedField(d, subpaths.role))
		: [];

	return [mainValue, ...characterValues, ...roleValues].filter(Boolean);
}

function getNestedField(obj: Item | Character | Role, path: string) {
	return path.split('.').reduce((acc, part) => {
		if (acc && typeof acc === 'object' && part in acc) {
			return acc[part as keyof typeof acc];
		}
		return undefined;
	}, obj);
}

function getProduction(item: Item, field: 'country' | 'share') {
	if (item.type === 'Film') {
		return item.production?.map((p) => p[field]) || [];
	}

	const characterValues = (item.characters || []).flatMap((c) => c.production?.[field]);
	const roleValues = (item.roles || []).flatMap((r) => r.film?.production?.[field]);

	return [...new Set([...characterValues, ...roleValues].filter(Boolean))];
}

function getRole(item: Item) {
	const roles = [];

	if (item.roles) {
		roles.push(...item.roles.map((r) => r.role));
	}

	return roles;
}

function getSynopsis(item: Item) {
	if (item.type === 'Film') {
		return [item?.synopsis?.native, item?.synopsis?.english].filter(Boolean);
	}

	return '';
}

function getText(item: Item) {
	const text = [];

	if (item.type === 'Film') {
		for (const field of ['native', 'english']) {
			const fieldValue = item?.synopsis?.[field as keyof Synopsis];
			if (fieldValue) {
				text.push(...fieldValue.split(' '));
			}
		}
	}

	if (item.type === 'Person') {
		text.push(...item.name.split(' '));
	}

	return text.map((word) => word.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
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
