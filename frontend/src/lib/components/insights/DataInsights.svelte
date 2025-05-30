<script lang="ts">
	import DevOnly from '$lib/components/DevOnly.svelte';
	import type { Item } from '$lib/types';
	import {
		VisAxis,
		VisBulletLegend,
		VisStackedBar,
		VisTooltip,
		VisXYContainer
	} from '@unovis/svelte';
	import { StackedBar } from '@unovis/ts';
	import type { GenericDataRecord } from '@unovis/ts/types';
	import type { Bucket } from './dataTransforms';
	import { generateAriaLabel, getData } from './dataTransforms';

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
		searchAggregations: Record<string, { buckets: Bucket[] }>;
		searchConfig: Record<string, { aggregations: Record<string, { title: string }> }>;
		dataSource: string;
	} = $props();

	let selectedFacet = $state(facets?.[0]?.facet);

	const groupByFacets = $derived([
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

	const data = $derived(
		getData({
			selectedFacet,
			selectedGroupByFacet,
			searchItems,
			searchAggregations,
			selectedGroupByFacetValues
		})
	);

	const staticTitle = $derived(facets.find((facet) => facet.facet === selectedFacet)?.title);
	const dynamicTitleFn = $derived(
		facets.find((facet) => facet.facet === selectedFacet)?.dynamicTitle
	);
	const visTitle = $derived(dynamicTitleFn?.(data.length) || staticTitle);

	let height = $state(350);

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
				return (d: Bucket) => {
					const value = (d[key] as number) || 0;
					return value;
				};
			});
			return values;
		}

		return (d: Bucket) => d.doc_count;
	}

	const ariaLabel = $derived(generateAriaLabel({ data, categoryLabel }));

	const filteredGroupByFacetValues = $derived(
		selectedGroupByFacetValues.filter((g) => data.some((d) => (d[g.key] as number) > 0))
	);

	const legendItems = $derived(
		filteredGroupByFacetValues.map((g) => ({
			name: g.key,
			inactive: false
		}))
	);

	// Tooltips
	const triggers = $derived({
		[StackedBar.selectors.bar]: (d: Bucket) => {
			if (selectedGroupByFacet) {
				return filteredGroupByFacetValues
					.map((g) => `${g.key}: ${(d[g.key] as number)?.toLocaleString() || 0}`)
					.join('<br>');
			}

			return `${d.key}: ${d.doc_count.toLocaleString()}`;
		}
	});
</script>

<article>
	<header>
		<hgroup>
			<h2>{title}</h2>
			{#if searchItems?.length}
				<DevOnly>{searchItems.length.toLocaleString()} Records</DevOnly>
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

			<DevOnly>
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
			</DevOnly>

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
				<section class="overflow-auto">
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
