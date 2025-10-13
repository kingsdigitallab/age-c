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
	import { COLOUR_BY_FACET_MAX_BUCKET_SIZE } from '$lib/search/config';

	const {
		title = 'Overview',
		isLoading,
		facets,
		searchItems = undefined,
		searchFilters,
		searchAggregations,
		searchConfig,
		dataSource,
		colourByFacetMaxBucketSize = COLOUR_BY_FACET_MAX_BUCKET_SIZE
	}: {
		title?: string;
		isLoading: boolean;
		facets: {
			facet: string;
			title: string;
			dynamicTitle?: (count: number) => string;
		}[];
		searchItems?: Item[];
		searchFilters: Record<string, string[]>;
		searchAggregations: Record<string, { buckets: Bucket[] }>;
		searchConfig: Record<string, { aggregations: Record<string, { title: string }> }>;
		dataSource: string;
		colourByFacetMaxBucketSize?: number;
	} = $props();

	let selectedFacet = $state<string>(facets?.[0]?.facet);

	const groupByFacets = $derived([
		{ facet: '', title: 'None', active: true },
		...Object.entries(searchConfig[dataSource].aggregations)
			.filter(([key, _]) => key !== selectedFacet)
			// filter out the ones that have more than 32 buckets
			.map(([key, aggregation]) => ({
				facet: key,
				title: aggregation.title,
				active:
					searchAggregations[key]?.buckets.filter((bucket) => bucket.doc_count > 0).length > 0 &&
					searchAggregations[key].buckets.filter((bucket) => bucket.doc_count > 0).length <=
						colourByFacetMaxBucketSize
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

	let maxCategories = $state<number>(10);

	const selectedFacetBuckets = $derived(searchAggregations[selectedFacet]?.buckets || []);

	const data = $derived(
		getData({
			selectedFacet,
			selectedGroupByFacet,
			searchItems,
			searchAggregations,
			selectedGroupByFacetValues,
			maxCategories
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
		if (selectedGroupByFacet) {
			return selectedGroupByFacetValues.map((g) => (d: Bucket) => (d[g.key] as number) || 0);
		}

		return (d: Bucket) => d.doc_count;
	});

	const visMetadata = $derived({
		title:
			facets.find((f) => f.facet === selectedFacet)?.dynamicTitle?.(data.length) ||
			facets.find((f) => f.facet === selectedFacet)?.title,
		ariaLabel: generateAriaLabel({
			data: selectedFacetBuckets,
			categoryLabel
		})
	});

	const groupByMetadata = $derived({
		filteredValues: selectedGroupByFacetValues.filter((g) =>
			data.some((d) => (d[g.key] as number) > 0)
		),
		legendItems: selectedGroupByFacetValues
			.filter((g) => data.some((d) => (d[g.key] as number) > 0))
			.map((g) => ({
				name: g.key,
				title: searchConfig[dataSource].aggregations[selectedGroupByFacet].title,
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
		[GroupedBar.selectors.bar]: getBarTooltip,
		[StackedBar.selectors.bar]: getBarTooltip,
		[NestedDonut.selectors.segment]: (d: GenericDataRecord) => {
			if (selectedGroupByFacet) {
				return `${d.data.root} → ${d.data.key}: ${d.value.toLocaleString()} ${pluralize('item', d.value)}`;
			}

			return `${d.data.key}: ${d.value.toLocaleString()} ${pluralize('item', d.value)}`;
		}
	});

	function getBarTooltip(d: Bucket): string {
		const safeTitle = escapeHTML(d.key);

		if (selectedGroupByFacet) {
			const details = groupByMetadata.filteredValues
				.map((g) => {
					const count = (d[g.key] as number) || 0;
					const safeKey = escapeHTML(g.key);
					return `<em>${safeKey}</em>: <strong>${count.toLocaleString()}</strong> ${pluralize('item', count)}`;
				})
				.join('<br>');

			return `<h6>${safeTitle}</h6>${details}`;
		}

		return `<h6>${safeTitle}</h6><strong>${d.doc_count.toLocaleString()}</strong> ${pluralize('item', d.doc_count)}`;
	}

	function escapeHTML(str: string): string {
		if (!str) return '';

		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	let isDownloading = $state(false);

	function downloadVisualisation(e: Event) {
		e.preventDefault();
		isDownloading = true;

		const plotContainer = document.getElementById('skij-plot-container');
		if (plotContainer) {
			const styles = document.getElementsByTagName('style');
			const stylesData = Array.from(styles)
				.map((s) => s.textContent)
				.join('\n');

			const svg = plotContainer.querySelector('svg');
			if (svg) {
				const svgClone = svg.cloneNode(true) as SVGElement;

				const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
				styleElement.textContent = stylesData;
				styleElement.setAttribute('type', 'text/css');

				svgClone.insertBefore(styleElement, svgClone.firstChild);

				const svgData = new XMLSerializer().serializeToString(svgClone);

				const blob = new Blob([svgData], {
					type: 'image/svg+xml;charset=utf-8'
				});
				const url = URL.createObjectURL(blob);

				const a = document.createElement('a');
				a.href = url;
				a.download = `${visMetadata.title}.svg`;
				a.click();
				a.remove();

				URL.revokeObjectURL(url);
			}
		}

		isDownloading = false;
	}
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
				<DevOnly>
					<button
						class="outline"
						onclick={(e) => downloadVisualisation(e)}
						aria-busy={isDownloading}
						aria-label="Download visualisation"
					>
						Download visualisation
					</button>
				</DevOnly>
			</hgroup>

			<label>
				Max categories to plot ({maxCategories})
				<input
					type="range"
					min={Math.min(2, selectedFacetBuckets.length)}
					max={Math.min(selectedFacetBuckets.length, 50)}
					step="1"
					bind:value={maxCategories}
					aria-label="Adjust max categories"
				/>
				<small>Move the slider to adjust the maximum number of categories</small>
			</label>
			<label>
				Chart height ({height}px)
				<input
					type="range"
					min="200"
					max="2000"
					bind:value={height}
					aria-label="Adjust chart height"
				/>
				<small>Move the slider to adjust the height of the chart</small>
			</label>

			<div id="skij-plot-container">
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
					{#if selectedGroupByFacet}
						<details class="legend" open={groupByMetadata.legendItems.length <= 8}>
							<summary>
								{groupByMetadata.legendItems[0].title} legend
							</summary>
							<VisBulletLegend items={groupByMetadata.legendItems} />
						</details>
					{/if}

					<VisXYContainer
						{data}
						{height}
						yDomain={domain}
						preventEmptyDomain={false}
						ariaLabel={`Visualisation displaying ${visMetadata.title?.toLowerCase()}. ${visMetadata.ariaLabel}`}
						yDirection="south"
					>
						<BarComponent
							x={categoryValue}
							y={countValue()}
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
						<VisTooltip {triggers} />
					</VisXYContainer>
				{/if}
			</div>
		</section>

		<footer>
			<DataInsightsTable
				{data}
				{categoryLabel}
				{countLabel}
				{selectedGroupByFacet}
				{groupByMetadata}
				{searchFilters}
			/>
		</footer>
	{/if}
</article>
