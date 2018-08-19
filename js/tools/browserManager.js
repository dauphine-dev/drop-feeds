/*global browser DefaultValues Listener ListenerProviders ThemeManager DateTime Transfer FeedParser TextTools*/

'use strict';
const subType = { /*exported subType */
  add: 'Add',
  go: 'Go'
};
const VERSION_ENUM = { /*exported VERSION_ENUM */
  MAJ: 0,
  MIN: 1,
  REV: 2
};

const _emptyTabSet = new Set(['about:blank', 'about:newtab', 'about:home']);

class BrowserManager { /* exported BrowserManager*/
  static get instance() { return (this._instance = this._instance || new this()); }
  static get baseFeedUrl() { return (this._baseFeedUrl = this._baseFeedUrl || BrowserManager._getBaseFeedUrl()); } 

  constructor() {
    this._alwaysOpenNewTab = DefaultValues.alwaysOpenNewTab;
    this._openNewTabForeground = DefaultValues.openNewTabForeground;
    this._reuseDropFeedsTab = DefaultValues.reuseDropFeedsTab;
    this._baseFeedUrl = null;
    this._version = null;
    this._uiLanguage = 'en';

    Listener.instance.subscribe(ListenerProviders.localStorage, 'alwaysOpenNewTab', (v) => { this._setAlwaysOpenNewTab_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'openNewTabForeground', (v) => { this._setOpenNewTabForeground_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'reuseDropFeedsTab', (v) => { this._setReuseDropFeedsTab_sbscrb(v); }, true);
  }

  async init_async() {
    //this._version = await BrowserManager._getBrowserVersion_async(); //it was broken the windows.onlad event
    this._uiLanguage = await BrowserManager._getUILanguage_async();
  }

  //non statics
  get alwaysOpenNewTab() {
    return this._alwaysOpenNewTab;
  }

  async getVersion_async() {
    if (!this._version) {
      this._version = await BrowserManager._getBrowserVersion_async();
    }
    return this._version;
  }


  get uiLanguage() {
    return this._uiLanguage;
  }

  async openTab_async(url, openNewTabForce, openNewTabBackGroundForce) {
    let activeTab = await BrowserManager.getActiveTab_async();
    let dfTab = null;
    let openNewTab = this._alwaysOpenNewTab || openNewTabForce;
    let openNewTabForeground = openNewTabBackGroundForce ? false : this._openNewTabForeground;
    let isFeed = BrowserManager.isDropFeedsUrl(url);
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

    if (openNewTab) {
      // Option 1 - (Usually) open a new tab
      if (!reuseDropFeedsTab) {
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
      if (!reuseDropFeedsTab) {
        // Option 2a - Update the current active tab
        doCreate = false;
      }
      else {
        // Option 2b - Update the first or current DF or empty tab
        if (dfTab || isEmptyActiveTab) {
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

    if (doCreate) {
      await browser.tabs.create({ url: url, active: openNewTabForeground });
    }
    else {
      await browser.tabs.update(targetTabId, { url: url, active: openNewTabForeground });
    }
  }

  async openInCurrentTab_async(url) {
    let activeTab = await BrowserManager.getActiveTab_async();
    await browser.tabs.update(activeTab.id, { url: url });
  }

  //statics
  static isTabEmpty(tab) {
    return _emptyTabSet.has(tab.url) && tab.status == 'complete';
  }

  static isDropFeedsTab(tab) {
    return BrowserManager.isDropFeedsUrl(tab.url);
  }

  static isDropFeedsUrl(url) {
    return url.startsWith(BrowserManager.baseFeedUrl);
  }

  static async getActiveTab_async() {
    let tabInfos = await browser.tabs.query({ active: true, currentWindow: true });
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

  static insertAdjacentHTML(element, position, text) {
    element.insertAdjacentHTML(position, text);
  }


  static loadScript(url, callback) {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function () { callback(); };
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  static htmlToText(html) {
    let tmpDiv = document.createElement('div');
    BrowserManager.setInnerHtmlByElement(tmpDiv, html);
    let text = tmpDiv.textContent || tmpDiv.innerText || '';
    text = TextTools.replaceAll(text, '"', '&quot;');
    return text;
  }

  static async isVisitedLink_async(url) {
    if (!url) {
      return false;
    }
    let visits = await browser.history.getVisits({ url: url });
    return (visits.length > 0);
  }

  static async openPopup_async(dialogsUrl, width, height, titlePreface) {
    let url = browser.extension.getURL(dialogsUrl);
    let createData = { url: url, type: 'popup', width: width, height: height, allowScriptsToClose: true, titlePreface: titlePreface };
    let win = await browser.windows.create(createData);
    BrowserManager._forcePopupToDisplayContent_async(win.id, width);
    return win;
  }


  static showPageAction(tabInfo, show, type) {
    if (show) {
      browser.pageAction.show(tabInfo.id);
      let iconUrl = ThemeManager.instance.getImgUrl('subscribe-' + type.toLowerCase() + '.png');
      let title = browser.i18n.getMessage('manPageAction' + type);
      browser.pageAction.setIcon({ tabId: tabInfo.id, path: iconUrl });
      browser.pageAction.setTitle({ tabId: tabInfo.id, title: title });
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
      feedLinkList = await browser.tabs.sendMessage(tabInfo.id, { key: 'getFeedLinkInfoList' });
    }
    catch (e) { }
    if (!feedLinkList) { feedLinkList = []; }
    return feedLinkList;
  }

  static async activeTabIsFeed_async() {
    let tabInfo = await BrowserManager.getActiveTab_async();
    let isFeed = await BrowserManager._activeTabIsFeedCore_async(tabInfo);
    if (typeof isFeed == 'undefined') {
      isFeed = await BrowserManager._isFeedWorkaround_async(tabInfo.url);
    }
    return isFeed;
  }

  static async renameAttribute(element, attOldName, attNewName) {
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
      isFeed = await browser.tabs.sendMessage(tabInfo.id, { key: 'isFeed' });
    }
    catch (e) {
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
    catch (e) {
      isFeed = false;
    }
    //}
    return isFeed;
  }

  static async findDropFeedsTab_async() {
    let tabs = await browser.tabs.query({ currentWindow: true });
    if (tabs) {
      for (let i = 0, len = tabs.length; i < len; i++) {
        if (BrowserManager.isDropFeedsTab(tabs[i])) {
          return tabs[i];
        }
      }
    }

    return null;
  }

  static async selectAllText(element) {
    let selection = window.getSelection();
    if (selection.toString() == '') {
      window.setTimeout(() => {
        let range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
      }, 1);
    }
  }

  static appendScript(path, typeToCheck) {
    if (typeToCheck == 'undefined') {
      let editorScript = document.createElement('script');
      editorScript.setAttribute('src', path);
      document.head.appendChild(editorScript);
    }
  }

  //private stuffs
  _setAlwaysOpenNewTab_sbscrb(value) {
    this._alwaysOpenNewTab = value;
  }

  _setOpenNewTabForeground_sbscrb(value) {
    this._openNewTabForeground = value;
  }

  _setReuseDropFeedsTab_sbscrb(value) {
    this._reuseDropFeedsTab = value;
  }

  static async _forcePopupToDisplayContent_async(winId, winWidth) {
    //workaround to force to display content
    browser.windows.update(winId, { width: winWidth - 2 });
    await DateTime.delay_async(100);
    browser.windows.update(winId, { width: winWidth });
  }

  static async _getBrowserVersion_async() {
    let browserInfo = await browser.runtime.getBrowserInfo();
    let version = browserInfo.version.split('.');
    return version;
  }

  static async _getUILanguage_async() {
    let uiLanguage = 'en';
    let langListUrl = browser.extension.getURL('/help/helpLang.list');
    let langListText = await Transfer.downloadTextFile_async(langListUrl);
    let hepLangList = langListText.trim().split('\n');
    let browserLanguage = browser.i18n.getUILanguage();
    if (hepLangList.includes(browserLanguage)) {
      uiLanguage = browserLanguage;
    }
    return uiLanguage;
  }

  static newFunction(text) {
    return new Function(text);
  }

  static _getBaseFeedUrl() {
    // Returns the "blob:moz-extension://<Internal UUID>" feed base URL for this installation
    let feedBlob = new Blob([]);
    let feedUrl = new URL(URL.createObjectURL(feedBlob));
    return feedUrl.protocol + feedUrl.origin;
  }
}
