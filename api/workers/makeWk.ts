//import { Worker } from "worker_threads";

export function mkWorkerTest() {
    const worker = new Worker('./api/workers/testWorker.ts', { type: 'module' });
    setInterval(function () {
        worker.postMessage('');
    }, 10000);
}
