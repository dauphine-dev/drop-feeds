/*global commonValues*/
'use strict';
//----------------------------------------------------------------------
class transfer { /*exported transfer*/
  static async downloadTextFile_async(url) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'text';
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject(xhr.status);
          }
        }
      };
      xhr.open('GET', url);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.send();
    });
  }

  static async downloadTextFileEx_async(url, urlNoCache) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'text';
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject(xhr.status);
          }
        }
      };
      if (urlNoCache) {
        let sep = url.includes('?') ? '&' : '?';
        url += sep + 'dpNoCache=' +  new Date().getTime();
      }
      xhr.open('GET', url);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.timeout = transfer.timeoutMs;
      xhr.ontimeout = function (e) {
        reject(e);
      };
      xhr.send();
    });
  }

  static get timeoutMs() {
    return 1000 * commonValues.instance.timeOut;
  }
}
//----------------------------------------------------------------------
