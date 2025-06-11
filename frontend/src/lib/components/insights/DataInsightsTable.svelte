<script lang="ts">
	import type { Bucket } from './dataTransforms';

	const {
		data,
		categoryLabel,
		countLabel,
		selectedGroupByFacet,
		groupByMetadata,
		searchFilters
	}: {
		data: Bucket[];
		categoryLabel: string;
		countLabel: string;
		selectedGroupByFacet: string;
		groupByMetadata: {
			filteredValues: Bucket[];
		};
		searchFilters: Record<string, string[]>;
	} = $props();
</script>

<details>
	<summary><strong>Expand to show data used to plot the chart</strong></summary>
	<section class="overflow-auto">
		{#if Object.keys(searchFilters).length > 0}
			<small>
				<p>Filters applied:</p>
				<ul>
					{#each Object.entries(searchFilters) as [k, v]}
						<li>
							<strong>{k}</strong>: {v.join(', ')}
						</li>
					{/each}
				</ul>
			</small>
		{/if}
		<table class="striped">
			<thead>
				<tr>
					<th>{categoryLabel}</th>
					<th class="text-right">{countLabel}</th>
					{#if selectedGroupByFacet}
						{#each groupByMetadata.filteredValues as group}
							<th class="text-right">{group.key}</th>
						{/each}
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each data as d}
					<tr>
						<td>{d.key}</td>
						<td class="text-right">{d.doc_count.toLocaleString()}</td>
						{#if selectedGroupByFacet}
							{#each groupByMetadata.filteredValues as group}
								<td class="text-right">{d[group.key]?.toLocaleString() || 0}</td>
							{/each}
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</details>
