import { describe, it, expect } from 'vitest';
import {
	WORKER_STATUS,
	COLOUR_BY_FACET_MAX_BUCKET_SIZE,
	HIERARCHY_SEPARATOR,
	HIERARCHY_SEPARATOR_LABEL,
	HIERARCHY_SEPARATOR_LABEL_INDENT
} from './config';

describe('config.ts constants', () => {
	it('exposes worker status constants', () => {
		expect(WORKER_STATUS).toEqual({
			IDLE: 'idle',
			LOAD: 'load',
			READY: 'ready',
			SEARCH: 'search',
			RESULTS: 'results',
			INSIGHTS: 'insights',
			INSIGHTS_RESULTS: 'insights_results',
			ERROR: 'error'
		});
	});

	it('has expected UI constants', () => {
		expect(COLOUR_BY_FACET_MAX_BUCKET_SIZE).toBe(24);
		expect(HIERARCHY_SEPARATOR).toBe(':::');
		expect(HIERARCHY_SEPARATOR_LABEL).toBe('»');
		expect(HIERARCHY_SEPARATOR_LABEL_INDENT).toBe('└');
	});
});

