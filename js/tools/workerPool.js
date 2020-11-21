/* global browser*/
'use strict';
class WorkerPool { /* exported WorkerPool*/
  constructor(workerUrl, size) {
    this._workerUrl = browser.runtime.getURL(workerUrl);
    this._size = size;
    this._workerList = [];
    this._workList = [];
    this._disposed = false;
  }

  async init_async() {
    for (let i = 0; i < this._size; ++i) {
      this._workerList.push(new Worker(this._workerUrl));
    }
    let self = this;
    this._workerList.push = function () { let result = Array.prototype.push.apply(this, arguments); self._onWorkerListHasChanged_event({ method: 'push', array: result }); return result; };
    this._workList.push = function () { let result = Array.prototype.push.apply(this, arguments); self._onWorkListHasChanged_event({ method: 'push', array: result }); return result; };
  }

  queueWork(workParamArray, onComplete) {
    if (this._disposed) { return; }
    let work = { paramArray: workParamArray, onComplete: onComplete };
    this._workList.push(work);
  }

  async _onWorkerListHasChanged_event() {
    this._processWorks();
  }

  async _onWorkListHasChanged_event() {
    this._processWorks();
  }

  dispose() {
    this._disposed = true;
    for (let worker of this._workerList) {
      worker.terminate();
    }
  }

  async _processWorks() {
    if (this._disposed) { return; }
    if (this._workerList.length > 0 && this._workList.length > 0) {
      this._startWork(this._workerList.shift(), this._workList.shift());
    }
  }

  _startWork(worker, work) {
    let onCompleteListener1 = ((e) => { work.onComplete(e); });
    let onCompleteListener2 = (() => {
      if (this._disposed) { return; }
      worker.removeEventListener('message', onCompleteListener1);
      worker.removeEventListener('message', onCompleteListener2);
      this._workerList.push(worker);
    });
    worker.addEventListener('message', onCompleteListener1);
    worker.addEventListener('message', onCompleteListener2);
    worker.postMessage(work.paramArray);
  }
}

class WorkerReplace {  /*exported WorkerReplace*/
  constructor(size) {
    this._workerPool =  new WorkerPool('js/workers/wkReplace.js', size);
  }

  async init_async() {
    await this._workerPool.init_async();
  }

  async replace_async(str, regexpOrSubstr, newSubstr, ignoreSecurityPassThroughSuffix) {
    return new Promise((resolve) => {
      this._workerPool.queueWork([str, regexpOrSubstr, newSubstr, ignoreSecurityPassThroughSuffix], (e) => {
        resolve(e.data);
      });
    });
  }
}
