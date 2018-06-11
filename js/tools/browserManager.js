/*global browser DefaultValues Listener ListenerProviders ThemeManager DateTime Transfer FeedParser*/
'use strict';
const subType = { /*exported subType */
  add: 'Add',
  go: 'Go'
};
const VERSION_ENUM = { /*exported VERSION_ENUM */
  MAJ : 0,
  MIN : 1,
  REV : 2
};

const _emptyTabSet = new Set(['about:blank', 'about:newtab', 'about:home']);

class BrowserManager { /* exported BrowserManager*/
  static get instance() {
    if (!this._instance) {
      this._instance = new BrowserManager();
    }
    return this._instance;
  }

  constructor() {
    this._alwaysOpenNewTab = DefaultValues.alwaysOpenNewTab;
    this._openNewTabForeground = DefaultValues.openNewTabForeground;
    this._reuseDropFeedsTab = DefaultValues.reuseDropFeedsTab;
    this._baseFeedUrl = null;
    this._version = null;

    Listener.instance.subscribe(ListenerProviders.localStorage, 'alwaysOpenNewTab', BrowserManager._setAlwaysOpenNewTab_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'openNewTabForeground', BrowserManager._setOpenNewTabForeground_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'reuseDropFeedsTab', BrowserManager._setReuseDropFeedsTab_sbscrb, true);
  }

  async init_async() {
    this._version = await BrowserManager._getBrowserVersion_async();
  }

  //non statics
  get alwaysOpenNewTab() {
    return this._alwaysOpenNewTab;
  }

  get baseFeedUrl() {
    // Returns the "blob:moz-extension://<Internal UUID>" feed base URL for this installation
    if (this._baseFeedUrl) {
      return this._baseFeedUrl;
    }

    let feedBlob = new Blob([]);
    let feedUrl = new URL(URL.createObjectURL(feedBlob));
    this._baseFeedUrl = feedUrl.protocol + feedUrl.origin;
    return this._baseFeedUrl ;
  }

  get version() {
    return this._version;
  }


  async openTab_async(url, openNewTabForce, openNewTabBackGroundForce) {
    let activeTab = await BrowserManager.getActiveTab_async();
    let dfTab = null;
    let openNewTab = this._alwaysOpenNewTab || openNewTabForce;
    let openNewTabForeground = openNewTabBackGroundForce ? false : this._openNewTabForeground;
    let feedUrlStartPattern = 'blob:' + browser.extension.getURL('');
    let isFeed = url.startsWith(feedUrlStartPattern);
    let reuseDropFeedsTab = isFeed && this._reuseDropFeedsTab;

    if (BrowserManager.isDropFeedsTab(activeTab)) {
      dfTab = activeTab;
    }
    else {
      dfTab = await BrowserManager.findDropFeedsTab_async();
    }

    // Open Tab Logic:
    //   1. "Always Open in New Tab" == True || openNewTabForce == True
    //     a. "Reuse Drop Feed Tabs" == False
    //        -> Open a new tab, unless the active tab is empty
    //     b. "Reuse Drop Feed Tabs" == True
    //        -> Open a new tab unless the active tab is empty or an existing DF tab
    //   2. "Always Open in New Tab" == False
    //     a. "Reuse Drop Feed Tabs" == False
    //        -> Update the current active tab
    //     b. "Reuse Drop Feed Tabs" == True && there is one or more DF tabs
    //        -> Update the first Drop Feeds tab and make it active.
    //     c. "Reuse Drop Feed Tabs" == True && no existing DF tab
    //        -> Create new tab and make it active
    let doCreate = this._alwaysOpenNewTab;
    let targetTabId = activeTab.id;
    let activeTabIsDfTab = dfTab && dfTab.id == activeTab.id;
    let isEmptyActiveTab = BrowserManager.isTabEmpty(activeTab);

    if(openNewTab) {
      // Option 1 - (Usually) open a new tab
      if(!reuseDropFeedsTab) {
        // Option 1a - New tab unless active tab is empty
        doCreate = !isEmptyActiveTab;
      }
      else {
        // Option 1b - New tab unless active tab is empty or DF tab
        doCreate = !isEmptyActiveTab || !activeTabIsDfTab;
      }
    }
    else {
      // Option 2 - (Usually) update an existing tab
      if(!reuseDropFeedsTab) {
        // Option 2a - Update the current active tab
        doCreate = false;
      }
      else {
        // Option 2b - Update the first or current DF or empty tab
        if(dfTab || isEmptyActiveTab) {
          doCreate = false;
          targetTabId = dfTab ? dfTab.id : activeTab.id;
        }
        else {
          // Option 2c - Create a new tab and activate it
          doCreate = true;
          openNewTabForeground = true;
        }
      }
    }

    if(doCreate) {
      await browser.tabs.create({url: url, active: openNewTabForeground});
    }
    else {
      await browser.tabs.update(targetTabId, {url: url, active: openNewTabForeground});
    }
  }

  async openInCurrentTab_async(url) {
    let activeTab = await BrowserManager.getActiveTab_async();
    await browser.tabs.update(activeTab.id, {url: url});
  }


  //statics
  static isTabEmpty(tab) {
    return _emptyTabSet.has(tab.url) && tab.status == 'complete';
  }

  static isDropFeedsTab(tab) {
    let baseUrl = BrowserManager.instance.baseFeedUrl;
    return tab.url.startsWith(baseUrl);
  }

  static async getActiveTab_async() {
    let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
    return tabInfos[0];
  }

