<script lang="ts">
	import type { Film, Role } from '$lib/types';
	import FilmLink from './FilmLink.svelte';
	import FilterLink from './FilterLink.svelte';

	const { roles }: { roles: Role[] } = $props();
</script>

<div class="overflow-auto">
	<table class="striped">
		<thead>
			<tr>
				<th>Film</th>
				<th>Role</th>
				<th>Year</th>
				<th>Country</th>
			</tr>
		</thead>
		<tbody>
			{#each roles as role}
				{@const film = role?.film as Film}
				<tr>
					<td>
						<strong>
							<FilmLink {film} />
						</strong>
					</td>
					<td><FilterLink name="role" value={role.role} /></td>
					<td>{film?.release?.year || ''}</td>
					<td>
						<ul class="layout-inline">
							{#each film?.production as production}
								<li>
									<FilterLink name="productionCountry" value={production.country} />
								</li>
							{/each}
						</ul>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
