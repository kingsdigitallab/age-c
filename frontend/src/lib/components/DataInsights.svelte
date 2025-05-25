<script lang="ts">
	import { dev } from '$app/environment';
	import {
		VisAxis,
		VisBulletLegend,
		VisStackedBar,
		VisTooltip,
		VisXYContainer
	} from '@unovis/svelte';
	import { StackedBar } from '@unovis/ts';
	import pluralize from 'pluralize-esm';
	import type { Item } from '$lib/types';
	import type { GenericDataRecord } from '@unovis/ts/types';

	const {
		title = 'Data insights',
		isLoading,
		facets,
		searchItems = undefined,
		searchAggregations,
		searchConfig,
		dataSource
	}: {
		title?: string;
		isLoading: boolean;
		facets: {
			facet: string;
			title: string;
			dynamicTitle?: (count: number) => string;
		}[];
		searchItems?: Item[];
		searchAggregations: Record<string, { buckets: { key: string; doc_count: number }[] }>;
		searchConfig: Record<string, { aggregations: Record<string, { title: string }> }>;
		dataSource: string;
	} = $props();

	let selectedFacet = $state(facets?.[0]?.facet);

	let groupByFacets = $derived([
		{ facet: '', title: 'None' },
		...Object.entries(searchConfig[dataSource].aggregations)
			.filter(([key, _]) => key !== selectedFacet)
			.map(([key, aggregation]) => ({
				facet: key,
				title: aggregation.title
			}))
			.sort((a, b) => a.title.localeCompare(b.title))
	]);
	let selectedGroupByFacet = $state(groupByFacets?.[0]?.facet);
	const selectedGroupByFacetValues = $derived(
		searchAggregations[selectedGroupByFacet]?.buckets || []
	);

	const data = $derived(getData());

	function getData() {
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

				const result = {
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

	const staticTitle = $derived(facets.find((facet) => facet.facet === selectedFacet)?.title);
	const dynamicTitleFn = $derived(
		facets.find((facet) => facet.facet === selectedFacet)?.dynamicTitle
	);
	const visTitle = $derived(dynamicTitleFn?.(data.length) || staticTitle);

	let height = $state(300);

	const categoryLabel = $derived(searchConfig[dataSource].aggregations[selectedFacet].title);
	const categoryValue = $derived((_: GenericDataRecord, i: number) => i);
	const categories = $derived(
		data.map((d) => d.key.replaceAll('<', '&lt;').replaceAll('>', '&gt;'))
	);

	const domain = $derived<[number, number]>([0, data.length - 1]);

	const numTicks = $derived(categories.length);
	const tickFormat = $derived((tick: number) => categories[tick] || '');
	const tickValues = $derived(Array.from({ length: categories.length }, (_, i) => i));

	const countLabel = 'Count';
	const countValue = $derived(getCountValue());

	function getCountValue() {
		if (selectedGroupByFacet) {
			const values = selectedGroupByFacetValues.map((g) => {
				const key = g.key;
				return (d: GenericDataRecord) => {
					const value = d[key] || 0;
					return value;
				};
			});
			return values;
		}

		return (d: GenericDataRecord) => d.doc_count as number;
	}

	const ariaLabel = $derived(generateAriaLabel());

	function generateAriaLabel() {
		let label = '';

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

		label = `There are ${totalItems.toLocaleString()} total items across ${data.length} ${pluralize(categoryLabel.toLowerCase(), data.length)}.`;
		label = `${label} Highest count is ${maxCategory.doc_count.toLocaleString()} ${pluralize('item', maxCategory.doc_count)} for ${maxCategory.key},`;
		label = `${label} lowest is ${minCategory.doc_count.toLocaleString()} ${pluralize('item', minCategory.doc_count)} for ${minCategory.key}.`;

		return label;
	}

	const filteredGroupByFacetValues = $derived(
		selectedGroupByFacetValues.filter((g) => data.some((d) => d[g.key] > 0))
	);

	const legendItems = $derived(
		filteredGroupByFacetValues.map((g) => ({
			name: g.key,
			inactive: false
		}))
	);

	const triggers = $derived({
		[StackedBar.selectors.bar]: (d: GenericDataRecord) => {
			if (selectedGroupByFacet) {
				return filteredGroupByFacetValues
					.map((g) => `${g.key}: ${d[g.key]?.toLocaleString() || 0}`)
					.join('<br>');
			}

			return `${d.key}: ${d.doc_count.toLocaleString()}`;
		}
	});
</script>

<article>
	<header>
		<hgroup>
			<h3>{title}</h3>
			{#if dev && searchItems?.length}
				<small>{searchItems.length.toLocaleString()} items</small>
			{/if}
		</hgroup>
	</header>

	{#if isLoading}
		<p aria-busy="true">Loading...</p>
	{:else}
		<section>
			<fieldset class="grid">
				<label>
					Choose what to plot
					<select
						name="distribution-facet"
						bind:value={selectedFacet}
						onchange={() => (selectedGroupByFacet = groupByFacets?.[0]?.facet)}
					>
						{#each facets as facet}
							<option value={facet.facet}>{facet.title}</option>
						{/each}
					</select>
				</label>
				<label>
					Group by
					<select name="group-by-facet" bind:value={selectedGroupByFacet}>
						{#each groupByFacets as facet}
							<option value={facet.facet}>{facet.title}</option>
						{/each}
					</select>
				</label>
			</fieldset>

			<hgroup>
				<h3>{visTitle}</h3>
				<p>{ariaLabel}</p>
			</hgroup>

			<label>
				Chart height ({height}px)
				<input
					type="range"
					min="200"
					max="600"
					bind:value={height}
					aria-label="Adjust chart height"
				/>
				<small>Move the slider to adjust the height of the chart</small>
			</label>

			<VisXYContainer
				{data}
				{height}
				yDomain={domain}
				preventEmptyDomain={false}
				ariaLabel={`Visualisation displaying ${visTitle?.toLowerCase()}. ${ariaLabel}`}
			>
				<VisStackedBar
					x={categoryValue}
					y={countValue}
					dataStep={1}
					barPadding={0.2}
					orientation="horizontal"
				/>
				<VisAxis type="x" label={countLabel} />
				<VisAxis
					type="y"
					label={categoryLabel}
					gridLine={false}
					{numTicks}
					{tickFormat}
					{tickValues}
				/>
				{#if selectedGroupByFacet}
					<VisBulletLegend items={legendItems} />
				{/if}
				<VisTooltip {triggers} />
			</VisXYContainer>
		</section>

		<footer>
			<details>
				<summary><strong>Expand to show data used to plot the chart</strong></summary>
				<section>
					<table class="striped">
						<thead>
							<tr>
								<th>{categoryLabel}</th>
								<th>{countLabel}</th>
								{#if selectedGroupByFacet}
									{#each filteredGroupByFacetValues as group}
										<th>{group.key}</th>
									{/each}
								{/if}
							</tr>
						</thead>
						<tbody>
							{#each data as d}
								<tr>
									<td>{d.key}</td>
									<td>{d.doc_count.toLocaleString()}</td>
									{#if selectedGroupByFacet}
										{#each filteredGroupByFacetValues as group}
											<td>{d[group.key]?.toLocaleString() || 0}</td>
										{/each}
									{/if}
								</tr>
							{/each}
						</tbody>
					</table>
				</section>
			</details>
		</footer>
	{/if}
</article>
