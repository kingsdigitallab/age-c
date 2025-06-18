import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as dataModule from './data';
import { HIERARCHY_SEPARATOR } from './search/config';
import type { Item } from './types';

const sampleFilm: Item = {
	type: 'Film',
	id: 'GB2022_076',
	slug: 'gb2022-076-the-duke',
	title: { native: 'The Duke', english: 'The Duke in English' },
	release: { type: 'Theatrical release', date: '2022-02-25', year: 2022 },
	filmType: 'Fiction film',
	directors: [
		{
			id: 'Roger Michell',
			slug: 'roger-michell',
			name: 'Roger Michell',
			birthYear: 1956,
			deathYear: 2021,
			gender: 'Male identifying',
			nationality: 'United Kingdom of Great Britain and Northern Ireland (the)'
		}
	],
	genre: [
		'Comedy',
		'Biopic',
		'Drama',
		'Heist',
		'Courtroom Drama',
		'Historical film (Heritage Film)'
	],
	media: {
		posterUrl: 'https://www.imdb.com/title/tt11204094/mediaviewer/rm1237448961/?ref_=tt_ov_i',
		trailerUrl:
			'https://www.imdb.com/title/tt11204094/?ref_=nv_sr_srsg_3_tt_7_nm_1_in_0_q_The%2520Duke'
	},
	synopsis: {
		native:
			"In 1961, Kempton Bunton, a 60 year old taxi driver, steals Goya's portrait of the Duke of Wellington from the National Gallery in London.",
		english: 'A English synopsis'
	},
	production: [
		{
			country: 'United Kingdom of Great Britain and Northern Ireland (the)',
			share: 'Majority coproducer'
		}
	],
	characters: [
		{
			id: 'GB2022_076_01',
			film: 'GB2022_076',
			person: {
				id: 'Jim Broadbent',
				slug: 'jim-broadbent',
				name: 'Jim Broadbent',
				birthYear: 1949,
				deathYear: 0,
				gender: 'Male identifying',
				nationality: 'United Kingdom of Great Britain and Northern Ireland (the)'
			},
			age: '3: Third Age (60-75)',
			gender: 'Male identifying',
			sexuality: 'Heterosexual',
			origin: 'White Western European',
			class: 'Lower Middle class',
			profession: 'Employed',
			ability: 'Able-bodied',
			assistedMobility: 'No'
		}
	],
	roles: [
		{
			person: {
				id: 'Helen Mirren',
				slug: 'helen-mirren',
				name: 'Helen Mirren',
				birthYear: 1945,
				deathYear: 0,
				gender: 'Female identifying',
				nationality: 'United Kingdom of Great Britain and Northern Ireland (the)'
			},
			role: 'Leading actor'
		}
	],
	tags: ['crime', 'independent home', 'low rank employment', 'marriage']
};

const samplePerson: Item = {
	type: 'Person',
	id: 'Judi Dench',
	slug: 'judi-dench',
	name: 'Judi Dench',
	birthYear: 1934,
	deathYear: 0,
	gender: 'Female identifying',
	nationality: 'United Kingdom of Great Britain and Northern Ireland (the)',
	characters: [
		{
			id: 'GB2019_002_01',
			film: {
				id: 'GB2019_002',
				slug: 'gb2019-002-cats',
				title: { native: 'Cats', english: '' },
				release: { type: 'Theatrical release', date: '2019-12-20', year: 2019 },
				production: [
					{
						country: 'United Kingdom of Great Britain and Northern Ireland (the)',
						share: 'Majority coproducer'
					}
				]
			},
			person: 'Judi Dench',
			age: '4: Fourth Age (>75)',
			gender: 'Female identifying',
			sexuality: 'Unknown',
			origin: 'White Western European',
			class: 'Upper class',
			profession: 'Self-employed',
			ability: 'Able-bodied',
			assistedMobility: 'No'
		}
	],
	roles: [
		{
			film: {
				id: 'GB2018_016',
				slug: 'gb2018-016-tea-with-the-dames',
				title: { native: 'Tea with the Dames', english: '' },
				release: { type: 'Theatrical release', date: '2018-04-27', year: 2018 },
				production: [
					{
						country: 'United Kingdom of Great Britain and Northern Ireland (the)',
						share: 'Majority coproducer'
					}
				]
			},
			role: 'Documentary subject'
		}
	]
};

vi.mock('node:fs/promises');
vi.mock('node:path');

