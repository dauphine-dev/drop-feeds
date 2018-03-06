/*global browser CommonValues ThemeManager SelectionBar TopMenu LocalStorageManager CssManager DateTime ContextMenu TreeView LocalStorageListener MessageManager BookmarkManager*/
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
    this._contentTop = null;
    this._treeView = null;
    this._localStorageListener = null;
  }

  async init_async() {
    await ThemeManager.instance.init_async();
    await CommonValues.instance.init_async();
    await TopMenu.instance.init_async();
    MessageManager.instance;
    this._treeView = new TreeView();
    this._treeView = await this._treeView.createAndShow();
    this._localStorageListener = new LocalStorageListener();
    document.getElementById('main').addEventListener('click', ContextMenu.instance.hide);
    this._setContentHeight();
    this._addListeners();
    SelectionBar.instance.refresh();
    this._computeContentTop();
    await this._forceTabOnChanged_async();
  }

  reloadOnce() {
    //Workaround to have a clean display on 1st start.
    let doReload = ! sessionStorage.getItem('hasAlreadyReloaded');
    if (doReload) {
      sessionStorage.setItem('hasAlreadyReloaded', true);
      window.location.reload();
    }
  }

  async reloadPanelWindow() {
    window.location.reload();
  }

  async reloadPanel_async() {
    await CommonValues.instance.reload_async();
    this._treeView = new TreeView();
    this._treeView = await this._treeView.createAndShow();
    this._setContentHeight();
  }

  async openSubscribeDialog_async() {
    let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
    let url = browser.extension.getURL(CommonValues.instance.subscribeHtmlUrl);
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
    BookmarkManager.addListeners();
    window.onresize = this._windowOnResize;
    browser.tabs.onActivated.addListener(this._tabOnActivated_event);
    browser.tabs.onUpdated.addListener(this._tabOnUpdated_event);
    document.getElementById('content').addEventListener('scroll', this._contentOnScroll_event);
  }

  _contentOnScroll_event(){
    SelectionBar.instance.refresh();
  }

  async _forceTabOnChanged_async() {
    let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
    this._tabHasChanged_async(tabInfos[0]);
  }

  async _windowOnResize() {
    this._setContentHeight();
  }

  _computeContentTop() {
    let elStatusBar = document.getElementById('statusBar');
    let rect = elStatusBar.getBoundingClientRect();
    this._contentTop = rect.bottom + 1;
  }

  _setContentHeight() {
    let height = Math.max(window.innerHeight - this._contentTop, 0);
    CssManager.replaceStyle('.contentHeight', '  height:' + height + 'px;');
  }

  async _tabOnActivated_event(activeInfo) {
    let tabInfo = await browser.tabs.get(activeInfo.tabId);
    SideBar.instance._tabHasChanged_async(tabInfo);
  }

  _tabOnUpdated_event(tabId, changeInfo, tabInfo) {
    if (changeInfo.status == 'complete') {
      SideBar.instance._tabHasChanged_async(tabInfo);
    }
  }

  async _tabHasChanged_async(tabInfo) {
    let isFeed = false;
    try {
      isFeed = await browser.tabs.sendMessage(tabInfo.id, {'req':'isFeed'});
    } catch(e) { }
    TopMenu.instance.enableAddFeedButton(isFeed);
    if(isFeed) {
      browser.pageAction.show(tabInfo.id);
      let iconUrl = ThemeManager.instance.getImgUrl('subscribe.png');
      browser.pageAction.setIcon({tabId: tabInfo.id, path: iconUrl});
      browser.tabs.sendMessage(tabInfo.id, {'req':'addSubscribeButton'});
    }
    else {
      browser.pageAction.hide(tabInfo.id);
    }
  }
}

SideBar.instance.init_async();
SideBar.instance.reloadOnce();
