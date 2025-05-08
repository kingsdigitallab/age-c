import { searchConfig } from '$lib';
import { WORKER_STATUS } from './config';
import { initSearchEngine, search } from './search';

addEventListener('message', async (event) => {
	const { action, payload } = event.data;

	if (action === WORKER_STATUS.LOAD) {
		const { basePath, dataSource } = payload;
		const config = searchConfig[dataSource as keyof typeof searchConfig];
		const data = await fetch(`${basePath}/api/search/${dataSource}.json`).then((res) => res.json());

		initSearchEngine(dataSource, data, config);
		postMessage({ action: WORKER_STATUS.READY });
	} else if (action === WORKER_STATUS.SEARCH) {
		const results = search(payload);

		postMessage({ action: WORKER_STATUS.RESULTS, payload: { query: payload.query, results } });
	}
});
