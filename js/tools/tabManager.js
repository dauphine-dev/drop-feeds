/*global browser TopMenu BrowserManager subType Dialogs*/
'use strict';
class TabManager { /*exported TabManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    browser.tabs.onActivated.addListener((e) => { this._tabOnActivated_event(e); });
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => { this._tabOnUpdated_event(tabId, changeInfo, tabInfo); });
    this._forceTabOnChanged_async();
  }

  get activeTabFeedLinkList() {
    return this._activeTabFeedLinkList;
  }

  async _tabOnActivated_event(activeInfo) {
    let tabInfo = await browser.tabs.get(activeInfo.tabId);
    this._tabHasChanged_async(tabInfo);
  }

  _tabOnUpdated_event(tabId, changeInfo, tabInfo) {
    if (changeInfo.status == 'complete') {
      this._tabHasChanged_async(tabInfo);
    }
    else {
      TopMenu.instance.discoverFeedsButtonEnabled = false;
      TopMenu.instance.setFeedButton(false, subType.go);
    }
  }

  async _tabHasChanged_async(tabInfo) {
    this._activeTabFeedLinkList = [];
    let enabled = (tabInfo.status == 'complete' && !tabInfo.url.startsWith('about:'));
    TopMenu.instance.discoverFeedsButtonEnabled = enabled;
    TopMenu.instance.setFeedButton(false, subType.go);
    if (tabInfo.status == 'complete') {
      this._activeTabFeedLinkList = await BrowserManager.getActiveTabFeedLinkList_async();
      let activeTabIsFeed  = await BrowserManager.activeTabIsFeed_async();
      if (this._activeTabFeedLinkList.length > 0) {
        this._subscriptionGoEnabled(tabInfo);
      }
      else if (activeTabIsFeed) {
        this._subscriptionAddEnabled_async(tabInfo);
      }
      else {
        this._subscriptionDisabled(tabInfo);
      }
    }
    else {
      this._subscriptionDisabled(tabInfo);
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

