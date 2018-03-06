/*global browser TopMenu StatusBar feedStatus BrowserManager CommonValues Feed*/
'use strict';
class FeedManager { /*exported FeedManager*/
  static get instance() {
    if (!this._instance) {
      this._instance = new FeedManager();
    }
    return this._instance;
  }

  constructor() {
    this._feedCheckingInProgress = false;
    this._updatedFeeds = 0;
    this._feedsToCheckList = null;
  }

  async checkFeeds_async(rootElement) {
    if (this._feedCheckingInProgress) { return; }
    this._feedCheckingInProgress = true;
    try {
      this._updatedFeeds = 0;
      TopMenu.instance.animateCheckFeedButton(true);
      StatusBar.instance.workInProgress = true;
      this._feedsToCheckList = [];
      let feedReadElementList = rootElement.querySelectorAll('.feedRead, .feedError');
      for (let i = 0; i < feedReadElementList.length; i++) {
        let feed = null;
        try {
          let feedId = feedReadElementList[i].getAttribute('id');
          feed = await Feed.new(feedId);
          StatusBar.instance.text = 'preparing: ' + feed.title;
          this._feedsToCheckList.push(feed);
        }
        catch(e) {
          /*eslint-disable no-console*/
          console.log(e);
          /*eslint-enable no-console*/
        }
      }
      await this._checkFeedsInner_async();
    }
    finally {
      StatusBar.instance.text = '';
      TopMenu.instance.animateCheckFeedButton(false);
      StatusBar.instance.workInProgress = false;
      this._displayNotification();
      this._updatedFeeds = 0;
      this._feedCheckingInProgress = false;
    }
  }

  async openOneFeedToTab_async(feedId) {
    let feed = await Feed.new(feedId);
    StatusBar.instance.text = 'Loading ' + feed.title;
    await feed.update_async();
    let feedHtmlUrl = await feed.getDocUrl_async();
    let activeTab = await BrowserManager.getActiveTab_async();
    let isEmptyActiveTab = await BrowserManager.isTabEmpty_async(activeTab);
    if(CommonValues.instance.alwaysOpenNewTab && !isEmptyActiveTab) {
      await browser.tabs.create({url:feedHtmlUrl, active: CommonValues.instance.openNewTabForeground});
    } else {
      await browser.tabs.update(activeTab.id, {url: feedHtmlUrl});
    }
    await feed.setStatus_async(feedStatus.OLD);
  }

  async openAllUpdatedFeeds_async(folderId) {
    try {
      TopMenu.instance.animateCheckFeedButton(true);
      StatusBar.instance.workInProgress = true;
      let feedUpdatedList = document.getElementById(folderId).querySelectorAll('.feedUnread');
      for (let i = 0; i < feedUpdatedList.length; i++) {
        try {
          let feedId = feedUpdatedList[i].getAttribute('id');
          await FeedManager.instance.openOneFeedToTab_async(feedId);
        }
        catch(e) {
          /* eslint-disable no-console */
          console.log(e);
          /* eslint-enable no-console */
        }
      }
    }
    finally {
      StatusBar.instance.text = '';
      TopMenu.instance.animateCheckFeedButton(false);
      StatusBar.instance.workInProgress = false;
    }
  }

  async markAllFeedsAsRead_async(folderId) {
    let feedElementList = document.getElementById(folderId).querySelectorAll('.feedUnread, .feedError');
    for (let i = 0; i < feedElementList.length; i++) {
      let feedId = feedElementList[i].getAttribute('id');
      feedElementList[i].classList.remove('feedError');
      feedElementList[i].classList.remove('feedUnread');
      feedElementList[i].classList.add('feedRead');
      let feed = await Feed.new(feedId);
      await feed.setStatus_async(feedStatus.OLD);
    }
  }

  async markAllFeedsAsUpdated_async(folderId) {
    let feedElementList = document.getElementById(folderId).querySelectorAll('.feedRead, .feedError');
    for (let i = 0; i < feedElementList.length; i++) {
      let feedId = feedElementList[i].getAttribute('id');
      feedElementList[i].classList.remove('feedError');
      feedElementList[i].classList.remove('feedUnread');
      feedElementList[i].classList.add('feedRead');
      let feed = await Feed.new(feedId);
      feed.setStatus_async(feedStatus.UPDATED);
    }
  }

  async _checkFeedsInner_async() {
    while (this._feedsToCheckList.length >0) {
      let feed = this._feedsToCheckList.shift();
      StatusBar.instance.text = 'checking: ' + feed.title;
      await feed.update_async();
      await feed.updateUiStatus();
      if (feed.status == feedStatus.UPDATED) {
        this._updatedFeeds++;
      }
    }
  }

  _displayNotification() {
    if (this._updatedFeeds > 1) {
      BrowserManager.displayNotification(this._updatedFeeds + ' feeds updated');
    }
    if (this._updatedFeeds == 1) {
      BrowserManager.displayNotification('1 Feed updated');
    }
    if (this._updatedFeeds == 0) {
      BrowserManager.displayNotification('No Feed has been updated');
    }
  }

}