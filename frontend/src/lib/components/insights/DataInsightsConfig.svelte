<script lang="ts">
	let {
		facets,
		groupByFacets,
		selectedFacet = $bindable(''),
		selectedGroupByFacet = $bindable(''),
		selectedPlotType = $bindable('')
	}: {
		facets: {
			facet: string;
			title: string;
			dynamicTitle?: (count: number) => string;
		}[];
		groupByFacets: { facet: string; title: string }[];
		selectedFacet: string;
		selectedGroupByFacet: string;
		selectedPlotType: string;
	} = $props();
</script>

<fieldset class="grid">
	<label>
		Choose what to plot
		<select
			name="distribution-facet"
			bind:value={selectedFacet}
			onchange={() => (selectedGroupByFacet = '')}
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
	<label>
		Choose chart type
		<select name="plot-type" bind:value={selectedPlotType}>
			<option value="bar-stacked">Bar - Stacked</option>
			<option value="bar-grouped">Bar - Grouped</option>
			<option value="donut">Donut</option>
		</select>
	</label>
</fieldset>
