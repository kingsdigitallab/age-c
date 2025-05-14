import { WORKER_STATUS } from './config';
import SearchWorker from './worker?worker';

const state = $state({
	worker: null as Worker | null,
	status: WORKER_STATUS.IDLE,
	error: null as string | null
});

export function getWorkerStatus() {
	return state.status;
}

export function getWorkerError() {
	return state.error;
}

export function initWorker(basePath: string, dataSource: string) {
	const newWorker = new SearchWorker();

	newWorker.onmessage = (event) => {
		const { action, payload } = event.data;
		state.error = null;

		if (action === WORKER_STATUS.READY) {
			state.status = WORKER_STATUS.READY;
		} else if (action === WORKER_STATUS.ERROR) {
			state.error = payload;
			state.status = WORKER_STATUS.READY;
		}
	};

	newWorker.onerror = (error: ErrorEvent) => {
		state.error = 'An error occurred while searching';
		state.status = WORKER_STATUS.READY;
		console.error('Search worker error:', error);
	};

	state.worker = newWorker;
	state.status = WORKER_STATUS.LOAD;

	newWorker.postMessage({ action: WORKER_STATUS.LOAD, payload: { basePath, dataSource } });

	return newWorker;
}

export function cleanupWorker() {
	if (state.worker) {
		state.worker.terminate();
		state.worker = null;
	}
	state.status = WORKER_STATUS.IDLE;
	state.error = null;
}
