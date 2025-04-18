import { base } from '$app/paths';
import { searchConfig } from '$lib';
import { initSearchEngine, search } from './search';

addEventListener('message', async (event) => {
	const { action, payload } = event.data;

	if (action === 'load') {
		const dataSource = payload.dataSource;
		const config = searchConfig[dataSource as keyof typeof searchConfig];
		const data = await fetch(`${base}/api/${dataSource}`).then((res) => res.json());

		initSearchEngine(dataSource, data, config);
		postMessage({ action: 'ready' });
	} else if (action === 'search') {
		const { dataSource, query, filters } = payload;
		const results = search(dataSource, query, filters);

		postMessage({ action: 'results', payload: { query, results } });
	}
});
