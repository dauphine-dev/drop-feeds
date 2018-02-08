/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/
/*global browser, logError, updatingFeedsButtons, checkFeedsAsync, printToStatusBar, downloadFileByFeedObjAsync, decodeHtml*/
/*global getFeedPubdate, FeedStatusEnum, getStoredFeedAsync, isValidDate, updateFeedStatusAsync, MarkAllFeedsAsReadAsync*/

"use strict";
//---------------------------------------------------------------------- 
async function checkFeedsAsync(feedObj, baseElement) {
  try {
                            
    updatingFeedsButtons(true);
    //let feedReads = document.querySelectorAll('.feedRead');
    let feedReads = baseElement.querySelectorAll('.feedRead');
    for (let i = 0; i < feedReads.length; i++) {
      let feedObj = {index:i, id:null, title:null, bookmark:null, pubDate:null, feedText:null, error:null, newUrl: null};
      try {
        feedObj.id = feedReads[i].getAttribute('id');        
        let bookmarks = await browser.bookmarks.get(feedObj.id);
        feedObj.bookmark = bookmarks[0];
        feedObj.title = feedObj.bookmark.title;
        await checkOneFeedAsync(feedObj);
      }
      catch(e) {
        feedObj.error = e;
        logError(feedObj);
      }      
    }
  }
  finally {
    printToStatusBar('');
    updatingFeedsButtons(false);    
  }
}
//---------------------------------------------------------------------- 
async function checkOneFeedAsync(feedObj) {
  printToStatusBar('checking: ' + feedObj.bookmark.title);
  let oneByOne = true;
  if (oneByOne)
  {
    checkFeedOnbyOneAsync(feedObj);
  }
  else
  {
    checkFeedAsync(feedObj);
  }
}
//---------------------------------------------------------------------- 
async function checkFeedOnbyOneAsync(feedObj) {
  let feed = feedObj;
  try {    
    feed = await downloadFileByFeedObjAsync(feedObj);
  }
  catch (e) {
    feed.error = e;
    feed.pubDate = null;
    logError(feed);
  }    
  await computeFeedStatus(feed);
}
//---------------------------------------------------------------------- 
async function checkFeedAsync(feedObj) {
  await downloadFileByFeedObjAsync(feedObj).then(computeFeedStatus, logError);
}
//---------------------------------------------------------------------- 
async function computeFeedStatus(feedObj) {
  feedObj.feedText = decodeHtml(feedObj.feedText);
  feedObj.pubDate = getFeedPubdate(feedObj);
  let status = FeedStatusEnum.OLD;
  let storedFeedObj = await getStoredFeedAsync(null, feedObj.id);
  let feedUiItem = document.getElementById(feedObj.id);
  if (isValidDate(feedObj.pubDate)) {
    if (feedObj.pubDate > storedFeedObj.pubDate) {
      status = FeedStatusEnum.UPDATED;  
    }
  }
  else {
    status = FeedStatusEnum.ERROR;
  }  
  await updateFeedStatusAsync(null, feedObj.id, status, feedObj.pubDate);
}
//---------------------------------------------------------------------- 
