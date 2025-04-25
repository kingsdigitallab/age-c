<script lang="ts">
	import type { Item } from '$lib/types';

	const { items = [] }: { items: Item[] } = $props();
</script>

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Gender</th>
			<th>Birth year</th>
			<th>Death year</th>
		</tr>
	</thead>
	<tbody>
		{#each items as item}
			<tr>
				<td>
					<a href="biographies/{item.slug}" data-tooltip={item.perName}>
						<strong>{item.perName}</strong>
					</a>
				</td>
				<td>{item.perGender}</td>
				<td>{item?.perBirthYear > 0 ? item.perBirthYear : ''}</td>
				<td>{item?.perDeathYear > 0 ? item.perDeathYear : ''}</td>
			</tr>
		{/each}
	</tbody>
</table>
