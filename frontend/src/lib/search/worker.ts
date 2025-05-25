import { WORKER_STATUS } from './config';
import { initSearchEngine, reloadSearchEngine, search } from './search';

addEventListener('message', async (event) => {
	const { action, payload } = event.data;

	switch (action) {
		case WORKER_STATUS.LOAD: {
			postMessage({ action: WORKER_STATUS.LOAD });

			const { basePath, dataSource, config, reload = false } = payload;
			const data = await fetch(`${basePath}/api/search/${dataSource}.json`).then((res) =>
				res.json()
			);

			if (reload) {
				reloadSearchEngine(dataSource, data, config);
			} else {
				initSearchEngine(dataSource, data, config);
			}

			postMessage({ action: WORKER_STATUS.READY });
			break;
		}
		case WORKER_STATUS.SEARCH: {
			const results = search(payload);
			postMessage({ action: WORKER_STATUS.RESULTS, payload: { query: payload.query, results } });
			break;
		}
		case WORKER_STATUS.INSIGHTS: {
			const results = search(payload);
			postMessage({
				action: WORKER_STATUS.INSIGHTS_RESULTS,
				payload: { query: payload.query, results }
			});
			break;
		}
	}
});
