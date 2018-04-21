/*global ThemeManager TopMenu LocalStorageManager CssManager Timeout Dialogs BrowserManager
ContextMenu TreeView Listener ListenerProviders BookmarkManager FeedManager ItemsPanel TabManager*/
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
    console.log('Drop Feeds loading...');
    /*eslint-enable no-console*/
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
    TabManager.instance;
    document.getElementById('main').addEventListener('click', ContextMenu.instance.hide);
    this._addListeners();
    TreeView.instance.selectionBar.refresh();
    this._computeContentTop();
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
    let tabInfo = await BrowserManager.getActiveTab_async();
    await LocalStorageManager.setValue_async('subscribeInfo', {feedTitle: tabInfo.title, feedUrl: tabInfo.url});
    BrowserManager.openPopup_async(Dialogs.subscribeUrl, 778, 500, '');
  }

  _addListeners() {
    window.onresize = SideBar._windowOnResize_event;
    document.getElementById('content').addEventListener('scroll', SideBar._contentOnScroll_event);
  }

  static async _contentOnScroll_event(){
    TreeView.instance.selectionBar.refresh();
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
}

SideBar.instance.init_async();
SideBar.instance.reloadOnce();
