<script lang="ts">
	import type { Person, Role } from '$lib/types';
	import BiographyLink from './BiographyLink.svelte';
	import FilterLink from './FilterLink.svelte';

	const { roles }: { roles: Role[] } = $props();
</script>

<div class="overflow-auto">
	<table class="striped">
		<thead>
			<tr>
				<th>Actor</th>
				<th>Role</th>
				<th>Birth year</th>
				<th>Death year</th>
				<th>Gender</th>
				<th>Nationality</th>
			</tr>
		</thead>
		<tbody>
			{#each roles as role}
				<tr>
					<td>
						<strong>
							<BiographyLink person={role?.person as Person} showAgeGender={false} />
						</strong>
					</td>
					<td><FilterLink name="role" value={role.role} /></td>
					<td>{role?.person?.birthYear || ''}</td>
					<td>{role?.person?.deathYear || ''}</td>
					<td><FilterLink name="gender" value={role?.person?.gender} /></td>
					<td><FilterLink name="nationality" value={role?.person?.nationality} /></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
