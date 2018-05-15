/*global browser TopMenu BrowserManager*/
'use strict';
class TabManager { /*exported TabManager*/
  static get instance() {
    if (!this._instance) {
      this._instance = new TabManager();
    }
    return this._instance;
  }

  constructor() {
    browser.tabs.onActivated.addListener(TabManager._tabOnActivated_event);
    browser.tabs.onUpdated.addListener(TabManager._tabOnUpdated_event);
    this._forceTabOnChanged_async();
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
      TopMenu.instance.addFeedButtonEnable = false;
    }
  }

  async _tabHasChanged_async(tabInfo) {
    TopMenu.instance.discoverFeedsButtonEnabled = (tabInfo.status == 'complete');
    if (tabInfo.status == 'complete') {
      let activeTabHasFeeds = ((await BrowserManager.getActiveTabFeedLinkList_async()).length > 0);
      let activeTabIsFeed  = await BrowserManager.activeTabIsFeed_async();
      let subscriptionEnabled = activeTabHasFeeds || activeTabIsFeed;
      TopMenu.instance.addFeedButtonEnable = subscriptionEnabled;
      BrowserManager.showPageAction(tabInfo, subscriptionEnabled);
    }
  }

  async _forceTabOnChanged_async() {
    let tabInfo = await BrowserManager.getActiveTab_async();
    this._tabHasChanged_async(tabInfo);
  }
}

