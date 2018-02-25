/*global browser, topMenu, statusBar, browserManager*/
/*global checkFeedsAsync, downloadFeedAsync, decodeHtml, computeHashFeed
getFeedPubdate, FeedStatusEnum, getStoredFeedAsync, isValidDate, updateFeedStatusAsync, MarkAllFeedsAsReadAsync, browserManager.displayNotification*/
'use strict';
let _feedCheckingInProgress = false;
let _updatedFeeds = 0;
//----------------------------------------------------------------------
async function checkFeedsAsync(baseElement) {
  if (_feedCheckingInProgress) { return; }
  _feedCheckingInProgress = true;
  try {
    _updatedFeeds = 0;
    topMenu.animateCheckFeedButton(true);
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
        statusBar.printMessage('preparing: ' + feedObj.bookmark.title);
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
    statusBar.printMessage('');
    topMenu.animateCheckFeedButton(false);
    displayFeedsUpdatedNotification(_updatedFeeds);
    _updatedFeeds = 0;
    _feedCheckingInProgress = false;
  }
}
//----------------------------------------------------------------------
function displayFeedsUpdatedNotification(updatedFeeds) {
  if (updatedFeeds > 1) {
    browserManager.displayNotification(updatedFeeds + ' feeds updated');
  }
  if (updatedFeeds == 1) {
    browserManager.displayNotification(updatedFeeds + ' feed updated');
  }
  if (updatedFeeds == 0) {
    browserManager.displayNotification('No feed has been updated');
  }
}
//----------------------------------------------------------------------
async function checkFeedsFromListAsync(feedsToCheckList, feedsWaitForAnswer) {
  while (feedsToCheckList.length >0) {
    let feedObj = feedsToCheckList.shift();
    statusBar.printMessage('checking: ' + feedObj.bookmark.title);
    feedsWaitForAnswer = await checkOneFeedAsync(feedObj, feedObj.bookmark.title, feedsWaitForAnswer);
  }
}
//----------------------------------------------------------------------
async function checkOneFeedAsync(downloadFeedObj, name, feedsWaitForAnswer) {
  feedsWaitForAnswer.push(downloadFeedObj);
  downloadFeedObj = await downloadFeedAsync(downloadFeedObj);
  feedsWaitForAnswer = removeFeedFromWaitingList(feedsWaitForAnswer, downloadFeedObj.id);
  //statusBar.printMessage('received: ' + feedObj.bookmark.title);
  let status = await computeFeedStatusAsync(downloadFeedObj, name);
  if (status == FeedStatusEnum.UPDATED) {
    _updatedFeeds++;
  }
  return feedsWaitForAnswer;
}
//----------------------------------------------------------------------
async function computeFeedStatusAsync(downloadFeedObj, name) {
  let hash = computeHashFeed(downloadFeedObj.feedText);
  downloadFeedObj.feedText = decodeHtml(downloadFeedObj.feedText);
  downloadFeedObj.pubDate = getFeedPubdate(downloadFeedObj);
  let status = FeedStatusEnum.OLD;
  let storedFeedObj = await getStoredFeedAsync(null, downloadFeedObj.id, name);
  let feedUiItem = document.getElementById(downloadFeedObj.id);

  if (downloadFeedObj.error) {
    status = FeedStatusEnum.ERROR;
  }
  else {
    if (isValidDate(downloadFeedObj.pubDate)) {
      if ((downloadFeedObj.pubDate > storedFeedObj.pubDate) &&  (hash != storedFeedObj.hash)) {
        status = FeedStatusEnum.UPDATED;
      }
    } else if(hash != storedFeedObj.hash) {
      status = FeedStatusEnum.UPDATED;
    }
  }
  await updateFeedStatusAsync(downloadFeedObj.id, status, downloadFeedObj.pubDate, name, hash);
  return status;
}
//----------------------------------------------------------------------
function removeFeedFromWaitingList(feedsWaitForAnswer, feedId) {
  feedsWaitForAnswer = feedsWaitForAnswer.filter(function(feedObj) { return feedObj.id != feedId; });
  return feedsWaitForAnswer;
}
//----------------------------------------------------------------------
