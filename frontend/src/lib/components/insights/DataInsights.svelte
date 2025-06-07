<script lang="ts">
	import DevOnly from '$lib/components/DevOnly.svelte';
	import type { Item } from '$lib/types';
	import {
		VisAxis,
		VisBulletLegend,
		VisGroupedBar,
		VisNestedDonut,
		VisSingleContainer,
		VisStackedBar,
		VisTooltip,
		VisXYContainer
	} from '@unovis/svelte';
	import { GroupedBar, NestedDonut, StackedBar } from '@unovis/ts';
	import type { GenericDataRecord } from '@unovis/ts/types';
	import pluralize from 'pluralize-esm';
	import DataInsightsConfig from './DataInsightsConfig.svelte';
	import DataInsightsTable from './DataInsightsTable.svelte';
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

	let selectedFacet = $state<string>(facets?.[0]?.facet);

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

	let selectedGroupByFacet = $state<string>('');

	let selectedPlotType = $state<string>('bar-stacked');
	const BarComponent = $derived(selectedPlotType === 'bar-stacked' ? VisStackedBar : VisGroupedBar);
	const DonutComponent = VisNestedDonut;

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

	let height = $state<number>(350);

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
	const countValue = $derived(() => {
		if (!selectedGroupByFacet) {
			return (d: Bucket) => d.doc_count;
		}

		return selectedGroupByFacetValues.map((g) => (d: Bucket) => (d[g.key] as number) || 0);
	});

	const visMetadata = $derived({
		title:
			facets.find((f) => f.facet === selectedFacet)?.dynamicTitle?.(data.length) ||
			facets.find((f) => f.facet === selectedFacet)?.title,
		ariaLabel: generateAriaLabel({ data, categoryLabel })
	});

	const groupByMetadata = $derived({
		filteredValues: selectedGroupByFacetValues.filter((g) =>
			data.some((d) => (d[g.key] as number) > 0)
		),
		legendItems: selectedGroupByFacetValues.map((g) => ({
			name: g.key,
			inactive: false
		}))
	});

	const donutData = $derived(() => {
		if (!selectedGroupByFacet) {
			return data.map((d) => ({
				key: d.key,
				value: d.doc_count
			}));
		}

		return data.flatMap((d) =>
			groupByMetadata.filteredValues.map((g) => ({
				group: d.key,
				subgroup: g.key,
				value: d[g.key] as number
			}))
		);
	});

	const donutLayers = $derived(() => {
		if (!selectedGroupByFacet) {
			return [(d: GenericDataRecord) => d.key];
		}

		return [(d: GenericDataRecord) => d.group, (d: GenericDataRecord) => d.subgroup];
	});

	const triggers = $derived({
		[GroupedBar.selectors.bar]: (d: Bucket) => {
			if (selectedGroupByFacet) {
				return groupByMetadata.filteredValues
					.map(
						(g) =>
							`${g.key}: ${(d[g.key] as number)?.toLocaleString() || 0} ${pluralize('item', (d[g.key] as number) || 0)}`
					)
					.join('<br>');
			}

			return `${d.key}: ${d.doc_count.toLocaleString()} ${pluralize('item', d.doc_count)}`;
		},
		[StackedBar.selectors.bar]: (d: Bucket, i: number) => {
			if (selectedGroupByFacet) {
				return groupByMetadata.filteredValues
					.map(
						(g) =>
							`${g.key}: ${(d[g.key] as number)?.toLocaleString() || 0} ${pluralize('item', (d[g.key] as number) || 0)}`
					)
					.join('<br>');
			}

			return `${d.key}: ${d.doc_count.toLocaleString()} ${pluralize('item', d.doc_count)}`;
		},
		[NestedDonut.selectors.segment]: (d: GenericDataRecord) => {
			if (selectedGroupByFacet) {
				return `${d.data.root} → ${d.data.key}: ${d.value.toLocaleString()} ${pluralize('item', d.value)}`;
			}

			return `${d.data.key}: ${d.value.toLocaleString()} ${pluralize('item', d.value)}`;
		}
	});
</script>

<article>
	<hgroup>
		<h2>{title}</h2>
		{#if searchItems?.length}
			<DevOnly
				>{searchItems.length.toLocaleString()} {pluralize('record', searchItems.length)}</DevOnly
			>
		{/if}
	</hgroup>

	{#if isLoading}
		<p aria-busy="true">Loading...</p>
	{:else}
		<section>
			<DataInsightsConfig
				{facets}
				{groupByFacets}
				bind:selectedFacet
				bind:selectedGroupByFacet
				bind:selectedPlotType
			/>

			<hgroup>
				<h3>{visMetadata.title}</h3>
				<p>{visMetadata.ariaLabel}</p>
			</hgroup>

			<DevOnly>
				<label>
					Chart height ({height}px)
					<input
						type="range"
						min="200"
						max="800"
						bind:value={height}
						aria-label="Adjust chart height"
					/>
					<small>Move the slider to adjust the height of the chart</small>
				</label>
			</DevOnly>

			{#if selectedPlotType === 'donut'}
				<VisSingleContainer data={donutData()} height={height * 1.5}>
					<DonutComponent
						layers={donutLayers()}
						value={(d: GenericDataRecord) => d.value}
						centerLabel={visMetadata.title}
						direction="outwards"
						layerPadding={10}
					/>
					<VisTooltip {triggers} />
				</VisSingleContainer>
			{:else}
				<VisXYContainer
					{data}
					{height}
					yDomain={domain}
					preventEmptyDomain={false}
					ariaLabel={`Visualisation displaying ${visMetadata.title?.toLowerCase()}. ${visMetadata.ariaLabel}`}
				>
					{#if selectedPlotType === 'bar-stacked' || selectedPlotType === 'bar-grouped'}
						<BarComponent
							x={categoryValue}
							y={countValue()}
							dataStep={1}
							barPadding={0.2}
							orientation="horizontal"
						/>
					{/if}
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
						<VisBulletLegend items={groupByMetadata.legendItems} />
					{/if}
					<VisTooltip {triggers} />
				</VisXYContainer>
			{/if}
		</section>

		<footer>
			<DataInsightsTable
				{data}
				{categoryLabel}
				{countLabel}
				{selectedGroupByFacet}
				{groupByMetadata}
			/>
		</footer>
	{/if}
</article>