describe('data.ts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		fs.readFile.mockImplementation((filePath: string) => {
			if (filePath.includes('corpus'))
				return Promise.resolve(JSON.stringify([sampleFilm, samplePerson]));
			if (filePath.includes('films')) return Promise.resolve(JSON.stringify([sampleFilm]));
			if (filePath.includes('biographies')) return Promise.resolve(JSON.stringify([samplePerson]));
			return Promise.resolve('[]');
		});
		path.resolve.mockImplementation((...args: string[]) => args.join('/'));
	});

	describe('getData', () => {
		it('should read and parse film JSON', async () => {
			const result = await dataModule.getData('films/gb2022-076-the-duke');
			expect(result[0].id).toBe('GB2022_076');
		});

		it('should read and parse biography JSON', async () => {
			const result = await dataModule.getData('biographies/judi-dench');
			expect(result[0].id).toBe('Judi Dench');
		});

		it('should handle non-existent files', async () => {
			fs.readFile.mockRejectedValueOnce(new Error('File not found'));
			await expect(dataModule.getData('non-existent')).rejects.toThrow();
		});
	});

	describe('getTitle', () => {
		it('should return film titles in both languages', () => {
			const result = dataModule.getTitle(sampleFilm);
			expect(result).toEqual(['The Duke', 'The Duke in English']);
		});

		it('should return person name', () => {
			const result = dataModule.getTitle(samplePerson);
			expect(result).toBe('Judi Dench');
		});

		it('should handle missing title fields', () => {
			const filmWithoutTitle: Item = { ...sampleFilm, title: { english: '', native: '' } };
			const result = dataModule.getTitle(filmWithoutTitle);
			expect(result).toEqual([]);
		});
	});

	describe('getField', () => {
		it('should get filmType from film', () => {
			const result = dataModule.getField(sampleFilm, 'filmType');
			expect(result).toContain('Fiction film');
		});

		it('should get birthYear from person', () => {
			const result = dataModule.getField(samplePerson, 'birthYear');
			expect(result).toContain(1934);
		});

		it('should get release type from film', () => {
			const result = dataModule.getField(sampleFilm, 'release.type');
			expect(result).toContain('Theatrical release');
		});

		it('should handle non-existent fields', () => {
			const result = dataModule.getField(sampleFilm, 'nonExistentField');
			expect(result).toEqual([]);
		});

		it('should handle nested character fields', () => {
			const result = dataModule.getField(sampleFilm, 'nationality');
			expect(result).toContain('United Kingdom of Great Britain and Northern Ireland (the)');
		});

		it('should handle nested role fields', () => {
			const result = dataModule.getField(sampleFilm, 'nationality');
			expect(result).toContain('United Kingdom of Great Britain and Northern Ireland (the)');
		});

		it('should handle missing subpaths', () => {
			const result = dataModule.getField(sampleFilm, 'nonExistentField');
			expect(result).toEqual([]);
		});
	});

	describe('getProduction', () => {
		it('should get production countries from film', () => {
			const result = dataModule.getProduction(sampleFilm);
			expect(result).toContain('United Kingdom of Great Britain and Northern Ireland (the)');
			expect(result).toContain(
				`United Kingdom of Great Britain and Northern Ireland (the)${HIERARCHY_SEPARATOR}Majority coproducer`
			);
		});

		it('should get production from person roles', () => {
			const result = dataModule.getProduction(samplePerson);
			expect(result).toContain('United Kingdom of Great Britain and Northern Ireland (the)');
		});

		it('should handle missing production data', () => {
			const filmWithoutProduction = { ...sampleFilm, production: [] };
			const result = dataModule.getProduction(filmWithoutProduction);
			expect(result).toEqual([]);
		});
	});

	describe('getRole', () => {
		it('should get roles from person', () => {
			const result = dataModule.getRole(samplePerson);
			expect(result).toContain('Documentary subject');
		});

		it('should return empty array for film without roles', () => {
			const filmWithoutRoles = { ...sampleFilm, roles: [] };
			const result = dataModule.getRole(filmWithoutRoles);
			expect(result).toEqual([]);
		});
	});

	describe('getSynopsis', () => {
		it('should get film synopsis in both languages', () => {
			const result = dataModule.getSynopsis(sampleFilm);
			expect(result[0]).toContain('Kempton Bunton');
			expect(result[1]).toBe('A English synopsis');
		});

		it('should return empty string for person', () => {
			const result = dataModule.getSynopsis(samplePerson);
			expect(result).toBe('');
		});

		it('should handle missing synopsis', () => {
			const filmWithoutSynopsis = { ...sampleFilm, synopsis: {} };
			const result = dataModule.getSynopsis(filmWithoutSynopsis);
			expect(result).toEqual([]);
		});
	});

	describe('getText', () => {
		it('should get normalized text from film synopsis', () => {
			const result = dataModule.getText(sampleFilm);
			expect(result).toContain('Kempton');
			expect(result).toContain('Bunton');
		});

		it('should get normalized text from person name', () => {
			const result = dataModule.getText(samplePerson);
			expect(result).toEqual(['Judi', 'Dench']);
		});

		it('should handle empty synopsis', () => {
			const filmWithoutSynopsis = { ...sampleFilm, synopsis: { native: '', english: '' } };
			const result = dataModule.getText(filmWithoutSynopsis);
			expect(result).toEqual([]);
		});

		it('should normalize text with diacritics', () => {
			const filmWithDiacritics = {
				...sampleFilm,
				synopsis: {
					native: 'café résumé',
					english: ''
				}
			};
			const result = dataModule.getText(filmWithDiacritics);
			expect(result).toContain('cafe');
			expect(result).toContain('resume');
		});

		it('should handle multiple languages in synopsis', () => {
			const filmWithMultipleLanguages = {
				...sampleFilm,
				synopsis: {
					native: 'Hello',
					english: 'World'
				}
			};
			const result = dataModule.getText(filmWithMultipleLanguages);
			expect(result).toContain('Hello');
			expect(result).toContain('World');
		});
	});

	describe('getTags', () => {
		it('should process film tags', () => {
			const result = dataModule.getTags(sampleFilm);
			expect(result).toContain(`Context${HIERARCHY_SEPARATOR}Crime`);
			expect(result).toContain(
				`Theme${HIERARCHY_SEPARATOR}Time & Space${HIERARCHY_SEPARATOR}Housing${HIERARCHY_SEPARATOR}independent home`
			);
		});

		it('should return empty array for person', () => {
			const result = dataModule.getTags(samplePerson);
			expect(result).toEqual([]);
		});

		it('should handle missing tags', () => {
			const filmWithoutTags = { ...sampleFilm, tags: [] };
			const result = dataModule.getTags(filmWithoutTags);
			expect(result).toEqual([]);
		});

		it('should handle nested tag hierarchies', () => {
			const filmWithNestedTags = {
				...sampleFilm,
				tags: ['crime', 'independent home']
			};
			const result = dataModule.getTags(filmWithNestedTags);
			// Check that we get both the full path and intermediate paths
			expect(result.some((tag: string) => tag.includes('crime'))).toBe(true);
			expect(result.some((tag: string) => tag.includes('independent home'))).toBe(true);
		});

		it('should handle unknown tags', () => {
			const filmWithUnknownTag = {
				...sampleFilm,
				tags: ['unknown_tag']
			};
			const result = dataModule.getTags(filmWithUnknownTag);
			expect(result).toEqual([]);
		});

		it('should handle tag hierarchy separators', () => {
			const filmWithTags = {
				...sampleFilm,
				tags: ['crime']
			};
			const result = dataModule.getTags(filmWithTags);
			expect(result.some((tag: string) => tag.includes(HIERARCHY_SEPARATOR))).toBe(true);
		});
	});

	describe('getFilmData', () => {
		it('should read film data from correct path', async () => {
			await dataModule.getFilmData('gb2022-076-the-duke');
			expect(path.resolve).toHaveBeenCalledWith(
				'../data/2_final/films',
				'gb2022-076-the-duke.json'
			);
		});

		it('should handle non-existent film', async () => {
			fs.readFile.mockRejectedValueOnce(new Error('File not found'));
			await expect(dataModule.getFilmData('non-existent')).rejects.toThrow();
		});
	});

	describe('getBiographyData', () => {
		it('should read biography data from correct path', async () => {
			await dataModule.getBiographyData('judi-dench');
			expect(path.resolve).toHaveBeenCalledWith('../data/2_final/biographies', 'judi-dench.json');
		});

		it('should handle non-existent biography', async () => {
			fs.readFile.mockRejectedValueOnce(new Error('File not found'));
			await expect(dataModule.getBiographyData('non-existent')).rejects.toThrow();
		});
	});

	describe('getSearchData', () => {
		it('should process film data for search', async () => {
			const result = await dataModule.getSearchData('corpus');
			expect(result[0]).toHaveProperty('title');
			expect(result[0]).toHaveProperty('filmType');
			expect(result[0]).toHaveProperty('releaseType');
			expect(result[0]).toHaveProperty('releaseYear');
			expect(result[0]).toHaveProperty('productionCountryShare');
			expect(result[0]).toHaveProperty('synopsis');
			expect(result[0]).toHaveProperty('text');
			expect(result[0]).toHaveProperty('tags');
		});

		it('should handle empty data', async () => {
			fs.readFile.mockResolvedValueOnce('[]');
			const result = await dataModule.getSearchData('corpus');
			expect(result).toEqual([]);
		});

		it('should process character-related fields', async () => {
			const result = await dataModule.getSearchData('corpus');
			expect(result[0]).toHaveProperty('characterAbility');
			expect(result[0]).toHaveProperty('characterAge');
			expect(result[0]).toHaveProperty('characterClass');
			expect(result[0]).toHaveProperty('characterGender');
			expect(result[0]).toHaveProperty('characterOrigin');
			expect(result[0]).toHaveProperty('characterProfession');
			expect(result[0]).toHaveProperty('characterSexuality');
			expect(result[0]).toHaveProperty('assistedMobility');
		});

		it('should handle combined facets', async () => {
			const result = await dataModule.getSearchData('corpus');
			// Check that combined facets are present in the result
			expect(result[0]).toHaveProperty('role:::gender');
			expect(result[0]).toHaveProperty('gender:::role');
		});

		it('should handle missing optional fields', async () => {
			const filmWithoutOptionalFields = {
				...sampleFilm,
				characters: [],
				roles: [],
				tags: []
			};
			fs.readFile.mockResolvedValueOnce(JSON.stringify([filmWithoutOptionalFields]));
			const result = await dataModule.getSearchData('corpus');
			expect(result[0]).toHaveProperty('characterAbility');
			expect(result[0].characterAbility).toEqual([]);
		});
	});

	describe('getNestedField', () => {
		it('should get deeply nested field from object', () => {
			const obj = { a: { b: { c: 1 } } };
			const result = dataModule.getNestedField(obj, 'a.b.c');
			expect(result).toBe(1);
		});

		it('should get film title from nested structure', () => {
			const result = dataModule.getNestedField(sampleFilm, 'title.native');
			expect(result).toBe('The Duke');
		});

		it('should get person name from flat structure', () => {
			const result = dataModule.getNestedField(samplePerson, 'name');
			expect(result).toBe('Judi Dench');
		});

		it('should return undefined for non-existent path', () => {
			const result = dataModule.getNestedField(sampleFilm, 'non.existent.path');
			expect(result).toBeUndefined();
		});

		it('should handle null intermediate values', () => {
			const obj = { a: null };
			const result = dataModule.getNestedField(obj, 'a.b.c');
			expect(result).toBeUndefined();
		});
	});

	describe('getRelatedFacetCombinations', () => {
		it('should combine role and gender facets for film', () => {
			const result = dataModule.getRelatedFacetCombinations(sampleFilm, 'role', 'person.gender');
			expect(result).toContain('Leading actor:::Female identifying');
		});

		it('should combine role and gender facets for person', () => {
			const result = dataModule.getRelatedFacetCombinations(samplePerson, 'role', 'gender');
			expect(result).toContain('Documentary subject:::Female identifying');
		});

		it('should handle missing roles', () => {
			const personWithoutRoles = { ...samplePerson, roles: [] };
			const result = dataModule.getRelatedFacetCombinations(personWithoutRoles, 'role', 'gender');
			expect(result).toEqual([]);
		});

		it('should handle missing facet values', () => {
			const personWithIncompleteRole: Item = {
				...samplePerson,
				gender: '',
				roles: [{ role: 'Actor' }]
			};
			const result = dataModule.getRelatedFacetCombinations(
				personWithIncompleteRole,
				'role',
				'gender'
			);
			expect(result).toEqual([]);
		});

		it('should deduplicate combinations', () => {
			const personWithDuplicateRoles: Item = {
				...samplePerson,
				roles: [
					{ role: 'Actor', person: { gender: 'Female identifying' } },
					{ role: 'Actor', person: { gender: 'Female identifying' } }
				]
			};
			const result = dataModule.getRelatedFacetCombinations(
				personWithDuplicateRoles,
				'role',
				'gender'
			);
			expect(result).toHaveLength(1);
			expect(result).toContain('Actor:::Female identifying');
		});
	});
});
