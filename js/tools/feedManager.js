/*global browser DefaultValues TopMenu StatusBar feedStatus BrowserManager Feed LocalStorageManager LocalStorageListener*/
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
    this._feedNumberToCheck = 0;
    this._feedsToCheckList = [];
    this._feedsToWaitList = [];
    this._alwaysOpenNewTab = DefaultValues.alwaysOpenNewTab;
    this._openNewTabForeground = DefaultValues.openNewTabForeground;
  }

  async init_async() {
    this._alwaysOpenNewTab = await LocalStorageManager.getValue_async('alwaysOpenNewTab',  this._alwaysOpenNewTab);
    LocalStorageListener.instance.subscribe('alwaysOpenNewTab', FeedManager.setAlwaysOpenNewTab_sbscrb);
    this._openNewTabForeground = await LocalStorageManager.getValue_async('openNewTabForeground', this._openNewTabForeground);
    LocalStorageListener.instance.subscribe('openNewTabForeground', FeedManager.setOpenNewTabForeground_sbscrb);
  }

  static setAlwaysOpenNewTab_sbscrb(value){
    FeedManager.instance._alwaysOpenNewTab = value;
  }

  static setOpenNewTabForeground_sbscrb(value){
    FeedManager.instance._openNewTabForeground = value;
  }

  async checkFeeds_async(rootElement) {
    if (this._feedCheckingInProgress) { return; }
    this._feedCheckingInProgress = true;
    try {
      this._updatedFeeds = 0;
      TopMenu.instance.animateCheckFeedButton(true);
      StatusBar.instance.workInProgress = true;
      this._feedsToCheckList = [];
      this._feedsToWaitList = [];
      let feedReadElementList = rootElement.querySelectorAll('.feedRead, .feedError');
      this._feedNumberToCheck = feedReadElementList.length * 1;
      for (let i = 0; i < feedReadElementList.length; i++) {
        let feed = null;
        try {
          let feedId = feedReadElementList[i].getAttribute('id');
          feed = await Feed.new(feedId);
          StatusBar.instance.text = 'checking: ' + feed.title;
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
    }
  }

  async openOneFeedToTab_async(feedId) {
    let feed = await Feed.new(feedId);
    StatusBar.instance.text = 'Loading ' + feed.title;
    await feed.update_async();
    let feedHtmlUrl = await feed.getDocUrl_async();
    let activeTab = await BrowserManager.getActiveTab_async();
    let isEmptyActiveTab = await BrowserManager.isTabEmpty_async(activeTab);
    if(this._alwaysOpenNewTab && !isEmptyActiveTab) {
      await browser.tabs.create({url:feedHtmlUrl, active: this._openNewTabForeground});
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
      let feedElement = feedElementList[i];
      this.markFeedsAsRead_async(feedElement);
    }
  }

  async markFeedsAsRead_async(feedElement) {
    let feedId = feedElement.getAttribute('id');
    feedElement.classList.remove('feedError');
    feedElement.classList.remove('feedUnread');
    feedElement.classList.add('feedRead');
    let feed = await Feed.new(feedId);
    await feed.setStatus_async(feedStatus.OLD);
  }

  async markAllFeedsAsUpdated_async(folderId) {
    let feedElementList = document.getElementById(folderId).querySelectorAll('.feedRead, .feedError');
    for (let i = 0; i < feedElementList.length; i++) {
      let feedElement = feedElementList[i];
      this._markFeedAsUpdated_async(feedElement);
    }
  }

  async _markFeedAsUpdated_async(feedElement) {
    let feedId = feedElement.getAttribute('id');
    feedElement.classList.remove('feedError');
    feedElement.classList.remove('feedUnread');
    feedElement.classList.add('feedRead');
    let feed = await Feed.new(feedId);
    feed.setStatus_async(feedStatus.UPDATED);

  }


  async _checkFeedsInner_async() {
    this._feedNumberToCheck = this._feedsToCheckList.length;
    while (this._feedsToCheckList.length >0) {
      let feed = this._feedsToCheckList.shift();
      this._feedsUpdate_async(feed);
    }
  }

  async _feedsUpdate_async(feed) {
    try {
      await feed.update_async();
      await feed.updateUiStatus();
      StatusBar.instance.text = feed.title + ' : received';
      if (feed.status == feedStatus.UPDATED) {
        this._updatedFeeds++;
      }
    }
    finally {
      if (--this._feedNumberToCheck == 0) {
        StatusBar.instance.text = '';
        TopMenu.instance.animateCheckFeedButton(false);
        StatusBar.instance.workInProgress = false;
        this._displayNotification();
        this._updatedFeeds = 0;
        this._feedCheckingInProgress = false;
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