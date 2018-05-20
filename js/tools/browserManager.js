/*global browser DefaultValues Listener ListenerProviders ThemeManager DateTime Transfer FeedParser*/
'use strict';
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
    this._reuseDropFeedTab = DefaultValues.reuseDropFeedTab;
    this._baseFeedUrl = null;
    
    Listener.instance.subscribe(ListenerProviders.localStorage, 'alwaysOpenNewTab', BrowserManager._setAlwaysOpenNewTab_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'openNewTabForeground', BrowserManager._setOpenNewTabForeground_sbscrb, true);
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
  
  async openTab_async(url, openNewTabForce, openNewTabBackGroundForce) {
    let activeTab = await BrowserManager.getActiveTab_async();
    let dfTab = await BrowserManager.findDropFeedsTab_async();
    let activeTabIsDfTab = dfTab && dfTab.id == activeTab.id;
    let openNewTab = this._alwaysOpenNewTab || openNewTabForce;
    let openNewTabForeground = openNewTabBackGroundForce ? false : this._openNewTabForeground;
    let reuseDropFeedTab = this._reuseDropFeedTab;
    
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
    
    if(openNewTab) {
        // Option 1 - (Usually) open a new tab
        let isEmptyActiveTab = await BrowserManager.isTabEmpty_async(activeTab);
        if(!reuseDropFeedTab) {
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
        if(!reuseDropFeedTab) {
            // Option 2a - Update the current active tab
            doCreate = false;
        }
        else {
            // Option 2b - Update the first DF tab
            if(dfTab) {
                doCreate = false;
                targetTabId = dfTab.id;
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
  static async isTabEmpty_async(tab) {
    let isEmpty = (tab.url == 'about:blank' || tab.url == 'about:newtab') && (tab.status == 'complete');
    return isEmpty;
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


  static showPageAction(tabInfo, show) {
    if (show) {
      browser.pageAction.show(tabInfo.id);
      let iconUrl = ThemeManager.instance.getImgUrl('subscribe.png');
      browser.pageAction.setIcon({tabId: tabInfo.id, path: iconUrl});
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
    let isFeed = false;
    let tabInfo = await BrowserManager.getActiveTab_async();
    try {
      isFeed = await browser.tabs.sendMessage(tabInfo.id, {key:'isFeed'});
    }
    catch(e) {
      //Workaround for Firefox 60
      let result = tabInfo.url.match(/rss|feed|atom|syndicate/i);
      if (result) {
        isFeed = result.length > 0;
      }
      if (!isFeed) {
        let feedText = await Transfer.downloadTextFileEx_async(tabInfo.url, false);
        let error = FeedParser.isValidFeedText(feedText);
        if (!error) {
          isFeed = true;
        }
      }
    }
    return isFeed;
  }

  static async findDropFeedsTab_async() {
    let tabs = await browser.tabs.query({currentWindow: true}) 
    if(tabs) {
        let baseUrl = BrowserManager.instance.baseFeedUrl;
        for (var i = 0, len = tabs.length; i < len; i++) {
            let url = tabs[i].url;
            if(url.startsWith(baseUrl)) {
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

  static async _forcePopupToDisplayContent_async(winId, winWidth) {
    //workaround to force to display content
    browser.windows.update(winId, {width: winWidth - 2});
    await DateTime.delay_async(100);
    browser.windows.update(winId, {width: winWidth});
  }

}
