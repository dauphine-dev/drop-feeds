/* global DateTime*/
'use strict';
class WorkerPool { /* exported WorkerPool*/
  constructor(workerUrl, size) {
    this._workers = [];
    this._works = [];
    for (let i = 0; i < size; ++i) {
      this._workers.push(new Worker(workerUrl));
    }
    this._disposed = false;
  }

  queueWork(workParamArray, onComplete) {
    if (this._disposed) { return; }
    this._works.push({ paramArray: workParamArray, onComplete: onComplete });
  }

  async start_async() {
    let work = undefined;
    while (!this._disposed) {
      if (this._disposed) { return; }
      if (!work && this._works.length > 0) {
        work = this._works.shift();
      }
      if (work) {
        if (this._workerObjs.length > 0) {
          let workerObj = this._workerObjs.shift();
          this._startWork(workerObj, work);
          work = undefined;
        }
      }
      await DateTime.sleep_async(1);
    }
  }

  dispose() {
    this._disposed = true;
    for (let workerObj of this._workerObjs) {
      workerObj.worker.terminate();
    }
  }

  _startWork(worker, work) {
    worker.onmessage = (() => {
      this._workerObjs.push(worker);
    });
    worker.addEventListener('message', (e) => work.onComplete(e));
    worker.postMessage(work.paramArray);
  }
}
