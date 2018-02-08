/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global bookmark, TAG_RSS_LIST, getInnerText1*/
"use strict";
//----------------------------------------------------------------------
function downloadFileAsync(url) {
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
    xhr.open('GET', url);
    xhr.send();
  });
}
//----------------------------------------------------------------------
function downloadFileByFeedObjCoreAsync(feedObj) {
  return new Promise((resolve, reject) => {
    let url = feedObj.bookmark.url;
    if (feedObj.newUrl) {
      url = feedObj.newUrl;
    }
    let result = downloadFileAsync(url, '');
    result.then( function(responseText) {
        let tagRss = null;
        for (let tag of TAG_RSS_LIST) {
          if (responseText.includes('<' + tag)) { tagRss = tag; break; }
        }      
        if (tagRss) {
          feedObj.feedText = responseText; resolve(feedObj); 
        } 
        else {          
          feedObj.error = 'it is not a rss file'; reject(feedObj); 
        }
      },
      function(error) {
        feedObj.error = error;
        reject(feedObj); }
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
