import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('should render h1', () => {
		render(Page, { data: { searchWorker: undefined }, params: {} as Record<string, string> });
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
});
