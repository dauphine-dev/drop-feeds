/*global browser DefaultValues TopMenu StatusBar feedStatus BrowserManager Feed Listener ListenerProviders FeedParser ItemsPanel*/
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
    this._showFeedUpdatePopup = DefaultValues.showFeedUpdatePopup;
    this._feedProcessingInProgress = false;
    this._feedsToProcessList = [];
    this._feedsToProcessCounter = 0;
    this._unifiedChannelTitle = '';
    this._unifiedFeedItems = [];
    this._itemList = [];
    Listener.instance.subscribe(ListenerProviders.localStorage, 'asynchronousFeedChecking', FeedManager._setAsynchronousFeedChecking_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'showFeedUpdatePopup', FeedManager._setShowFeedUpdatePopup, true);
  }

  async checkFeeds_async(folderId) {
    if (this._feedProcessingInProgress) { return; }
    TopMenu.instance.animateCheckFeedButton(true);
    await this._preparingListOfFeedsToProcess_async(folderId, '.feedRead, .feedError', 'checking');
    await this._processFeedsFromList(folderId, this._feedsUpdate_async);
  }

  async openOneFeedToTabById_async(feedId) {
    let feed = await Feed.new(feedId);
    this._itemList = [];
    this._openOneFeedToTab_async(feed, true, false, true);
  }

  async openAllUpdatedFeeds_async(folderId) {
    if (this._feedProcessingInProgress) { return; }
    await this._preparingListOfFeedsToProcess_async(folderId, '.feedUnread', 'opening');
    await this._processFeedsFromList(folderId, this._openOneFeedToTab_async);
  }

  async openAsUnifiedFeed_async(folderId) {
    if (this._feedProcessingInProgress) { return; }
    await this._preparingListOfFeedsToProcess_async(folderId, '.feedUnread', 'opening');
    this._unifiedChannelTitle = (await browser.bookmarks.getSubTree(folderId.substring(3)))[0].title;
    await this._processFeedsFromList(folderId, this._unifyingThenOpenProcessedFeedsInner_async);
  }

  async _preparingListOfFeedsToProcess_async(folderId, querySelector, action) {
    this._feedProcessingInProgress = true;
    try {
      this._updatedFeeds = 0;
      StatusBar.instance.workInProgress = true;
      this._feedsToProcessList = [];
      this._itemList = [];
      let rootElement = document.getElementById(folderId);
      let feedElementList = rootElement.querySelectorAll(querySelector);
      if (feedElementList.length > 0) {
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
      else {
        this._processFeedsFinished();
      }
    }
    finally {
    }
  }

  async _processFeedsFromList(folderId, action) {
    let folderTitle = '';
    this._feedsToProcessCounter = this._feedsToProcessList.length;
    let openNewTabForce = true;
    let elFolderLabel = document.getElementById('lbl-' + folderId.substring(3));
    if (elFolderLabel) { folderTitle = elFolderLabel.textContent; }
    if (this._asynchronousFeedChecking) {
      while (this._feedsToProcessList.length > 0) {
        let feed = this._feedsToProcessList.shift();
        let isLast = (this._feedsToProcessList.length == 0);
        action(feed, false, openNewTabForce, isLast, folderTitle);
      }
    } else {
      while (this._feedsToProcessList.length > 0) {
        let feed = this._feedsToProcessList.shift();
        let isLast = (this._feedsToProcessList.length == 0);
        await action(feed, false, openNewTabForce, isLast, folderTitle);
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
      /*eslint-disable no-console*/
      console.log(e);
      /*eslint-enable no-console*/
    } finally {
      if (--self._feedsToProcessCounter == 0) {
        self._displayUpdatedFeedsNotification();
        self._processFeedsFinished();
      }
    }
  }

  async _openOneFeedToTab_async(feed, isSingle, openNewTabForce, displayItems, folderTitle) {
    let self = FeedManager.instance;
    try {
      StatusBar.instance.text = 'Loading ' + feed.title;
      await feed.update_async();
      let feedHtmlUrl = feed.docUrl;
      self._itemList.push(... feed.info.itemList);
      if (displayItems) {
        let title = isSingle ? feed.title : folderTitle;
        let titleLink = isSingle ? feed.info.channel.link : 'about:blank';
        await ItemsPanel.instance.displayItems_async(title, titleLink, self._itemList);
      }
      StatusBar.instance.text = 'Loading ' + feed.title;
      await BrowserManager.instance.openTab_async(feedHtmlUrl, openNewTabForce);
      StatusBar.instance.text = 'Loading ' + feed.title;
      await feed.setStatus_async(feedStatus.OLD);
      StatusBar.instance.text = 'Loading ' + feed.title;
      feed.updateUiStatus();
      StatusBar.instance.text = feed.title + ' ' + 'loaded';

    } catch(e) {
      await feed.setStatus_async(feedStatus.ERROR);
      feed.updateUiStatus();
      /*eslint-disable no-console*/
      console.log(e);
      /*eslint-enable no-console*/

    } finally {
      if (--self._feedsToProcessCounter <= 0) {
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
      /*eslint-disable no-console*/
      console.log(e);
      /*eslint-enable no-console*/
    } finally {
      if (--self._feedsToProcessCounter == 0) {
        let unifiedDocUrl = self._getUnifiedDocUrl();
        let openNewTabForce = false;
        await BrowserManager.instance.openTab_async(unifiedDocUrl, openNewTabForce);
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

  static _setAsynchronousFeedChecking_sbscrb(value){
    FeedManager.instance._asynchronousFeedChecking = value;
  }

  static _setShowFeedUpdatePopup(value) {
    FeedManager.instance._showFeedUpdatePopup = value;
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
    if (this._showFeedUpdatePopup) {
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