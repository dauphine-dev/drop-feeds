/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global bookmark, TAG_RSS_LIST, getInnerText1*/
"use strict";
//----------------------------------------------------------------------
function downloadFileAsync(url, urlNocache) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.responseType = "text";
    xhr.onreadystatechange = function(event) {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                resolve(xhr.responseText);
            } else {
                reject(xhr.status);
            }
        }
    };
    if (urlNocache) {
      let sep = url.includes('?') ? '&' : '?';
      url += sep + 'dpncache=' +  new Date().getTime();
    }
    xhr.open('GET', url);
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.send();
  });
}
//----------------------------------------------------------------------
function downloadFileByFeedObjCoreAsync(feedObj, urlNocache) {
  return new Promise((resolve, reject) => {
    let url = feedObj.bookmark.url;
    if (feedObj.newUrl) {
      url = feedObj.newUrl;
    }
    let result = downloadFileAsync(url, urlNocache);
    result.then( function(responseText) {
        let tagRss = null;
        for (let tag of TAG_RSS_LIST) {
          if (responseText.includes('<' + tag)) { tagRss = tag; break; }
        }      
        if (tagRss) {
          feedObj.feedText = responseText; resolve(feedObj); 
        } 
        else {          
          feedObj.error = 'it is not a rss file'; reject(feedObj.error); 
        }
      },
      function(error) {
        feedObj.error = error;
        reject(error); }
      );
  });
}
//---------------------------------------------------------------------- 
async function downloadFileByFeedObjAsync(feedObj) {
  let feedOj = await downloadFileByFeedObjCoreAsync(feedObj);
  if (feedOj.feedText.includes('</redirect>') && feedOj.feedText.includes('</newLocation>')) {
    let newUrl = getInnerText1(feedOj.feedText, '<newLocation>', '</newLocation>').trim();
    feedOj.newUrl = newUrl;
    feedOj = downloadFileByFeedObjCoreAsync(feedObj);
  }
  return feedOj;
}
//---------------------------------------------------------------------- 
