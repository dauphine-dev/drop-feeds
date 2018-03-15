/*global browser DefaultValues TopMenu StatusBar feedStatus BrowserManager Feed LocalStorageManager Listener ListenerProviders FeedParser*/
'use strict';
class FeedManager { /*exported FeedManager*/
  static get instance() {
    if (!this._instance) {
      this._instance = new FeedManager();
    }
    return this._instance;
  }

  constructor() {
    this._updatedFeeds = 0;
    this._asynchronousFeedChecking = DefaultValues.asynchronousFeedChecking;
    this._feedProcessingInProgress = false;
    this._feedsToProcessList = [];
    this._feedsToProcessCounter = 0;
    this._unifiedChannelTitle = '';
    this._alwaysOpenNewTab = DefaultValues.alwaysOpenNewTab;
    this._openNewTabForeground = DefaultValues.openNewTabForeground;
    this._unifiedFeedItems = [];
  }

  async init_async() {
    this._alwaysOpenNewTab = await LocalStorageManager.getValue_async('alwaysOpenNewTab',  this._alwaysOpenNewTab);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'alwaysOpenNewTab', FeedManager._setAlwaysOpenNewTab_sbscrb, true);
    this._openNewTabForeground = await LocalStorageManager.getValue_async('openNewTabForeground', this._openNewTabForeground);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'openNewTabForeground', FeedManager._setOpenNewTabForeground_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'asynchronousFeedChecking', FeedManager._setAsynchronousFeedChecking_sbscrb, true);
  }

  async checkFeeds_async(folderId) {
    if (this._feedProcessingInProgress) { return; }
    await this._preparingListOfFeedsToProcess_async(folderId, '.feedRead, .feedError', 'checking');
    await this._processFeedsFromList(this._feedsUpdate_async);
  }

  async openOneFeedToTabById_async(feedId) {
    let feed = await Feed.new(feedId);
    this._openOneFeedToTab_async(feed, false);
  }

  async openAllUpdatedFeeds_async(folderId) {
    if (this._feedProcessingInProgress) { return; }
    await this._preparingListOfFeedsToProcess_async(folderId, '.feedUnread', 'opening');
    await this._processFeedsFromList(this._openOneFeedToTab_async);
  }

  async openAsUnifiedFeed_async(folderId) {
    if (this._feedProcessingInProgress) { return; }
    await this._preparingListOfFeedsToProcess_async(folderId, '.feedUnread', 'opening');
    this._unifiedChannelTitle = (await browser.bookmarks.getSubTree(folderId.substring(3)))[0].title;
    await this._processFeedsFromList(this._unifyingThenOpenProcessedFeedsInner_async);
  }

  async _preparingListOfFeedsToProcess_async(folderId, querySelector, action) {
    this._feedProcessingInProgress = true;
    try {
      this._updatedFeeds = 0;
      TopMenu.instance.animateCheckFeedButton(true);
      StatusBar.instance.workInProgress = true;
      this._feedsToProcessList = [];
      let rootElement = document.getElementById(folderId);
      let feedElementList = rootElement.querySelectorAll(querySelector);
      for (let i = 0; i < feedElementList.length; i++) {
        let feed = null;
        try {
          let feedId = feedElementList[i].getAttribute('id');
          feed = await Feed.new(feedId);
          StatusBar.instance.text = (this._asynchronousFeedChecking ? action + ': ' : 'preparing: ') + feed.title;
          this._feedsToProcessList.push(feed);
        }
        catch(e) {
          /*eslint-disable no-console*/
          console.log(e);
          /*eslint-enable no-console*/
        }
      }
    }
    finally {
    }
  }

  async _processFeedsFromList(action) {
    this._feedsToProcessCounter = this._feedsToProcessList.length;
    let openNewTabForce = true;
    if (this._asynchronousFeedChecking) {
      while (this._feedsToProcessList.length > 0) {
        let feed = this._feedsToProcessList.shift();
        action(feed, openNewTabForce);
      }
    } else {
      while (this._feedsToProcessList.length > 0) {
        let feed = this._feedsToProcessList.shift();
        await action(feed, openNewTabForce);
      }
    }
  }

  _processFeedsFinished() {
    StatusBar.instance.text = '';
    TopMenu.instance.animateCheckFeedButton(false);
    StatusBar.instance.workInProgress = false;
    this._feedProcessingInProgress = false;
  }

  async _feedsUpdate_async(feed) {
    let self = FeedManager.instance;
    try {
      self._statusMessageBeforeCheck(feed);
      await feed.update_async();
      self._statusMessageAfterCheck(feed);
      await feed.updateUiStatus();
      feed.updateUiStatus();
      if (feed.status == feedStatus.UPDATED) {
        self._updatedFeeds++;
      }
    } catch(e) {
      await feed.setStatus_async(feedStatus.ERROR);
      feed.updateUiStatus();
    } finally {
      if (--self._feedsToProcessCounter == 0) {
        self._displayUpdatedFeedsNotification();
        self._processFeedsFinished();
      }
    }
  }

  async _openOneFeedToTab_async(feed, openNewTabForce) {
    let self = FeedManager.instance;
    try {
      StatusBar.instance.text = 'Loading ' + feed.title;
      await feed.update_async();
      let feedHtmlUrl = feed.docUrl;
      await self._openFeedTab_async(feedHtmlUrl, openNewTabForce);
      await feed.setStatus_async(feedStatus.OLD);
      feed.updateUiStatus();
    } catch(e) {
      await feed.setStatus_async(feedStatus.ERROR);
      feed.updateUiStatus();
    } finally {
      if (--self._feedsToProcessCounter == 0) {
        self._processFeedsFinished();
      }
    }
  }

  async _unifyingThenOpenProcessedFeedsInner_async(feed) {
    let self = FeedManager.instance;
    try {
      StatusBar.instance.text = 'Merging ' + feed.title;
      await feed.update_async();
      self._unifiedFeedItems.push(...feed.info.itemList);
      await feed.setStatus_async(feedStatus.OLD);
      feed.updateUiStatus();
      StatusBar.instance.text = 'Computing unified view';
    } catch(e) {
      await feed.setStatus_async(feedStatus.ERROR);
      feed.updateUiStatus();
    } finally {
      if (--self._feedsToProcessCounter == 0) {
        let unifiedDocUrl = self._getUnifiedDocUrl();
        let openNewTabForce = false;
        await self._openFeedTab_async(unifiedDocUrl, openNewTabForce);
        self._unifiedChannelTitle = '';
        self._processFeedsFinished();
      }
    }
  }

  _statusMessageBeforeCheck(feed) {
    if (!this._asynchronousFeedChecking) {
      StatusBar.instance.text = 'checking: ' + feed.title;
    }
  }

  _statusMessageAfterCheck(feed) {
    if (feed.status == feedStatus.ERROR) {
      StatusBar.instance.text = feed.title + ' : ' + feed.error;
    } else {
      if (this._asynchronousFeedChecking) {
        StatusBar.instance.text = feed.title + ' : received';
      }
    }
  }

  async _openFeedTab_async(feedHtmlUrl, openNewTabForce) {
    let activeTab = await BrowserManager.getActiveTab_async();
    let isEmptyActiveTab = await BrowserManager.isTabEmpty_async(activeTab);
    let openNewTab = this._alwaysOpenNewTab || openNewTabForce;
    if(openNewTab && !isEmptyActiveTab) {
      await browser.tabs.create({url: feedHtmlUrl, active: this._openNewTabForeground});
    } else {
      await browser.tabs.update(activeTab.id, {url: feedHtmlUrl});
    }
  }

  _getUnifiedDocUrl() {
    let unifiedFeedHtml = FeedParser.feedItemsListToUnifiedHtml(this._unifiedFeedItems, this._unifiedChannelTitle);
    let unifiedFeedBlob = new Blob([unifiedFeedHtml]);
    let unifiedFeedHtmlUrl = URL.createObjectURL(unifiedFeedBlob);
    return unifiedFeedHtmlUrl;

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

  static _setAlwaysOpenNewTab_sbscrb(value){
    FeedManager.instance._alwaysOpenNewTab = value;
  }

  static _setOpenNewTabForeground_sbscrb(value){
    FeedManager.instance._openNewTabForeground = value;
  }

  static _setAsynchronousFeedChecking_sbscrb(value){
    FeedManager.instance._asynchronousFeedChecking = value;
  }

  async _markFeedAsUpdated_async(feedElement) {
    let feedId = feedElement.getAttribute('id');
    feedElement.classList.remove('feedError');
    feedElement.classList.remove('feedUnread');
    feedElement.classList.add('feedRead');
    let feed = await Feed.new(feedId);
    feed.setStatus_async(feedStatus.UPDATED);

  }

  _displayUpdatedFeedsNotification() {
    if (this._updatedFeeds > 1) {
      BrowserManager.displayNotification(this._updatedFeeds + ' feeds updated');
    }
    if (this._updatedFeeds == 1) {
      BrowserManager.displayNotification('One feed updated');
    }
    if (this._updatedFeeds == 0) {
      BrowserManager.displayNotification('No Feed has been updated');
    }
    this._updatedFeeds = 0;
  }

}