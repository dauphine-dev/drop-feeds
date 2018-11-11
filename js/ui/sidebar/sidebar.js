/*global ThemeManager FeedsTopMenu LocalStorageManager Timeout Dialogs BrowserManager ItemSorter SecurityFilters RenderOptions RenderItemPanel
FeedsContextMenu FeedsTreeView Listener ListenerProviders BookmarkManager FeedManager ItemsPanel TabManager FeedsNewFolderDialog FeedsFilterBar*/
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
    await RenderOptions.instance;
    await FeedsTreeView.instance.load_async();
    await Timeout.instance.init_async();
    await ThemeManager.instance.init_async();
    await FeedsTopMenu.instance.init_async();
    await ItemSorter.instance.init_async();
    await FeedsNewFolderDialog.instance.init_async();
    await SecurityFilters.instance.init_async();
    await FeedsFilterBar.instance.init_async();
    FeedManager.instance;
    ItemsPanel.instance;
    TabManager.instance;
    document.getElementById('mainBoxTable').addEventListener('click', (e) => { FeedsContextMenu.instance.hide(e); });
    this._addListeners();
    FeedsTreeView.instance.selectionBar.refresh();
    this._computeContentTop();
    Listener.instance.subscribe(ListenerProviders.localStorage, 'reloadPanelWindow', (v) => { this.reloadPanelWindow_sbscrb(v); }, false);
    Listener.instance.subscribe(ListenerProviders.message, 'openSubscribeDialog', (v) => { this.openSubscribeDialog_async(v); }, false);
    this.resize();
  }

  reloadOnce() {
    //Workaround to have a clean display on 1st start.
    let doReload = !sessionStorage.getItem('hasAlreadyReloaded');
    if (doReload) {
      sessionStorage.setItem('hasAlreadyReloaded', true);
      window.location.reload();
    }
  }

  async reloadPanelWindow_sbscrb() {
    window.location.reload();
  }

  async openSubscribeDialog_async() {
    let tabInfo = await BrowserManager.getActiveTab_async();
    await LocalStorageManager.setValue_async('subscribeInfo', { feedTitle: tabInfo.title, feedUrl: tabInfo.url });
    let win = await BrowserManager.openPopup_async(Dialogs.subscribeUrl, 778, 500, '');
    await LocalStorageManager.setValue_async('subscribeInfoWinId', { winId: win.id });
  }

  _addListeners() {
    window.onresize = ((e) => { this._windowOnResize_event(e); });
    document.getElementById('content').addEventListener('scroll', (e) => { this._contentOnScroll_event(e); });
  }

  async _contentOnScroll_event() {
    FeedsTreeView.instance.selectionBar.refresh();
  }

  async _windowOnResize_event() {
    this.resize();
  }

  _computeContentTop() {
    let refElementId = (FeedsFilterBar.instance.enabled ? 'filterBar' : 'statusBar');
    let refElement = document.getElementById(refElementId);
    let rect = refElement.getBoundingClientRect();
    this._contentTop = rect.bottom + 1;
  }

  resize() {
    FeedsTreeView.instance.resize();
    ItemsPanel.instance.resize();
    RenderItemPanel.instance.resize();
  }
}
SideBar.instance.init_async();
