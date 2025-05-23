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
		height = 400
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

	const categoryLabel = $derived(
		searchConfig[dataSource].aggregations[selectedDistributionFacet].title
	);
	const categoryValue = $derived((_: GenericDataRecord, i: number) => i);
	const categories = $derived(
		data.map((d) => d.key.replaceAll('<', '&lt;').replaceAll('>', '&gt;'))
	);

	const domain = $derived<[number, number]>([0, data.length - 1]);

	const numTicks = $derived(categories.length);
	const tickFormat = $derived((tick: number) => categories[tick] || '');
	const tickValues = $derived(Array.from({ length: categories.length }, (_, i) => i));

	const countField = 'doc_count';
	const countLabel = 'Count';
	const countValue = $derived((d: GenericDataRecord) => d[countField] as number);

	const triggers = $derived({
		[GroupedBar.selectors.bar]: (d: { key: string; doc_count: number }) =>
			`${d.key}: ${d.doc_count.toLocaleString()}`
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

		label = `There are ${totalItems.toLocaleString()} total items across ${data.length} ${pluralize(categoryLabel.toLowerCase(), data.length)}.`;
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
		<section>
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
		</section>

		<section>
			{#if showTable}
				<table class="striped">
					<thead>
						<tr>
							<th>{categoryLabel}</th>
							<th>{countLabel}</th>
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
					yDomain={domain}
					preventEmptyDomain={false}
					ariaLabel={`Visualisation displaying ${visTitle?.toLowerCase()}. ${ariaLabel}`}
				>
					<VisGroupedBar
						x={categoryValue}
						y={countValue}
						dataStep={1}
						groupPadding={0.25}
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
		</section>
	{/if}
</article>
