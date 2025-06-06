<script lang="ts">
	import type { Bucket } from './dataTransforms';

	const {
		data,
		categoryLabel,
		countLabel,
		selectedGroupByFacet,
		groupByMetadata
	}: {
		data: Bucket[];
		categoryLabel: string;
		countLabel: string;
		selectedGroupByFacet: string;
		groupByMetadata: {
			filteredValues: Bucket[];
		};
	} = $props();
</script>

<details>
	<summary><strong>Expand to show data used to plot the chart</strong></summary>
	<section class="overflow-auto">
		<table class="striped">
			<thead>
				<tr>
					<th>{categoryLabel}</th>
					<th>{countLabel}</th>
					{#if selectedGroupByFacet}
						{#each groupByMetadata.filteredValues as group}
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
							{#each groupByMetadata.filteredValues as group}
								<td>{d[group.key]?.toLocaleString() || 0}</td>
							{/each}
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</details>
