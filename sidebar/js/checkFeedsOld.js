/*global browser, updatingFeedsButtons, checkFeedsAsync, printToStatusBar, downloadFileByFeedObjAsync, decodeHtml*/
/*global getFeedPubdate, FeedStatusEnum, getStoredFeedAsync, isValidDate, updateFeedStatusAsync, MarkAllFeedsAsReadAsync*/

'use strict';
//---------------------------------------------------------------------- 
async function checkFeedsAsync(feedObj, baseElement) {
  try {
                            
    updatingFeedsButtons(true);
    let feedReads = baseElement.querySelectorAll('.feedRead, .feedError');    
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
        console.log(e);
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
    checkFeedOnbyOneAsync(feedObj, feedObj.bookmark.title);
  }
  else
  {
    checkFeedAsync(feedObj, feedObj.bookmark.title);
  }
}
//---------------------------------------------------------------------- 
async function checkFeedOnbyOneAsync(feedObj, name) {
  let feed = feedObj;
  try {
    feed = await downloadFileByFeedObjAsync(feedObj, true);
  }
  catch (e) {
    try {
      feed = await downloadFileByFeedObjAsync(feedObj, false);
    }
    catch (e) {
      feed.error = e;
      feed.pubDate = null;
      console.log(e);
      console.log('error:', feed);
    }
  }    
  await computeFeedStatus(feed, name);
}
//---------------------------------------------------------------------- 
async function checkFeedAsync(feedObj, name) {
  try {
    let feed = await downloadFileByFeedObjAsync(feedObj);
    computeFeedStatus(feed, name);
  }
  catch(e) {
    console.log(e);
  }
}
//---------------------------------------------------------------------- 
async function computeFeedStatus(feedObj, name) {
  feedObj.feedText = decodeHtml(feedObj.feedText);
  feedObj.pubDate = getFeedPubdate(feedObj);
  let status = FeedStatusEnum.OLD;
  let storedFeedObj = await getStoredFeedAsync(null, feedObj.id, name);
  let feedUiItem = document.getElementById(feedObj.id);
  if (isValidDate(feedObj.pubDate)) {
    if (feedObj.pubDate > storedFeedObj.pubDate) {
      status = FeedStatusEnum.UPDATED;  
    }
  }
  else {
    status = FeedStatusEnum.ERROR;
  }  
  await updateFeedStatusAsync(null, feedObj.id, status, feedObj.pubDate, name);
}
//---------------------------------------------------------------------- 
