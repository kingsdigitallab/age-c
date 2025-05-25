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
	selectedGroupByFacetValues
}: GetDataParams): Bucket[] {
	let data = searchAggregations[selectedFacet]?.buckets || [];

	if (selectedGroupByFacet) {
		const groupTotals = Object.fromEntries(selectedGroupByFacetValues.map((g) => [g.key, 0]));

		data = data.map((d) => {
			const items = searchItems?.filter((item) => {
				const facetValue = item[selectedFacet as keyof Item];

				if (Array.isArray(facetValue)) {
					return (
						facetValue?.includes(d.key) ||
						facetValue?.includes(Number.parseInt(d.key)) ||
						facetValue?.includes(Number.parseFloat(d.key))
					);
				}

				if (typeof facetValue === 'number') {
					return facetValue === Number.parseInt(d.key);
				}

				return facetValue === d.key;
			});

			const groupCounts = selectedGroupByFacetValues.map((g) => {
				const doc_count =
					items?.filter((item) => {
						const facetValue = item[selectedGroupByFacet as keyof Item];
						if (Array.isArray(facetValue)) {
							return (
								facetValue?.includes(g.key) ||
								facetValue?.includes(Number.parseInt(g.key)) ||
								facetValue?.includes(Number.parseFloat(g.key))
							);
						}

						if (typeof facetValue === 'number') {
							return facetValue === Number.parseInt(g.key);
						}

						return facetValue === g.key;
					}).length || 0;

				return { key: g.key, doc_count };
			});

			const result: Bucket = {
				...d,
				...groupCounts.reduce(
					(acc, group) => {
						acc[group.key] = group.doc_count;
						groupTotals[group.key] += group.doc_count;
						return acc;
					},
					{} as Record<string, number>
				)
			};

			return result;
		});

		const filteredData = data.filter((d) => {
			for (const key in selectedGroupByFacetValues.map((g) => g.key)) {
				if (groupTotals?.[key] === 0) {
					return false;
				}
			}
			return true;
		});

		return filteredData;
	}

	return data;
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
