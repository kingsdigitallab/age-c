<script lang="ts">
	import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/svelte';
	import { GroupedBar } from '@unovis/ts';

	import type { GenericDataRecord } from '@unovis/ts/types';

	const {
		data = [],
		title = 'Distribution',
		x,
		y,
		xLabel = 'x',
		yLabel = 'y',
		height = 200
	}: {
		data: { key: string; doc_count: number }[];
		title: string;
		x: string;
		y: string;
		xLabel?: string;
		yLabel?: string;
		height?: number;
	} = $props();

	const xField = $derived((_: GenericDataRecord, i: number) => i);
	const xDomain = $derived([0, data.length - 1]);
	const categories = $derived(
		data.map((d) => d.key.replaceAll('<', '&lt;').replaceAll('>', '&gt;'))
	);
	const numTicks = $derived(categories.length);
	const tickFormat = $derived((tick: number) => categories[tick] || '');
	const tickValues = $derived(Array.from({ length: categories.length }, (_, i) => i));

	const yField = $derived((d: GenericDataRecord) => d[y]);

	const triggers = $derived({
		[GroupedBar.selectors.bar]: (d) => `${d.key}: ${d.doc_count.toLocaleString()}`
	});
</script>

<section>
	<h3>{title}</h3>
	<VisXYContainer {data} {height} {xDomain} preventEmptyDomain={false}>
		<VisGroupedBar x={xField} y={yField} dataStep={1} groupPadding={0.25} />
		<VisAxis type="x" label={xLabel} gridLine={false} {numTicks} {tickFormat} {tickValues} />
		<VisAxis type="y" label={yLabel} />
		<VisTooltip {triggers} />
	</VisXYContainer>
</section>
