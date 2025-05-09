<script lang="ts">
	import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/svelte';
	import { GroupedBar } from '@unovis/ts';

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

	const triggers = { [GroupedBar.selectors.bar]: (d) => `${d.key}: ${d.doc_count}` };
</script>

<section>
	<h3>{title}</h3>
	<VisXYContainer {height}>
		<VisGroupedBar {data} x={(d) => d[x]} y={(d) => d[y]} dataStep={1} groupPadding={0.25} />
		<VisAxis type="x" label={xLabel} numTicks={data.length / 2} gridLine={false} />
		<VisAxis type="y" label={yLabel} />
		<VisTooltip {triggers} />
	</VisXYContainer>
</section>
