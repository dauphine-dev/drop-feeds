/*global commonValues, TAG_RSS_LIST, getInnerText1*/
'use strict';
//----------------------------------------------------------------------
function downloadFileAsync(url, urlNoCache) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'text';
    xhr.onreadystatechange = function(event) {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
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
    xhr.timeout = commonValues.timeOutMs;

    xhr.ontimeout = function (e) {
      reject(e);
    };
    xhr.send();
  });
}
//----------------------------------------------------------------------
function downloadFileByFeedObjCoreAsync(downloadFeedObj, urlNoCache) {
  return new Promise((resolve, reject) => {
    let url = downloadFeedObj.bookmark.url;
    if (downloadFeedObj.newUrl) {
      url = downloadFeedObj.newUrl;
    }
    let result = downloadFileAsync(url, urlNoCache);
    result.then( function(responseText) {
      let tagRss = null;
      for (let tag of TAG_RSS_LIST) {
        if (responseText.includes('<' + tag)) { tagRss = tag; break; }
      }
      if (tagRss) {
        downloadFeedObj.feedText = responseText; resolve(downloadFeedObj);
      }
      else {
        downloadFeedObj.error = 'it is not a rss file'; reject(downloadFeedObj.error);
      }
    },
    function(error) {
      downloadFeedObj.error = error;
      reject(error); }
    );
  });
}
//----------------------------------------------------------------------
async function downloadFileByFeedObjAsync(downloadFeedObj) {
  let feedOj = await downloadFileByFeedObjCoreAsync(downloadFeedObj);
  if (feedOj.feedText.includes('</redirect>') && feedOj.feedText.includes('</newLocation>')) {
    let newUrl = getInnerText1(feedOj.feedText, '<newLocation>', '</newLocation>').trim();
    feedOj.newUrl = newUrl;
    try {
      feedOj = downloadFileByFeedObjCoreAsync(downloadFeedObj, true);
    }
    catch(e) {
      feedOj = downloadFileByFeedObjCoreAsync(downloadFeedObj, false);
    }
  }
  return feedOj;
}
//----------------------------------------------------------------------
