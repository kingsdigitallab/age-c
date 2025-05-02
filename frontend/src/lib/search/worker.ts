import { searchConfig } from '$lib';
import { initSearchEngine, search } from './search';

addEventListener('message', async (event) => {
	const { action, payload } = event.data;

	if (action === 'load') {
		const { basePath, dataSource } = payload;
		const config = searchConfig[dataSource as keyof typeof searchConfig];
		const data = await fetch(`${basePath}/api/search/${dataSource}.json`).then((res) => res.json());

		initSearchEngine(dataSource, data, config);
		postMessage({ action: 'ready' });
	} else if (action === 'search') {
		const results = search(payload);

		postMessage({ action: 'results', payload: { query: payload.query, results } });
	}
});
