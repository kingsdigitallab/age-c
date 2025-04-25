<script lang="ts">
	import type { Item } from '$lib/types';

	const { items = [] }: { items: Item[] } = $props();
</script>

<table>
	<thead>
		<tr>
			<th>Title</th>
			<th>Year</th>
			<th>Genre</th>
		</tr>
	</thead>
	<tbody>
		{#each items as item}
			<tr>
				<td>
					<a href="films/{item.slug}" data-tooltip={item.titleEn}>
						<strong>{item.title}</strong>
					</a>
				</td>
				<td>{item.releaseYear}</td>
				<td>{Array.isArray(item.genre) ? item.genre.join(', ') : item.genre}</td>
			</tr>
		{/each}
	</tbody>
</table>
