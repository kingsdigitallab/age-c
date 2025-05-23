<script lang="ts">
	import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/svelte';
	import { GroupedBar } from '@unovis/ts';
	import type { GenericDataRecord } from '@unovis/ts/types';
	import pluralize from 'pluralize-esm';

	const {
		isLoading,
		distributionFacets,
		searchAggregations,
		searchConfig,
		dataSource,
		height = 200
	}: {
		isLoading: boolean;
		distributionFacets: {
			facet: string;
			title: string;
			dynamicTitle?: (count: number) => string;
		}[];
		searchAggregations: Record<string, { buckets: { key: string; doc_count: number }[] }>;
		searchConfig: Record<string, { aggregations: Record<string, { title: string }> }>;
		dataSource: string;
		height?: number;
	} = $props();

	let innerWidth = $state(0);

	let selectedDistributionFacet = $state(distributionFacets?.[0]?.facet);
	let showTable = $state(false);

	const data = $derived(searchAggregations[selectedDistributionFacet]?.buckets || []);

	const title = $derived(
		distributionFacets.find((facet) => facet.facet === selectedDistributionFacet)?.title
	);
	const dynamicTitle = $derived(
		distributionFacets.find((facet) => facet.facet === selectedDistributionFacet)?.dynamicTitle
	);
	const visTitle = $derived(dynamicTitle?.(data.length) || title);

	const x = 'key';
	const xLabel = $derived(searchConfig[dataSource].aggregations[selectedDistributionFacet].title);
	const xField = $derived((_: GenericDataRecord, i: number) => i);
	const xDomain = $derived<[number, number]>([0, data.length - 1]);
	const categories = $derived(
		data.map((d) => d.key.replaceAll('<', '&lt;').replaceAll('>', '&gt;'))
	);
	const numTicks = $derived(categories.length);
	const tickFormat = $derived((tick: number) => categories[tick] || '');
	const tickValues = $derived(Array.from({ length: categories.length }, (_, i) => i));

	const y = 'doc_count';
	const yLabel = 'Count';
	const yField = $derived((d: GenericDataRecord) => d[y]);

	const triggers = $derived({
		[GroupedBar.selectors.bar]: (d) => `${d.key}: ${d.doc_count.toLocaleString()}`
	});

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

		label = `There are ${totalItems.toLocaleString()} total items across ${data.length} ${pluralize(xLabel.toLowerCase(), data.length)}.`;
		label = `${label} Highest count is ${maxCategory.doc_count.toLocaleString()} ${pluralize('item', maxCategory.doc_count)} for ${maxCategory.key},`;
		label = `${label} lowest is ${minCategory.doc_count.toLocaleString()} ${pluralize('item', minCategory.doc_count)} for ${minCategory.key}.`;

		return label;
	}
</script>

<svelte:window bind:innerWidth />

<article>
	<h3>Visualisations</h3>
	{#if isLoading}
		<p aria-busy="true">Loading...</p>
	{:else}
		<fieldset>
			<label>
				Choose what to plot
				<select name="distribution-facet" bind:value={selectedDistributionFacet}>
					{#each distributionFacets as facet}
						<option value={facet.facet}>{facet.title}</option>
					{/each}
				</select>
			</label>
		</fieldset>

		<hgroup>
			<h3>{visTitle}</h3>
			<p>{ariaLabel}</p>
		</hgroup>

		<button class="outline" onclick={() => (showTable = !showTable)} aria-pressed={showTable}>
			{showTable ? 'Show chart' : 'Show data used to plot chart'}
		</button>

		<section>
			{#if showTable}
				<table class="striped">
					<thead>
						<tr>
							<th>{xLabel}</th>
							<th>{yLabel}</th>
						</tr>
					</thead>
					<tbody>
						{#each data as d}
							<tr>
								<td>{d.key}</td>
								<td>{d.doc_count.toLocaleString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<VisXYContainer
					{data}
					{height}
					{xDomain}
					preventEmptyDomain={false}
					ariaLabel={`Visualisation displaying ${visTitle?.toLowerCase()}. ${ariaLabel}`}
				>
					<VisGroupedBar x={xField} y={yField} dataStep={1} groupPadding={0.25} />
					<VisAxis type="x" label={xLabel} gridLine={false} {numTicks} {tickFormat} {tickValues} />
					<VisAxis type="y" label={yLabel} />
					<VisTooltip {triggers} />
				</VisXYContainer>
			{/if}
		</section>
	{/if}
</article>
