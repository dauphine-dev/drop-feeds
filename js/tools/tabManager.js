/*global browser TopMenu BrowserManager subType Dialogs*/
'use strict';
class TabManager { /*exported TabManager*/
  static get instance() {
    if (!this._instance) {
      this._instance = new TabManager();
      this._activeTabFeedLinkList = [];
    }
    return this._instance;
  }

  constructor() {
    browser.tabs.onActivated.addListener(TabManager._tabOnActivated_event);
    browser.tabs.onUpdated.addListener(TabManager._tabOnUpdated_event);
    this._forceTabOnChanged_async();
  }

  get activeTabFeedLinkList() {
    return this._activeTabFeedLinkList;
  }

  static async _tabOnActivated_event(activeInfo) {
    let tabInfo = await browser.tabs.get(activeInfo.tabId);
    TabManager.instance._tabHasChanged_async(tabInfo);
  }

  static _tabOnUpdated_event(tabId, changeInfo, tabInfo) {
    let self = TabManager.instance;
    if (changeInfo.status == 'complete') {
      self._tabHasChanged_async(tabInfo);
    }
    else {
      TopMenu.instance.discoverFeedsButtonEnabled = false;
      TopMenu.instance.setFeedButton(false, subType.go);
    }
  }

  async _tabHasChanged_async(tabInfo) {
    this._activeTabFeedLinkList = [];
    let self = TabManager.instance;
    let enabled = (tabInfo.status == 'complete' && !tabInfo.url.startsWith('about:'));
    TopMenu.instance.discoverFeedsButtonEnabled = enabled;
    TopMenu.instance.setFeedButton(false, subType.go);
    if (tabInfo.status == 'complete') {
      this._activeTabFeedLinkList = await BrowserManager.getActiveTabFeedLinkList_async();
      let activeTabIsFeed  = await BrowserManager.activeTabIsFeed_async();
      if (this._activeTabFeedLinkList.length > 0) {
        self._subscriptionGoEnabled(tabInfo);
      }
      else if (activeTabIsFeed) {
        self._subscriptionAddEnabled_async(tabInfo);
      }
      else {
        self._subscriptionDisabled(tabInfo);
      }
    }
    else {
      self._subscriptionDisabled(tabInfo);
    }
  }

  _subscriptionGoEnabled(tabInfo) {
    TopMenu.instance.setFeedButton(true, subType.go);
    BrowserManager.showPageAction(tabInfo, true, subType.go);
    browser.pageAction.setPopup({ tabId: tabInfo.id, popup: Dialogs.feedListUrl});
  }

  async _subscriptionAddEnabled_async(tabInfo) {
    TopMenu.instance.setFeedButton(true, subType.add);
    BrowserManager.showPageAction(tabInfo, true, subType.add);
    await browser.pageAction.setPopup({ tabId: tabInfo.id, popup: Dialogs.subscribeButtonUrl});
    //browser.pageAction.openPopup();
  }

  _subscriptionDisabled(tabInfo) {
    TopMenu.instance.setFeedButton(false, subType.go);
    BrowserManager.showPageAction(tabInfo, false, subType.go);
  }

  async _forceTabOnChanged_async() {
    let tabInfo = await BrowserManager.getActiveTab_async();
    this._tabHasChanged_async(tabInfo);
  }
}

