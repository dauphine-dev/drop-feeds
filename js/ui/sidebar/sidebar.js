/*global ThemeManager TopMenu LocalStorageManager CssManager Timeout Dialogs BrowserManager ItemSorter SecurityFilters
ContextMenu TreeView Listener ListenerProviders BookmarkManager FeedManager ItemsPanel TabManager NewFolderDialog FilterBar*/
'use strict';
class SideBar { /*exported SideBar*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    /*eslint-disable no-console*/
    console.log('Drop Feeds loading...');
    /*eslint-enable no-console*/
    this._contentTop = null;
  }

  async init_async() {
    await BrowserManager.instance.init_async();
    await BookmarkManager.instance.init_async();
    await TreeView.instance.load_async();
    await Timeout.instance.init_async();
    await ThemeManager.instance.init_async();
    await TopMenu.instance.init_async();
    await ItemSorter.instance.init_async();
    await NewFolderDialog.instance.init_async();
    await SecurityFilters.instance.init_async();
    await FilterBar.instance.init_async();
    FeedManager.instance;
    ItemsPanel.instance;
    ItemsPanel.instance.splitterBar.top = window.innerHeight / 2;
    TabManager.instance;
    document.getElementById('main').addEventListener('click', (e) => { ContextMenu.instance.hide(e); });
    this._addListeners();
    TreeView.instance.selectionBar.refresh();
    this._computeContentTop();
    Listener.instance.subscribe(ListenerProviders.localStorage, 'reloadPanelWindow', (v) => { this.reloadPanelWindow_sbscrb(v); }, false);
    Listener.instance.subscribe(ListenerProviders.message, 'openSubscribeDialog', (v) => { this.openSubscribeDialog_async(v); }, false);
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

  async reloadPanelWindow_sbscrb() {
    window.location.reload();
  }

  async openSubscribeDialog_async() {
    console.log('openSubscribeDialog_async:1');
    let tabInfo = await BrowserManager.getActiveTab_async();
    console.log('openSubscribeDialog_async:2');
    await LocalStorageManager.setValue_async('subscribeInfo', {feedTitle: tabInfo.title, feedUrl: tabInfo.url});
    console.log('openSubscribeDialog_async:3');
    let win = await BrowserManager.openPopup_async(Dialogs.subscribeUrl, 778, 500, '');
    console.log('openSubscribeDialog_async:4');
    await LocalStorageManager.setValue_async('subscribeInfoWinId', {winId: win.id});
    console.log('openSubscribeDialog_async:5');
  }

  _addListeners() {
    window.onresize = ((e) => { this._windowOnResize_event(e); });
    document.getElementById('content').addEventListener('scroll', (e) => { this._contentOnScroll_event(e); });
  }

  async _contentOnScroll_event(){
    TreeView.instance.selectionBar.refresh();
  }

  async _windowOnResize_event() {
    this.setContentHeight();
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
