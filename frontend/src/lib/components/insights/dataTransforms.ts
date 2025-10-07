import type { Item } from '$lib/types';
import pluralize from 'pluralize-esm';

export interface Bucket {
	key: string;
	doc_count: number;
	[key: string]: string | number;
}

interface GetDataParams {
	selectedFacet: string;
	selectedGroupByFacet: string;
	searchItems?: Item[];
	searchAggregations: Record<string, { buckets: Bucket[] }>;
	selectedGroupByFacetValues: Bucket[];
	maxCategories: number;
}

interface GenerateAriaLabelParams {
	data: Bucket[];
	categoryLabel: string;
}

export function getData({
	selectedFacet,
	selectedGroupByFacet,
	searchItems,
	searchAggregations,
	selectedGroupByFacetValues,
	maxCategories
}: GetDataParams): Bucket[] {
	let data = searchAggregations[selectedFacet]?.buckets || [];
	data = [...data].sort((a, b) => b.doc_count - a.doc_count);

	if (selectedGroupByFacet && searchItems) {
		// Pre-build lookup maps
		const facetMap = new Map<string, Item[]>();
		const groupKeys = selectedGroupByFacetValues.map((g) => g.key);

		// Single pass through items to build lookup structure
		for (const item of searchItems) {
			const facetValue = getFacetValue(item, selectedFacet);
			if (facetValue !== null) {
				if (!facetMap.has(facetValue)) {
					facetMap.set(facetValue, []);
				}
				facetMap.get(facetValue)!.push(item);
			}
		}

		const groupTotals = Object.fromEntries(groupKeys.map((k) => [k, 0]));

		// Only process maxCategories to avoid unnecessary computation
		const topData = data.slice(0, maxCategories);

		const processedData = topData.map((bucket) => {
			const facetItems = facetMap.get(bucket.key) || [];

			const groupCounts: Record<string, number> = {};

			for (const groupKey of groupKeys) {
				let count = 0;
				for (const item of facetItems) {
					if (matchesFacetValue(item, selectedGroupByFacet, groupKey)) {
						count++;
					}
				}
				groupCounts[groupKey] = count;
				groupTotals[groupKey] += count;
			}

			return {
				...bucket,
				...groupCounts
			};
		});

		// Filter out categories where all groups are zero
		return processedData.filter((d) => {
			return groupKeys.some((key) => (d[key] as number) > 0);
		});
	}

	return data.slice(0, maxCategories);
}

function getFacetValue(item: Item, facetKey: string): string | null {
	const value = item[facetKey as keyof Item];

	if (Array.isArray(value)) {
		// For arrays, return first value or concatenated string
		return value.length > 0 ? String(value[0]) : null;
	}

	if (value !== undefined && value !== null) {
		return String(value);
	}

	return null;
}

function matchesFacetValue(item: Item, facetKey: string, value: string): boolean {
	const facetValue = item[facetKey as keyof Item];

	if (Array.isArray(facetValue)) {
		return (
			facetValue?.includes(value) ||
			facetValue?.includes(Number.parseInt(value)) ||
			facetValue?.includes(Number.parseFloat(value))
		);
	}

	if (typeof facetValue === 'number') {
		return facetValue === Number.parseInt(value);
	}

	return facetValue === value;
}

export function generateAriaLabel({ data, categoryLabel }: GenerateAriaLabelParams): string {
	if (data.length === 0) {
		return 'No data!';
	}

	const totalItems = data.reduce((sum, d) => sum + d.doc_count, 0);

	const maxCategory = data.reduce(
		(max, curr) => (curr.doc_count > max.doc_count ? curr : max),
		data[0]
	);
	const minCategory = data.reduce(
		(min, curr) => (curr.doc_count < min.doc_count ? curr : min),
		data[0]
	);

	let label = `There are ${totalItems.toLocaleString()} total items across ${data.length} ${pluralize(categoryLabel.toLowerCase(), data.length)}.`;
	label = `${label} Highest count is ${maxCategory.doc_count.toLocaleString()} ${pluralize('item', maxCategory.doc_count)} for ${maxCategory.key},`;
	label = `${label} lowest is ${minCategory.doc_count.toLocaleString()} ${pluralize('item', minCategory.doc_count)} for ${minCategory.key}.`;

	return label;
}
