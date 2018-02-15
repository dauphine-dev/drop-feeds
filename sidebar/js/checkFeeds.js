/*global browser, updatingFeedsButtons, checkFeedsAsync, printToStatusBar, downloadFeedAsync, decodeHtml, computeHashFeed*/
/*global getFeedPubdate, FeedStatusEnum, getStoredFeedAsync, isValidDate, updateFeedStatusAsync, MarkAllFeedsAsReadAsync*/
'use strict';
let _feedCheckingInProgress = false;
//----------------------------------------------------------------------
async function checkFeedsAsync(baseElement) {
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
    printToStatusBar('');
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
async function checkOneFeedAsync(downloadFeedObj, name, feedsWaitForAnswer) {
  feedsWaitForAnswer.push(downloadFeedObj);
  downloadFeedObj = await downloadFeedAsync(downloadFeedObj);
  feedsWaitForAnswer = removeFeedFromWaitingList(feedsWaitForAnswer, downloadFeedObj.id);
  //printToStatusBar('received: ' + feedObj.bookmark.title);
  await computeFeedStatusAsync(downloadFeedObj, name);
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
}
//----------------------------------------------------------------------
function removeFeedFromWaitingList(feedsWaitForAnswer, feedId) {
  feedsWaitForAnswer = feedsWaitForAnswer.filter(function(feedObj) { return feedObj.id != feedId; });
  return feedsWaitForAnswer;
}
//----------------------------------------------------------------------
