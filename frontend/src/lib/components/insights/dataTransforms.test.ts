import { describe, it, expect } from 'vitest';
import { getData, generateAriaLabel, type Bucket } from './dataTransforms';
import type { Item } from '$lib/types';

describe('dataTransforms.ts', () => {
	describe('getData', () => {
		it('returns top maxCategories sorted by doc_count when no grouping selected', () => {
			const searchAggregations = {
				facetA: {
					buckets: [
						{ key: 'B', doc_count: 5 },
						{ key: 'A', doc_count: 10 },
						{ key: 'C', doc_count: 1 }
					] as Bucket[]
				}
			};
			const result = getData({
				selectedFacet: 'facetA',
				selectedGroupByFacet: '',
				searchItems: undefined,
				searchAggregations,
				selectedGroupByFacetValues: [],
				maxCategories: 2
			});

			// Sorted desc by doc_count and limited to 2
			expect(result).toEqual([
				{ key: 'A', doc_count: 10 },
				{ key: 'B', doc_count: 5 }
			]);
		});

		it('groups counts by selectedGroupByFacet and filters out zero-only categories', () => {
			const searchAggregations = {
				category: {
					buckets: [
						{ key: 'Comedy', doc_count: 4 },
						{ key: 'Drama', doc_count: 3 },
						{ key: 'Horror', doc_count: 2 }
					] as Bucket[]
				}
			};

			// Items: facet is "category"; group by "role"
			const items: Item[] = [
				{ id: '1', type: 'Film', category: ['Comedy'], role: ['Actor'] } as any,
				{ id: '2', type: 'Film', category: ['Comedy'], role: ['Director'] } as any,
				{ id: '3', type: 'Film', category: ['Drama'], role: ['Actor'] } as any
				// Horror has no matching roles, should be filtered out
			];

			const selectedGroupByFacetValues: Bucket[] = [
				{ key: 'Actor', doc_count: 0 },
				{ key: 'Director', doc_count: 0 }
			];

			const result = getData({
				selectedFacet: 'category',
				selectedGroupByFacet: 'role',
				searchItems: items,
				searchAggregations,
				selectedGroupByFacetValues,
				maxCategories: 3
			});

			// Expect Comedy with 1 Actor, 1 Director; Drama with 1 Actor; Horror filtered out
			expect(result).toEqual([
				{ key: 'Comedy', doc_count: 4, Actor: 1, Director: 1 },
				{ key: 'Drama', doc_count: 3, Actor: 1, Director: 0 }
			]);
		});

		it('limits processing to maxCategories when grouping', () => {
			const searchAggregations = {
				category: {
					buckets: [
						{ key: 'A', doc_count: 100 },
						{ key: 'B', doc_count: 90 },
						{ key: 'C', doc_count: 80 }
					] as Bucket[]
				}
			};
			const items: Item[] = [
				{ id: '1', type: 'Film', category: ['A'], role: ['R1'] } as any,
				{ id: '2', type: 'Film', category: ['B'], role: ['R1'] } as any,
				{ id: '3', type: 'Film', category: ['C'], role: ['R1'] } as any
			];
			const result = getData({
				selectedFacet: 'category',
				selectedGroupByFacet: 'role',
				searchItems: items,
				searchAggregations,
				selectedGroupByFacetValues: [{ key: 'R1', doc_count: 0 }],
				maxCategories: 2
			});

			// Only top 2 categories are processed
			expect(result.map((d) => d.key)).toEqual(['A', 'B']);
		});

		it('group matching supports array and number values', () => {
			const searchAggregations = {
				group: {
					buckets: [
						{ key: 'X', doc_count: 3 },
						{ key: 'Y', doc_count: 2 }
					] as Bucket[]
				}
			};

			// Group by "years" which is an array of numbers in items.
			// matchesFacetValue should match string "2022" against number 2022.
			const items: Item[] = [
				{ id: '1', type: 'Film', group: 'X', years: [2022, 2021] } as any,
				{ id: '2', type: 'Film', group: 'X', years: [2023] } as any,
				{ id: '3', type: 'Film', group: 'Y', years: [2022] } as any
			];

			const result = getData({
				selectedFacet: 'group',
				selectedGroupByFacet: 'years',
				searchItems: items,
				searchAggregations,
				selectedGroupByFacetValues: [
					{ key: '2022', doc_count: 0 },
					{ key: '2023', doc_count: 0 }
				],
				maxCategories: 2
			});

			// For X: 2022 matches item 1; 2023 matches item 2
			// For Y: 2022 matches item 3; 2023 none
			const x = result.find((r) => r.key === 'X')!;
			const y = result.find((r) => r.key === 'Y')!;
			expect(x['2022']).toBe(1);
			expect(x['2023']).toBe(1);
			expect(y['2022']).toBe(1);
			expect(y['2023']).toBe(0);
		});

		it('handles missing facet values on items gracefully', () => {
			const searchAggregations = {
				category: {
					buckets: [{ key: 'A', doc_count: 2 }] as Bucket[]
				}
			};
			const items: Item[] = [
				{ id: '1', type: 'Film', category: ['A'] } as any,
				{ id: '2', type: 'Film' } as any
			];

			const result = getData({
				selectedFacet: 'category',
				selectedGroupByFacet: '',
				searchItems: items,
				searchAggregations,
				selectedGroupByFacetValues: [],
				maxCategories: 5
			});

			expect(result).toEqual([{ key: 'A', doc_count: 2 }]);
		});
	});

	describe('generateAriaLabel', () => {
		it('returns "No data!" for empty input', () => {
			expect(generateAriaLabel({ data: [], categoryLabel: 'Categories' })).toBe('No data!');
		});

		it('generates a descriptive label with totals and min/max', () => {
			const data: Bucket[] = [
				{ key: 'A', doc_count: 10 },
				{ key: 'B', doc_count: 3 },
				{ key: 'C', doc_count: 7 }
			];

			const label = generateAriaLabel({ data, categoryLabel: 'Categories' });
			// Basic assertions to ensure computed values are present
			expect(label).toContain('There are 20 total items');
			expect(label).toContain('across 3 categories');
			expect(label).toContain('Highest count is 10 items for A');
			expect(label).toContain('lowest is 3 items for B');
		});
	});
});
