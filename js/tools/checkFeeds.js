/*global browser, topMenu, statusBar, browserManager, feed, textTools, dateTime*/
/*global checkFeedsAsync, computeHashFeed, getFeedPubdate, FeedStatusEnum, getStoredFeedAsync, updateFeedStatusAsync*/
'use strict';
let _feedCheckingInProgress = false;
let _updatedFeeds = 0;
//----------------------------------------------------------------------
async function checkFeedsAsync(baseElement) {
  if (_feedCheckingInProgress) { return; }
  _feedCheckingInProgress = true;
  try {
    _updatedFeeds = 0;
    topMenu.instance.animateCheckFeedButton(true);
    let feedsToCheckList = [];
    let feedsWaitForAnswer = [];
    let feedReads = baseElement.querySelectorAll('.feedRead, .feedError');
    for (let i = 0; i < feedReads.length; i++) {
      let feedObj = null;
      try {
        let id = feedReads[i].getAttribute('id');
        let bookmark = (await browser.bookmarks.get(id))[0];
        feedObj = new feed(i, id, bookmark);
        statusBar.instance.text = 'preparing: ' + feedObj.title;
        feedsToCheckList.push(feedObj);
      }
      catch(e) {
        /*eslint-disable no-console*/
        console.log(e);
        /*eslint-enable no-console*/
      }
    }
    await checkFeedsFromListAsync(feedsToCheckList, feedsWaitForAnswer);
  }
  finally {
    statusBar.instance.text = '';
    topMenu.instance.animateCheckFeedButton(false);
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
    statusBar.instance.text = 'checking: ' + feedObj.bookmark.title;
    feedsWaitForAnswer = await checkOneFeedAsync(feedObj, feedObj.bookmark.title, feedsWaitForAnswer);
  }
}
//----------------------------------------------------------------------
async function checkOneFeedAsync(feedObj, name, feedsWaitForAnswer) {
  feedsWaitForAnswer.push(feedObj);
  await feedObj.download_async();
  feedsWaitForAnswer = removeFeedFromWaitingList(feedsWaitForAnswer, feedObj.id);
  //statusBar.instance.text = 'received: ' + feedObj.bookmark.title);
  let status = await computeFeedStatusAsync(feedObj, name);
  if (status == FeedStatusEnum.UPDATED) {
    _updatedFeeds++;
  }
  return feedsWaitForAnswer;
}
//----------------------------------------------------------------------
async function computeFeedStatusAsync(feedObj, name) {
  let hash = computeHashFeed(feedObj.feedText);
  feedObj.feedText = textTools.decodeHtml(feedObj.feedText);
  //feedObj.pubDate = getFeedPubdate(feedObj);
  let pubDate = getFeedPubdate(feedObj);
  feedObj.pubDate = pubDate;
  let status = FeedStatusEnum.OLD;
  let storedFeedObj = await getStoredFeedAsync(null, feedObj.id, name);

  if (feedObj.error) {
    status = FeedStatusEnum.ERROR;
  }
  else {
    if (dateTime.isValid(feedObj.pubDate)) {
      if ((feedObj.pubDate > storedFeedObj.pubDate) &&  (hash != storedFeedObj.hash)) {
        status = FeedStatusEnum.UPDATED;
      }
    } else if(hash != storedFeedObj.hash) {
      status = FeedStatusEnum.UPDATED;
    }
  }
  await updateFeedStatusAsync(feedObj.id, status, feedObj.pubDate, name, hash);
  return status;
}
//----------------------------------------------------------------------
function removeFeedFromWaitingList(feedsWaitForAnswer, feedId) {
  feedsWaitForAnswer = feedsWaitForAnswer.filter(function(feedObj) { return feedObj.id != feedId; });
  return feedsWaitForAnswer;
}
//----------------------------------------------------------------------
