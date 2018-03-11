/*global DefaultValues LocalStorageManager LocalStorageListener*/
'use strict';
class Timeout { /*exported Timeout*/
  static get instance() {
    if (!this._instance) {
      this._instance = new Timeout();
    }
    return this._instance;
  }

  constructor() {
    this._timeOut = DefaultValues.timeOut;
  }

  async init_async() {
    this._timeOut = await LocalStorageManager.getValue_async('timeOut', this._timeOut);
    LocalStorageListener.instance.subscribe('timeOut', Timeout.setTimeout_sbscrb, true);
  }

  get timeOutMs() {
    return 1000 * this._timeOut;
  }

  static setTimeout_sbscrb(value) {
    Timeout.instance._timeOut = value;
  }
}

class Transfer { /*exported Transfer*/
  static async downloadTextFile_async(url) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'text';
      xhr.onloadend = function() {
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
      xhr.onloadend = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          }
          else {
            let statusText = xhr.statusText ? xhr.statusText : 'unknown error';
            let statusCode = xhr.status ? ' (' + xhr.status + ')' : '';
            reject(statusText + statusCode);
          }
        }
      };
      if (urlNoCache) {
        let sep = url.includes('?') ? '&' : '?';
        url += sep + 'dpNoCache=' +  new Date().getTime();
      }
      xhr.open('GET', url);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.timeout = Timeout.instance.timeOutMs;
      xhr.ontimeout = function() {
        reject('timeout');
      };
      xhr.onerror = function() {
        let statusText = xhr.statusText ? xhr.statusText : 'unknown error';
        let statusCode = xhr.status ? ' (' + xhr.status + ')' : '';
        reject(statusText + statusCode);
      };
      xhr.send();
    });
  }
}
