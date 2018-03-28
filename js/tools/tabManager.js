/*global browser TopMenu ThemeManager*/
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
    }
  }

  async _tabHasChanged_async(tabInfo) {
    this._currentTabFeed_async(tabInfo);
    TopMenu.instance.discoverFeedsButtonEnabled = (tabInfo.status == 'complete');
  }

  async _currentTabFeed_async(tabInfo) {
    let isFeed = false;
    try {
      isFeed = await browser.tabs.sendMessage(tabInfo.id, {key:'isFeed'});
    } catch(e) { }
    TopMenu.instance.addFeedButtonEnable = isFeed;
    if(isFeed) {
      browser.pageAction.show(tabInfo.id);
      let iconUrl = ThemeManager.instance.getImgUrl('subscribe.png');
      browser.pageAction.setIcon({tabId: tabInfo.id, path: iconUrl});
    }
    else {
      browser.pageAction.hide(tabInfo.id);
    }
  }

  async _forceTabOnChanged_async() {
    let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
    this._tabHasChanged_async(tabInfos[0]);
  }

}

