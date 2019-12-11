/*global browser DefaultValues FeedsTopMenu FeedsStatusBar feedStatus BrowserManager Feed Listener ListenerProviders ItemsLayout LocalStorageManager*/
'use strict';
class FeedManager { /*exported FeedManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updatedFeeds = 0;
    this._asynchronousFeedChecking = DefaultValues.asynchronousFeedChecking;
    this._showFeedUpdatePopup = DefaultValues.showFeedUpdatePopup;
    this._renderFeed = DefaultValues.renderFeeds;
    this._feedProcessingInProgress = false;
    this._feedsToProcessList = [];
    this._feedsToProcessCounter = 0;
    this._unifiedChannelTitle = '';
    this._unifiedFeedItems = [];
    this._itemList = [];
    this._autoUpdateInterval = undefined;
    this._automaticUpdatesOnStartDone = false;
    this._automaticUpdatesOnStart = DefaultValues.automaticFeedUpdatesOnStart;
    this._automaticUpdatesEnabled = DefaultValues.automaticFeedUpdates;
    this._automaticUpdatesMilliseconds = DefaultValues.automaticFeedUpdateMinutes * 60000;
    this._checkingFeeds = false;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'asynchronousFeedChecking', (v) => { this._setAsynchronousFeedChecking_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'showFeedUpdatePopup', (v) => { this._setShowFeedUpdatePopup_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'renderFeeds', (v) => { this._setRenderFeeds_sbscrb(v); }, true);

    Listener.instance.subscribe(ListenerProviders.localStorage, 'automaticFeedUpdateMinutes', (v) => { this._setAutomaticUpdatesMilliseconds_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'automaticFeedUpdatesOnStart', (v) => { this._setAutomaticUpdatesOnStar_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'automaticFeedUpdates', (v) => { this._setAutomaticUpdatesEnabled_sbscrb(v); }, true);
  }

  get checkingFeeds() {
    return this._checkingFeeds;
  }

  async delete(feedId) {
    await Feed.delete_async(feedId);
  }

  async checkFeeds_async(folderId, resetAutoUpdateInterval) {
    if (this._feedProcessingInProgress) { return; }
    this._checkingFeeds = true;
    FeedsTopMenu.instance.animateCheckFeedButton(false);
    if (resetAutoUpdateInterval) { this._resetAutoUpdateInterval(); }
    await this._preparingListOfFeedsToProcess_async(folderId, '.feedRead, .feedError', browser.i18n.getMessage('sbChecking'));
    await this._processFeedsFromList(folderId, FeedManager._feedsUpdate_async);
  }

  async openOneFeedToTabById_async(feedId, openNewTabForce, openNewTabBackGroundForce) {
    let feed = await Feed.new(feedId);
    this._itemList = [];
    let isSingle = true; let displayItems = true; let folderTitle = null;
    await FeedManager._openOneFeedToTab_async(feed, isSingle, openNewTabForce, displayItems, folderTitle, openNewTabBackGroundForce);
  }

  async openAllUpdatedFeeds_async(folderId) {
    if (this._feedProcessingInProgress) { return; }
    let showErrorsAsUnread = await LocalStorageManager.getValue_async('showErrorsAsUnread', DefaultValues.showErrorsAsUnreadCheckbox);
    let querySelectorString = (showErrorsAsUnread ? '.feedUnread, .feedError' : '.feedUnread');
    await this._preparingListOfFeedsToProcess_async(folderId, querySelectorString, browser.i18n.getMessage('sbOpening'));
    await this._processFeedsFromList(folderId, FeedManager._openOneFeedToTab_async);
  }

  async openAsUnifiedFeed_async(folderId) {
    if (this._feedProcessingInProgress) { return; }
    await this._preparingListOfFeedsToProcess_async(folderId, '.feedUnread', browser.i18n.getMessage('sbOpening'));
    this._unifiedChannelTitle = (await browser.bookmarks.getSubTree(folderId.substring(3)))[0].title;
    await this._processFeedsFromList(folderId, FeedManager._unifyingThenOpenProcessedFeedsInner_async);
  }


  async updateFeedTitle_async(feedId) {
    let feed = await Feed.new(feedId);
    await feed.updateTitle_async();
    feed.updateUiTitle();
  }

  async _preparingListOfFeedsToProcess_async(folderId, querySelector, action) {
    this._feedProcessingInProgress = true;
    try {
      this._updatedFeeds = 0;
      FeedsStatusBar.instance.workInProgress = true;
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
            let statusText = (this._asynchronousFeedChecking ? action : browser.i18n.getMessage('sbPreparing')) + ': ' + feed.title;
            FeedsStatusBar.instance.setText(statusText);
            this._feedsToProcessList.push(feed);
          }
          catch (e) {
            /*eslint-disable no-console*/
            console.error(e);
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
    FeedsStatusBar.instance.setText('');
    this._checkingFeeds = false;
    FeedsTopMenu.instance.animateCheckFeedButton(false);
    FeedsStatusBar.instance.workInProgress = false;
    this._feedProcessingInProgress = false;
  }

  static async _feedsUpdate_async(feed) {
    let self = FeedManager.instance;
    try {
      self._statusMessageBeforeCheck(feed);
      await feed.update_async();
      self._statusMessageAfterCheck(feed);
      await feed.updateUiStatus_async();
      if (feed.status == feedStatus.UPDATED) {
        self._updatedFeeds++;
      }
    } catch (e) {
      await feed.setStatus_async(feedStatus.ERROR);
      await feed.updateUiStatus_async();
      /*eslint-disable no-console*/
      /*eslint-enable no-console*/
    } finally {
      if (--self._feedsToProcessCounter == 0) {
        await self._displayUpdatedFeedsNotification_async();
        self._processFeedsFinished();
      }
    }
  }

  static async _openOneFeedToTab_async(feed, isSingle, openNewTabForce, displayItems, folderTitle, openNewTabBackGroundForce) {
    let self = FeedManager.instance;
    try {
      let loadingMessage = browser.i18n.getMessage('sbLoading') + ' ' + feed.title;
      FeedsStatusBar.instance.setText(loadingMessage);
      await feed.update_async();
      let feedHtmlUrl = await feed.getDocUrl_async();
      self._itemList.push(... (await feed.getInfo_async()).itemList);
      let isUnified = false;
      await self._displayItems_async(displayItems, isSingle, isUnified, feed, folderTitle);
      FeedsStatusBar.instance.setText(loadingMessage);
      await self._openTabFeed_async(feedHtmlUrl, openNewTabForce, openNewTabBackGroundForce);
      FeedsStatusBar.instance.setText(loadingMessage);
      await feed.setStatus_async(feedStatus.OLD);
      FeedsStatusBar.instance.setText(loadingMessage);
      await feed.updateUiStatus_async();
      FeedsStatusBar.instance.setTextWithTimeOut(feed.title + ' ' + browser.i18n.getMessage('sbLoaded') + ' ', browser.i18n.getMessage('sbLoadingNextFeed'), 2000);
    } catch (e) {
      await feed.setStatus_async(feedStatus.ERROR);
      await feed.updateUiStatus_async();
      /*eslint-disable no-console*/
      console.error(e, '\n', e.stack);
      /*eslint-enable no-console*/
    }
    finally {
      if (--self._feedsToProcessCounter <= 0) {
        self._processFeedsFinished();
      }
    }
  }

  static async _unifyingThenOpenProcessedFeedsInner_async(feed, isSingle, openNewTabForce, displayItems, folderTitle) {
    let self = FeedManager.instance;
    try {
      FeedsStatusBar.instance.setText(browser.i18n.getMessage('sbMerging') + ' ' + feed.title);
      await feed.update_async();
      self._unifiedFeedItems.push(...(await feed.getInfo_async()).itemList);
      await feed.setStatus_async(feedStatus.OLD);
      await feed.updateUiStatus_async();
      FeedsStatusBar.instance.setText(browser.i18n.getMessage('sbComputingUnifiedView'));
    } catch (e) {
      await feed.setStatus_async(feedStatus.ERROR);
      await feed.updateUiStatus_async();
      /*eslint-disable no-console*/
      console.error(e);
      /*eslint-enable no-console*/
    } finally {
      if (--self._feedsToProcessCounter == 0) {
        let unifiedDocUrl = await self._getUnifiedDocUrl_async();
        let openNewTabForce = false;
        let isUnified = true; let feedNull = null;
        await self._displayItems_async(true, isSingle, isUnified, feedNull, folderTitle);
        await self._openTabFeed_async(unifiedDocUrl, openNewTabForce);
        self._unifiedChannelTitle = '';
        self._processFeedsFinished();
      }
    }
  }

  async _displayItems_async(displayItems, isSingle, isUnified, feed, folderTitle) {
    if (displayItems) {
      let title = isUnified ? folderTitle : isSingle ? feed.title : folderTitle;
      let titleLink = isSingle ? (await feed.getInfo_async()).channel.link : 'about:blank';
      let itemList = isUnified ? this._unifiedFeedItems : this._itemList;
      await ItemsLayout.instance.displayItems_async(title, titleLink, itemList);
    }
  }

  async _openTabFeed_async(feedHtmlUrl, openNewTabForce, openNewTabBackGroundForce) {
    if (this._renderFeed) {
      await BrowserManager.instance.openTab_async(feedHtmlUrl, openNewTabForce, openNewTabBackGroundForce);
    }
  }

  _statusMessageBeforeCheck(feed) {
    if (!this._asynchronousFeedChecking) {
      FeedsStatusBar.instance.setText(browser.i18n.getMessage('sbChecking') + ': ' + feed.title);
    }
  }

  _statusMessageAfterCheck(feed) {
    if (feed.status == feedStatus.ERROR) {
      FeedsStatusBar.instance.setText(feed.title + ' : ' + feed.error);
    } else {
      if (this._asynchronousFeedChecking) {
        FeedsStatusBar.instance.setTextWithTimeOut(feed.title + ' : ' + browser.i18n.getMessage('sbReceived'), browser.i18n.getMessage('sbWaitingNextFeed'), 2000);
      }
    }
  }

  async _getUnifiedDocUrl_async() {
    /*
    let unifiedFeedHtml = await FeedRenderer.feedItemsListToUnifiedHtml_async(this._unifiedFeedItems, this._unifiedChannelTitle);
    let unifiedFeedBlob = new Blob([unifiedFeedHtml]);
    let unifiedFeedHtmlUrl = URL.createObjectURL(unifiedFeedBlob);
    */
    let unifiedFeedHtmlUrl = await Feed.getUnifiedDocUrl_async(this._unifiedFeedItems, this._unifiedChannelTitle);
    return unifiedFeedHtmlUrl;

  }

  async markAllFeedsAsRead_async(folderId) {
    let feedElementList = document.getElementById(folderId).querySelectorAll('.feedUnread, .feedError');
    for (let i = 0; i < feedElementList.length; i++) {
      let feedElement = feedElementList[i];
      this.markFeedAsRead_async(feedElement);
    }
  }

  async markFeedAsRead_async(feedElement) {
    let feedId = feedElement.getAttribute('id');
    let feed = await Feed.new(feedId);
    await feed.setStatus_async(feedStatus.OLD);
  }

  async markFeedAsReadById_async(feedId) {
    let feed = await Feed.new(feedId);
    await feed.setStatus_async(feedStatus.OLD);
  }

  async markAllFeedsAsUpdated_async(folderId) {
    let feedElementList = document.getElementById(folderId).querySelectorAll('.feedRead, .feedError');
    for (let i = 0; i < feedElementList.length; i++) {
      let feedElement = feedElementList[i];
      this.markFeedAsUpdated_async(feedElement);
    }
  }

  _setAsynchronousFeedChecking_sbscrb(value) {
    this._asynchronousFeedChecking = value;
  }

  _setShowFeedUpdatePopup_sbscrb(value) {
    this._showFeedUpdatePopup = value;
  }

  async markFeedAsUpdated_async(feedElement) {
    let feedId = feedElement.getAttribute('id');
    let feed = await Feed.new(feedId);
    await feed.setStatus_async(feedStatus.UPDATED);
  }

  async markFeedAsUpdatedById_async(feedId) {
    let feed = await Feed.new(feedId);
    await feed.setStatus_async(feedStatus.UPDATED);
  }

  async _displayUpdatedFeedsNotification_async() {
    if (this._showFeedUpdatePopup) {
      if (this._updatedFeeds > 1) {
        BrowserManager.displayNotification(this._updatedFeeds + ' ' + browser.i18n.getMessage('sbFeedsUpdated'));
      }
      else if (this._updatedFeeds == 1) {
        BrowserManager.displayNotification(browser.i18n.getMessage('sbOneFeedUpdated'));
      }
      else {
        let dontShowPopupIfZeroFeedUpdated = await LocalStorageManager.getValue_async('dontShowFeedUpdatePopupIfZeroFeed', DefaultValues.dontShowFeedUpdatePopupIfZeroFeed);
        if (this._updatedFeeds == 0 && !dontShowPopupIfZeroFeedUpdated) {
          BrowserManager.displayNotification(browser.i18n.getMessage('sbNoFeedHasBeenUpdated'));
        }
      }
    }
    this._updatedFeeds = 0;
  }

  _setRenderFeeds_sbscrb(value) {
    this._renderFeed = value;
  }

  async _automaticFeedUpdate_async() {
    if (!this._automaticUpdatesEnabled) { return; }
    try {
      await LocalStorageManager.setValue_async('lastAutoUpdate', Date.now());
      await FeedManager.instance.checkFeeds_async('feedsContentPanel');
    }
    catch (e) {
      /*eslint-disable no-console*/
      console.error(e);
      /*eslint-enable no-console*/
    }
  }

  async _setAutomaticUpdatesEnabled_sbscrb(value) {
    this._automaticUpdatesEnabled = value;
    await this._setAutoUpdateInterval_async();
  }

  async _setAutomaticUpdatesOnStar_sbscrb(value) {
    this._automaticUpdatesOnStart = value;
  }

  async _setAutomaticUpdatesMilliseconds_sbscrb(value) {
    let newValueMilliseconds = Math.max(value, 5) * 60000;
    if (this._automaticUpdatesMilliseconds != newValueMilliseconds) {
      this._automaticUpdatesMilliseconds = newValueMilliseconds;
      await this._setAutoUpdateInterval_async();
    }
  }

  async _resetAutoUpdateInterval() {
    clearInterval(this._autoUpdateInterval);
    this._autoUpdateInterval = setInterval(() => { this._automaticFeedUpdate_async(); }, this._automaticUpdatesMilliseconds);
  }

  async _setAutoUpdateInterval_async() {
    if (this._autoUpdateInterval) {
      clearInterval(this._autoUpdateInterval);
    }
    if (this._automaticUpdatesEnabled && this._automaticUpdatesMilliseconds) {
      let browserAlreadyOpen = ((await browser.windows.getAll({ populate: false, windowTypes: ['normal'] })).length >= 2);
      if (!browserAlreadyOpen && !this._automaticUpdatesOnStartDone) {
        this._automaticUpdatesOnStartDone = true;
        await this._doAutomaticUpdatesOnStart_async();
      }
      else {
        this._autoUpdateInterval = setInterval(() => { this._automaticFeedUpdate_async(); }, this._automaticUpdatesMilliseconds);
      }
      this._automaticUpdatesOnStartDone = true;
    }
  }

  async _doAutomaticUpdatesOnStart_async() {
    let lastAutoUpdate = await LocalStorageManager.getValue_async('lastAutoUpdate', new Date(0).getTime());
    let diff = Date.now() - lastAutoUpdate;
    if (diff >= this._automaticUpdatesMilliseconds || this._automaticUpdatesOnStart) {
      this._start1stAutoUpdate();
    }
    else {
      let delay = this._automaticUpdatesMilliseconds - diff;
      setTimeout(() => { this._start1stAutoUpdate(); }, delay);
    }
  }

  _start1stAutoUpdate() {
    this._automaticFeedUpdate_async();
    this._autoUpdateInterval = setInterval(() => { this._automaticFeedUpdate_async(); }, this._automaticUpdatesMilliseconds);
  }
}