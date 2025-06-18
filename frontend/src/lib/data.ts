import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { searchConfig } from './index';
import tags from './data/tags.json';
import type { Character, Item, Role, Synopsis } from './types';
import { HIERARCHY_SEPARATOR } from './search/config';

export async function getSearchData(slug: string) {
	const data = await getData(slug);

	return data.map((item: Item) => {
		const baseData = {
			...item,
			title: getTitle(item),
			filmType: getField(item, 'filmType'),
			releaseType: getField(item, 'release.type'),
			releaseYear: getField(item, 'release.year'),
			productionCountryShare: getProduction(item),
			role: getRole(item),
			birthYear: getField(item, 'birthYear'),
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
			text: getText(item),
			tags: getTags(item)
		};

		const combinedFacets = Object.entries(searchConfig[slug].aggregations)
			.flatMap(([facet, facetConfig]) =>
				(facetConfig?.skijCombineWith || []).flatMap((combineWith) => {
					const [key, field] = Object.entries(combineWith)[0];
					const combinations = [
						...getRelatedFacetCombinations(item, facet, field),
						...getRelatedFacetCombinations(item, field, facet)
					];
					return [
						[`${facet}${HIERARCHY_SEPARATOR}${key}`, combinations],
						[`${key}${HIERARCHY_SEPARATOR}${facet}`, combinations]
					] as const;
				})
			)
			.reduce<Record<string, string[]>>((acc, [key, values]) => {
				acc[key] = [...new Set([...(acc[key] || []), ...values])];
				return acc;
			}, {});

		return {
			...baseData,
			...combinedFacets
		};
	});
}

export async function getData(slug: string) {
	const filePath = path.resolve('../data/2_final', `${slug}.json`);
	const data = JSON.parse(await readFile(filePath, 'utf-8'));

	return data;
}

export function getTitle(item: Item) {
	if (item.type === 'Film') {
		return [item?.title?.native, item?.title?.english].filter(Boolean);
	}

	return item.name;
}

const fieldSubpaths: Record<string, { character: string; role: string }> = {
	filmType: { character: 'film.filmType', role: 'filmType' },
	'release.type': { character: 'film.release.type', role: 'release.type' },
	'release.year': { character: 'film.release.year', role: 'release.year' },
	birthYear: { character: 'person.birthYear', role: 'person.birthYear' },
	gender: { character: 'person.gender', role: 'person.gender' },
	nationality: { character: 'person.nationality', role: 'person.nationality' }
};

export function getField(item: Item, field: string) {
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

export function getNestedField(obj: Item | Character | Role, path: string) {
	return path.split('.').reduce((acc, part) => {
		if (acc && typeof acc === 'object' && part in acc) {
			return acc[part as keyof typeof acc];
		}
		return undefined;
	}, obj);
}

export function getProduction(item: Item) {
	if (item.type === 'Film') {
		return (
			item.production?.flatMap((p) => [
				p.country,
				`${p.country}${HIERARCHY_SEPARATOR}${p.share}`
			]) || []
		);
	}

	const characterValues = (item.characters || []).flatMap((c) =>
		c.film?.production?.flatMap((p) => [p.country, `${p.country}${HIERARCHY_SEPARATOR}${p.share}`])
	);
	const roleValues = (item.roles || []).flatMap((r) =>
		r.film?.production?.flatMap((p) => [p.country, `${p.country}${HIERARCHY_SEPARATOR}${p.share}`])
	);

	return [...new Set([...characterValues, ...roleValues].filter(Boolean))];
}

export function getRole(item: Item) {
	const roles = [];

	if (item.roles) {
		roles.push(...item.roles.map((r) => r.role));
	}

	return roles;
}

export function getSynopsis(item: Item) {
	if (item.type === 'Film') {
		return [item?.synopsis?.native, item?.synopsis?.english].filter(Boolean);
	}

	return '';
}

export function getText(item: Item) {
	const text = [];

	if (item.type === 'Film') {
		for (const field of ['native', 'english']) {
			const fieldValue = item?.synopsis?.[field as keyof Synopsis];
			if (fieldValue) {
				text.push(...fieldValue.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').split(' '));
			}
		}
	}

	if (item.type === 'Person') {
		text.push(...item.name.split(' '));
	}

	// Replace diacritics with their base characters
	return text.map((word) => word.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
}

export function getTags(item: Item) {
	const itemTags = [];

	if (item.type === 'Film' && item?.tags) {
		for (const tag of item.tags) {
			const parts = tags[tag as keyof typeof tags];

			if (parts) {
				for (let idx = 0; idx < parts.length; idx++) {
					itemTags.push(parts.slice(0, idx + 1).join(HIERARCHY_SEPARATOR));
				}

				itemTags.push(`${parts.join(HIERARCHY_SEPARATOR)}${HIERARCHY_SEPARATOR}${tag}`);
			}
		}
	}

	return itemTags.filter(Boolean);
}

export function getRelatedFacetCombinations(item: Item, facet1: string, facet2: string) {
	const combinations = [];

	if (item.roles) {
		for (const role of item.roles) {
			const value1 = getNestedField(role, facet1) ?? getNestedField(item, facet1);
			const value2 = getNestedField(role, facet2) ?? getNestedField(item, facet2);

			if (value1 && value2) {
				combinations.push(`${value1}${HIERARCHY_SEPARATOR}${value2}`);
			}
		}
	}

	return [...new Set(combinations)];
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
