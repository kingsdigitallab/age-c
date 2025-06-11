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

	let isDownloading = $state(false);

	function downloadData() {
		isDownloading = true;

		const headers = [categoryLabel, countLabel];
		if (selectedGroupByFacet) {
			headers.push(...groupByMetadata.filteredValues.map((group) => group.key));
		}

		const rows = data.map((d) => {
			const row = [d.key, d.doc_count];
			if (selectedGroupByFacet) {
				for (const group of groupByMetadata.filteredValues) {
					row.push(d[group.key] || 0);
				}
			}
			return row;
		});

		const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

		const a = document.createElement('a');
		a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
		a.download = `${categoryLabel}_${selectedGroupByFacet}.csv`.replace(/\s+/g, '_').toLowerCase();
		a.click();
		a.remove();

		isDownloading = false;
	}
</script>

<details>
	<summary><strong>Expand to show data used to plot the chart</strong></summary>
	<section>
		<button
			class="outline"
			aria-label="Download used to plot the chart"
			aria-busy={isDownloading}
			disabled={isDownloading}
			onclick={() => downloadData()}
		>
			Download data
		</button>
	</section>

	{#if Object.keys(searchFilters).length > 0}
		<section>
			<small>
				<p>Current filters:</p>
				<ul>
					{#each Object.entries(searchFilters) as [k, v]}
						<li>
							<strong>{k}</strong>: {v.join(', ')}
						</li>
					{/each}
				</ul>
			</small>
		</section>
	{/if}
	<section class="overflow-auto">
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
