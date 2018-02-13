/*global browser, updatingFeedsButtons, checkFeedsAsync, printToStatusBar, downloadFileByFeedObjAsync, decodeHtml*/
/*global getFeedPubdate, FeedStatusEnum, getStoredFeedAsync, isValidDate, updateFeedStatusAsync, MarkAllFeedsAsReadAsync*/
'use strict';
let _feedCheckingInProgress = false;
//---------------------------------------------------------------------- 
async function checkFeedsAsync(feedObj, baseElement) {
  if (_feedCheckingInProgress) { return; }
  try {
    _feedCheckingInProgress = true;
    updatingFeedsButtons(true);
    let feedsToCheckList = [];
    let feedsWaitForAnswer = [];
    let feedReads = baseElement.querySelectorAll('.feedRead, .feedError');
    for (let i = 0; i < feedReads.length; i++) {
      let feedObj = {index:i, id:null, title:null, bookmark:null, pubDate:null, feedText:null, error:null, newUrl: null};
      try {
        feedObj.id = feedReads[i].getAttribute('id');        
        let bookmarks = await browser.bookmarks.get(feedObj.id);
        feedObj.bookmark = bookmarks[0];
        feedObj.title = feedObj.bookmark.title;
        printToStatusBar('preparing: ' + feedObj.bookmark.title);
        feedsToCheckList.push(feedObj);
      }
      catch(e) {
        feedObj.error = e;
        console.log(e);
      }      
    }
    await checkFeedsFromListAsync(feedsToCheckList, feedsWaitForAnswer);
  }
  finally {
    //printToStatusBar('');
    updatingFeedsButtons(false);    
    _feedCheckingInProgress = false;
  }
}
//---------------------------------------------------------------------- 
async function checkFeedsFromListAsync(feedsToCheckList, feedsWaitForAnswer) {
  while (feedsToCheckList.length >0) {
    let feedObj = feedsToCheckList.shift();
    printToStatusBar('checking: ' + feedObj.bookmark.title);
    feedsWaitForAnswer = await checkOneFeedAsync(feedObj, feedObj.bookmark.title, feedsWaitForAnswer);
  }
}
//---------------------------------------------------------------------- 
async function checkOneFeedAsync(feedObj, name, feedsWaitForAnswer) {
  let feed = feedObj;
  try {
    feedsWaitForAnswer.push(feedObj);
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
  feedsWaitForAnswer = removeFeedFromWaitingList(feedsWaitForAnswer, feed.id);
  printToStatusBar('received: ' + feedObj.bookmark.title);
  await computeFeedStatusAsync(feed, name);
  return feedsWaitForAnswer;
}
//---------------------------------------------------------------------- 
async function computeFeedStatusAsync(feedObj, name) {
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
function removeFeedFromWaitingList(feedsWaitForAnswer, feedId) {
  feedsWaitForAnswer = feedsWaitForAnswer.filter(function(feedObj) { return feedObj.id != feedId; });
  return feedsWaitForAnswer;
}
//---------------------------------------------------------------------- 
