/*global browser DefaultValues Listener ListenerProviders ThemeManager DateTime*/
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
    Listener.instance.subscribe(ListenerProviders.localStorage, 'alwaysOpenNewTab', BrowserManager._setAlwaysOpenNewTab_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'openNewTabForeground', BrowserManager._setOpenNewTabForeground_sbscrb, true);
  }

  //non statics
  get alwaysOpenNewTab() {
    return this._alwaysOpenNewTab;
  }

  async openTab_async(url, openNewTabForce) {
    let activeTab = await BrowserManager.getActiveTab_async();
    let isEmptyActiveTab = await BrowserManager.isTabEmpty_async(activeTab);
    let openNewTab = this._alwaysOpenNewTab || openNewTabForce;
    if(openNewTab && !isEmptyActiveTab) {
      await browser.tabs.create({url: url, active: this._openNewTabForeground});
    } else {
      await browser.tabs.update(activeTab.id, {url: url});
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
    var windowInfo = await browser.windows.getLastFocused();
    let tabInfos = await browser.tabs.query({active: true, windowId: windowInfo.id});
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

  //private stuffs
  static _setAlwaysOpenNewTab_sbscrb(value){
    BrowserManager.instance._alwaysOpenNewTab = value;
  }

  static _setOpenNewTabForeground_sbscrb(value){
    BrowserManager.instance._openNewTabForeground = value;
  }

  static async _forcePopupToDisplayContent_async(winId, winWidth) {
    //workaround to force to display content
    browser.windows.update(winId, {width: winWidth - 1});
    await DateTime.delay_async(100);
    browser.windows.update(winId, {width: winWidth});
  }

}
