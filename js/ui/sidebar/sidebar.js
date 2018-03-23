/*global browser ThemeManager TopMenu LocalStorageManager CssManager Timeout
DateTime ContextMenu TreeView Listener ListenerProviders BookmarkManager FeedManager ItemsPanel*/
'use strict';
class SideBar { /*exported SideBar*/
  static get instance() {
    if (!this._instance) {
      this._instance = new SideBar();
    }
    return this._instance;
  }

  constructor() {
    /*eslint-disable no-console*/
    console.log('Drop feeds loading...');
    /*eslint-enable no-console*/
    this._subscribeHtmlUrl = '/html/subscribe.html';
    this._contentTop = null;
  }

  async init_async() {
    await TreeView.instance.load_async();
    await Timeout.instance.init_async();
    await ThemeManager.instance.init_async();
    await TopMenu.instance.init_async();
    FeedManager.instance;
    ItemsPanel.instance;
    ItemsPanel.instance.splitterBar.top = window.innerHeight / 2;
    BookmarkManager.instance.init_async();
    document.getElementById('main').addEventListener('click', ContextMenu.instance.hide);
    this._addListeners();
    TreeView.instance.selectionBar.refresh();
    this._computeContentTop();
    await this._forceTabOnChanged_async();
    Listener.instance.subscribe(ListenerProviders.localStorage, 'reloadPanelWindow', SideBar.reloadPanelWindow_sbscrb, false);
    Listener.instance.subscribe(ListenerProviders.message, 'openSubscribeDialog', SideBar.openSubscribeDialog_async, false);
    this.setContentHeight();
  }

  reloadOnce() {
    //Workaround to have a clean display on 1st start.
    let doReload = ! sessionStorage.getItem('hasAlreadyReloaded');
    if (doReload) {
      sessionStorage.setItem('hasAlreadyReloaded', true);
      window.location.reload();
    }
  }

  static async reloadPanelWindow_sbscrb() {
    window.location.reload();
  }

  static async openSubscribeDialog_async() {
    let self = SideBar.instance;
    let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
    let url = browser.extension.getURL(self._subscribeHtmlUrl);
    let createData = {url: url, type: 'popup', width: 778, height: 500, allowScriptsToClose: true, titlePreface: 'Subscribe with Drop Feed'};
    LocalStorageManager.setValue_async('subscribeInfo', {feedTitle: tabInfos[0].title, feedUrl: tabInfos[0].url});
    let win = await browser.windows.create(createData);
    //workaround to force to display content
    await DateTime.delay_async(100);
    browser.windows.update(win.id, {width: 779});
    await DateTime.delay_async(100);
    browser.windows.update(win.id, {width: 780});
  }

  _addListeners() {
    window.onresize = SideBar._windowOnResize_event;
    browser.tabs.onActivated.addListener(SideBar._tabOnActivated_event);
    browser.tabs.onUpdated.addListener(SideBar._tabOnUpdated_event);
    document.getElementById('content').addEventListener('scroll', SideBar._contentOnScroll_event);
  }

  static async _contentOnScroll_event(){
    TreeView.instance.selectionBar.refresh();
  }

  async _forceTabOnChanged_async() {
    let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
    this._tabHasChanged_async(tabInfos[0]);
  }

  static async _windowOnResize_event() {
    SideBar.instance.setContentHeight();
  }

  _computeContentTop() {
    let elStatusBar = document.getElementById('statusBar');
    let rect = elStatusBar.getBoundingClientRect();
    this._contentTop = rect.bottom + 1;
  }

  setContentHeight() {
    let height = Math.max(ItemsPanel.instance.splitterBar.top - this._contentTop - 1, 0);
    CssManager.replaceStyle('.contentHeight', '  height:' + height + 'px;');
  }

  static async _tabOnActivated_event(activeInfo) {
    let tabInfo = await browser.tabs.get(activeInfo.tabId);
    SideBar.instance._tabHasChanged_async(tabInfo);
  }

  static _tabOnUpdated_event(tabId, changeInfo, tabInfo) {
    if (changeInfo.status == 'complete') {
      SideBar.instance._tabHasChanged_async(tabInfo);
    }
  }

  async _tabHasChanged_async(tabInfo) {
    let isFeed = false;
    try {
      isFeed = await browser.tabs.sendMessage(tabInfo.id, {key:'isFeed'});
    } catch(e) { }
    TopMenu.instance.enableAddFeedButton(isFeed);
    if(isFeed) {
      browser.pageAction.show(tabInfo.id);
      let iconUrl = ThemeManager.instance.getImgUrl('subscribe.png');
      browser.pageAction.setIcon({tabId: tabInfo.id, path: iconUrl});
    }
    else {
      browser.pageAction.hide(tabInfo.id);
    }
  }
}

SideBar.instance.init_async();
SideBar.instance.reloadOnce();