  static displayNotification(message) {
    browser.notifications.create({
      'type': 'basic',
      'iconUrl': browser.extension.getURL(ThemeManager.instance.iconDF96Url),
      'title': 'Drop Feeds',
      'message': message
    });
  }

  static bookmarkHasChild(bookmarkItem) {
    let result = false;
    if (bookmarkItem.children) {
      result = (bookmarkItem.children.length > 0);
    }
    return result;
  }

  static setInnerHtmlByElement(element, innerHTML) {
    element.innerHTML = innerHTML;
  }

  static setInnerHtmlById(id, innerHTML) {
    BrowserManager.setInnerHtmlByElement(document.getElementById(id), innerHTML);
  }

  static loadScript(url, callback){
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function(){ callback(); };
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  static htmlToText(html) {
    let tmpDiv = document.createElement('div');
    BrowserManager.setInnerHtmlByElement(tmpDiv, html);
    let text = tmpDiv.textContent || tmpDiv.innerText || '';
    return text;
  }

  static async isVisitedLink_async(url) {
    if(!url)
      return false;
    var visits = await browser.history.getVisits({url: url});
    return (visits.length > 0);
  }

  static async openPopup_async(dialogsUrl, width, height, titlePreface) {
    let url = browser.extension.getURL(dialogsUrl);
    let createData = {url: url, type: 'popup', width: width, height: height, allowScriptsToClose: true, titlePreface: titlePreface};
    let win = await browser.windows.create(createData);
    BrowserManager._forcePopupToDisplayContent_async(win.id, width);
    return win;
  }


  static showPageAction(tabInfo, show, type) {
    if (show) {
      browser.pageAction.show(tabInfo.id);
      let iconUrl = ThemeManager.instance.getImgUrl('subscribe-' + type.toLowerCase() + '.png');
      let title = browser.i18n.getMessage('manPageAction' + type);
      browser.pageAction.setIcon({tabId: tabInfo.id, path: iconUrl});
      browser.pageAction.setTitle({tabId: tabInfo.id, title: title});
    }
    else {
      browser.pageAction.hide(tabInfo.id);
    }
  }

  static openPageAction() {
    browser.pageAction.openPopup();
  }

  static async getActiveTabFeedLinkList_async() {
    let feedLinkList = [];
    let tabInfo = await BrowserManager.getActiveTab_async();
    try {
      feedLinkList = await browser.tabs.sendMessage(tabInfo.id, {key:'getFeedLinkInfoList'});
    }
    catch(e) {}
    if (!feedLinkList) { feedLinkList= []; }
    return feedLinkList;
  }

  static async activeTabIsFeed_async() {
    let tabInfo = await BrowserManager.getActiveTab_async();
    let isFeed = await BrowserManager._activeTabIsFeedCore_async(tabInfo);
    if(typeof isFeed == 'undefined') {
      isFeed = await BrowserManager._isFeedWorkaround_async(tabInfo.url);
    }
    return isFeed;
  }

  static async renameAttribute(element, attOldName, attNewName)
  {
    if (element.hasAttribute(attOldName)) {
      let attValue = element.getAttribute(attOldName);
      element.removeAttribute(attOldName);
      element.setAttribute(attNewName, attValue);
    }
  }

  static async _activeTabIsFeedCore_async(tabInfo) {
    let isFeed = false;
    if (tabInfo.url.startsWith('about:')) { return false; }
    try {
      isFeed = await browser.tabs.sendMessage(tabInfo.id, {key:'isFeed'});
    }
    catch(e) {
      isFeed = await BrowserManager._isFeedWorkaround_async(tabInfo.url);
    }
    return isFeed;
  }

  static async _isFeedWorkaround_async(url) {
    //Workaround for Firefox 60
    let isFeed = false;
    if (url.startsWith('about:')) { return false; }
    /*
    let result = url.match(/rss|feed|atom|syndicate/i);
    if (result) {
      isFeed = result.length > 0;
    }
    */
    //if (!isFeed) {
    let feedText = null;
    try {
      feedText = await Transfer.downloadTextFileEx_async(url, false);
      let error = FeedParser.isValidFeedText(feedText);
      if (!error) {
        isFeed = true;
      }
    }
    catch(e) {
      isFeed = false;
    }
    //}
    return isFeed;
  }

  static async findDropFeedsTab_async() {
    let tabs = await browser.tabs.query({currentWindow: true});
    if (tabs) {
      for (var i = 0, len = tabs.length; i < len; i++) {
        if (BrowserManager.isDropFeedsTab(tabs[i])) {
          return tabs[i];
        }
      }
    }

    return null;
  }

  //private stuffs
  static _setAlwaysOpenNewTab_sbscrb(value){
    BrowserManager.instance._alwaysOpenNewTab = value;
  }

  static _setOpenNewTabForeground_sbscrb(value){
    BrowserManager.instance._openNewTabForeground = value;
  }

  static _setReuseDropFeedsTab_sbscrb(value) {
    BrowserManager.instance._reuseDropFeedsTab = value;
  }

  static async _forcePopupToDisplayContent_async(winId, winWidth) {
    //workaround to force to display content
    browser.windows.update(winId, {width: winWidth - 2});
    await DateTime.delay_async(100);
    browser.windows.update(winId, {width: winWidth});
  }

  static async _getBrowserVersion_async() {
    let browserInfo = await browser.runtime.getBrowserInfo();
    let version = browserInfo.version.split('.');
    return version;
  }

}
