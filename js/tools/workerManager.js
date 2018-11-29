/* global browser Transfer*/
'use strict';
class WorkerManager { /*exported WorkerManager*/
  static async createWorker_async(workerUrl) {
    workerUrl = browser.runtime.getURL(workerUrl);
    let workerCode = await Transfer.downloadTextFile_async(workerUrl);
    let workerBlob = new Blob([workerCode]);
    let workerBlobUrl = window.URL.createObjectURL(workerBlob);
    let worker = new Worker(workerBlobUrl);  
    return worker;
  }

  static async run_async(worker, paramArray) {
    return new Promise((resolve, reject) => {
      try {
        worker.postMessage(paramArray);
        worker.onmessage = ((e) => {
          resolve(e.data);
        });
      }
      catch (e) {
        reject(e);
      }
    });
  }
}

class Wk {  /*exported Wk*/
  static async replace_async(str, regexpOrSubstr, newSubstr) {
    let worker = await WorkerManager.createWorker_async('js/workers/wkReplace.js');
    let result = await WorkerManager.run_async(worker, [str, regexpOrSubstr, newSubstr]);
    worker.terminate();
    worker = undefined;
    return result;
  }
}
