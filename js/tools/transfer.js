/*global browser DefaultValues Listener ListenerProviders FeedParser*/
'use strict';
class Timeout { /*exported Timeout*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._timeOut = DefaultValues.timeOut;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'timeOut', (v) => { this.setTimeout_sbscrb(v); }, true);
  }

  get timeOutMs() {
    return 1000 * this._timeOut;
  }

  setTimeout_sbscrb(value) {
    this._timeOut = value;
  }
}

class Transfer { /*exported Transfer*/

  static async downloadTextFile_async(url) {
    return new Promise((resolve, reject) => {
      Transfer.downloadFile_async(url, 'text').then((xhr) => {
        resolve(xhr.responseText);
      }, (status) => {
        reject(status);
      });
    });
  }

  static async downloadXmlFile_async(url) {
    return new Promise((resolve, reject) => {
      Transfer.downloadFile_async(url, 'document').then((xhr) => {
        resolve(xhr.responseXML);
      }, (status) => {
        reject(status);
      });
    });
  }

  static async downloadXlsFile_async(url) {
    return new Promise((resolve, reject) => {
      Transfer.downloadFile_async(url, 'document', 'application/xslt+xml').then((xhr) => {
        resolve(xhr.responseXML);
      }, (status) => {
        reject(status);
      });
    });
  }

  static async downloadFile_async(url, responseType, overrideMimeType) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.responseType = responseType;
      xhr.onloadend = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            resolve(xhr);
          } else {
            reject(xhr.status);
          }
        }
      };
      xhr.timeout = Timeout.instance.timeOutMs;
      xhr.ontimeout = () => {
        reject('timeout');
      };
      xhr.open('GET', url);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      if (overrideMimeType) {
        xhr.overrideMimeType(overrideMimeType);
      }
      xhr.send();
    });
  }

  static async downloadTextFileEx0_async(url, urlNoCache) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.onloadend = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            // Decode the response as UTF-8 then apply the feed's specified encoding (if present)
            let defaultEncoding = 'utf-8';
            let response = new DataView(xhr.response);
            let utf8Decoder = new TextDecoder(defaultEncoding);
            let utf8Content = utf8Decoder.decode(response);
            try {
              let encoding = FeedParser.getFeedEncoding(utf8Content);
              if (encoding && encoding != defaultEncoding) {
                let decoder = new TextDecoder(encoding.toLowerCase());
                let decodedContent = decoder.decode(response);
                resolve(decodedContent);
              }
            }
            catch (e) {
              /*eslint-disable no-console*/
              console.error('downloadTextFileEx_async encoding failed "' + e);
              /*eslint-enable no-console*/
            }
            // Fallback to the default encoding
            resolve(utf8Content);
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
        url += sep + 'dpNoCache=' + new Date().getTime();
      }
      xhr.open('GET', url);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.timeout = Timeout.instance.timeOutMs;
      xhr.ontimeout = () => {
        reject('timeout');
      };
      xhr.onerror = () => {
        let statusText = xhr.statusText ? xhr.statusText : 'unknown error';
        let statusCode = xhr.status ? ' (' + xhr.status + ')' : '';
        reject(statusText + statusCode);
      };
      xhr.send();
    });
  }

  static async downloadTextFileEx_async(url, urlNoCache, useNativeWebRequest) {
    if (urlNoCache) {
      let sep = url.includes('?') ? '&' : '?';
      url += sep + 'dpNoCache=' + new Date().getTime();
    }
    if (useNativeWebRequest) {
      return await browser.runtime.sendNativeMessage('dropfeeds', url);
    }
    const controller = new AbortController();
    setTimeout(() => controller.abort(), Timeout.instance.timeOutMs);
    const fetchInit = { method: 'GET', mode: 'cors', cache: 'no-cache', signal: controller.signal };
    let response = await fetch(url, fetchInit);
    if (response.ok) {
      const responseArrayBuffer = await response.arrayBuffer();
      // Decode the response as UTF-8 then apply the feed's specified encoding (if present)
      let defaultEncoding = 'utf-8';
      let utf8Decoder = new TextDecoder(defaultEncoding);
      let utf8Content = utf8Decoder.decode(responseArrayBuffer);
      try {
        let encoding = FeedParser.getFeedEncoding(utf8Content);
        if (encoding && encoding != defaultEncoding) {
          let decoder = new TextDecoder(encoding.toLowerCase());
          let decodedContent = decoder.decode(responseArrayBuffer);
          return decodedContent;
        }
      }
      catch (e) {
        /*eslint-disable no-console*/
        console.error('downloadTextFileEx_async encoding failed "' + e);
        /*eslint-enable no-console*/
      }
      // Fallback to the default encoding
      return utf8Content;
    }
    else {
      let statusText = response.statusText ? response.statusText : 'unknown error';
      let statusCode = response.status ? ' (' + response.status + ')' : '';
      // eslint-disable-next-line no-console
      console.error(statusText + statusCode);
    }
  }

}
