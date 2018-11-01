/* global browser Transfer*/
'use strict';

class WorkerManager { /*exported WorkerManager*/
  static async run_asyc(workerUrl, paramArray) {
    workerUrl = browser.runtime.getURL(workerUrl);
    let workerCode = await Transfer.downloadTextFile_async(workerUrl);
    let workerBlob = new Blob([workerCode]);
    let workerBlobUrl = window.URL.createObjectURL(workerBlob);
    let worker = new Worker(workerBlobUrl);
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

/*
let result = await WorkerManager.run_asyc('js/workers/wkTest.js', [10, 3]);
console.log(result);
*/