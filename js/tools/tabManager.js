/*global browser FeedsTopMenu BrowserManager subType Dialogs*/
'use strict';
class TabManager { /*exported TabManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    window.addEventListener('focus', (e) => { this._windowOnFocused_event(e); });
    browser.tabs.onActivated.addListener((e) => { this._tabOnActivated_event(e); });
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => { this._tabOnUpdated_event(tabId, changeInfo, tabInfo); });
    this._forceTabOnChanged_async();
  }

  get activeTabFeedLinkList() {
    return this._activeTabFeedLinkList;
  }


  async _windowOnFocused_event() {
    let tabInfo = await BrowserManager.getActiveTab_async();
    await this._tabHasChanged_async(tabInfo);
  }

  async _tabOnActivated_event(activeInfo) {
    let tabInfo = await browser.tabs.get(activeInfo.tabId);
    await this._tabHasChanged_async(tabInfo);
  }

  async _tabOnUpdated_event(tabId, changeInfo, tabInfo) {
    if (changeInfo.status == 'complete') {
      await this._tabHasChanged_async(tabInfo);
    }
    else {
      FeedsTopMenu.instance.discoverFeedsButtonEnabled = false;
      await FeedsTopMenu.instance.setFeedButton_async(false, subType.add);
    }
  }

  async _tabHasChanged_async(tabInfo) {
    this._activeTabFeedLinkList = [];
    let enabled = (tabInfo.status == 'complete' && !tabInfo.url.startsWith('about:'));
    FeedsTopMenu.instance.discoverFeedsButtonEnabled = enabled;
    await FeedsTopMenu.instance.setFeedButton_async(false, subType.add);
    if (tabInfo.status == 'complete') {
      this._activeTabFeedLinkList = await BrowserManager.getActiveTabFeedLinkList_async();
      let activeTabIsFeed  = await BrowserManager.activeTabIsFeed_async();
      if (this._activeTabFeedLinkList.length > 0) {
        await this._subscriptionGoEnabled_async(tabInfo);
      }
      else if (activeTabIsFeed) {
        await this._subscriptionAddEnabled_async(tabInfo);
      }
      else {
        await this._subscriptionDisabled_async(tabInfo);
      }
    }
    else {
      await this._subscriptionDisabled_async(tabInfo);
    }
  }

  async _subscriptionGoEnabled_async(tabInfo) {
    await FeedsTopMenu.instance.setFeedButton_async(true, subType.add);
    BrowserManager.showPageAction(tabInfo, true, subType.add);
    browser.pageAction.setPopup({ tabId: tabInfo.id, popup: Dialogs.feedListUrl});
  }

  async _subscriptionAddEnabled_async(tabInfo) {
    await FeedsTopMenu.instance.setFeedButton_async(true, subType.add);
    BrowserManager.showPageAction(tabInfo, true, subType.add);
    await browser.pageAction.setPopup({ tabId: tabInfo.id, popup: Dialogs.subscribeButtonUrl});
  }

  async _subscriptionDisabled_async(tabInfo) {
    await FeedsTopMenu.instance.setFeedButton_async(false, subType.add);
    BrowserManager.showPageAction(tabInfo, false, subType.add);
  }

  async _forceTabOnChanged_async() {
    let tabInfo = await BrowserManager.getActiveTab_async();
    await this._tabHasChanged_async(tabInfo);
  }
}

