/*global browser ThemeManager FeedsTopMenu Dialogs BrowserManager ItemSorter SecurityFilters FeedRendererOptions RenderItemLayout FeedsFilterBar FeedsNewFolderDialog*/
/*global FeedsContextMenu FeedsTreeView Listener ListenerProviders BookmarkManager FeedManager ItemsLayout TabManager OptionSubscribeDialog FeedTabHandler*/
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
    this._sendWindowIdToBgScript();
    await ThemeManager.instance.init_async();
    await BookmarkManager.instance.init_async();
    await FeedsTreeView.instance.load_async();
    await BrowserManager.instance.init_async();
    FeedRendererOptions.instance;
    ItemSorter.instance;
    SecurityFilters.instance;
    FeedManager.instance;
    TabManager.instance;
    await ItemsLayout.instance.init_async();
    await FeedsTopMenu.instance.init_async();
    FeedsFilterBar.instance;
    RenderItemLayout.instance;
    FeedsNewFolderDialog.instance;
    OptionSubscribeDialog.instance;
    FeedTabHandler.instance;
    this._computeContentTop();
    Listener.instance.subscribe(ListenerProviders.localStorage, 'reloadPanelWindow', (v) => { this.reloadPanelWindow_sbscrb(v); }, false);
    Listener.instance.subscribe(ListenerProviders.message, 'openSubscribeDialog', (v) => { this.openSubscribeDialog_async(v); }, false);
    document.getElementById('mainBoxTable').addEventListener('click', (e) => { FeedsContextMenu.instance.hide(e); });
    document.getElementById('feedsContentPanel').addEventListener('scroll', (e) => { this._contentOnScroll_event(e); });
    window.addEventListener('resize', (e) => { this._windowOnResize_event(e); });
    FeedsTreeView.instance.selectionBar.refresh();
    SideBar.instance.resize();
    setTimeout(() => { SideBar.instance.resize(); }, 20);
  }

  async _sendWindowIdToBgScript() {
    let windowInfo = await browser.windows.getCurrent({ populate: true });
    let connectInfo = { 'name': 'sidebarWindowId:' + windowInfo.id };
    let port = browser.runtime.connect(connectInfo);
    port.postMessage({ sidebarWindowId: windowInfo.id });

  }

  async reloadPanelWindow_sbscrb() {
    window.location.reload();
  }

  async openSubscribeDialog_async(value) {
    let feedUrl = value;
    if (!feedUrl) {
      let tabInfo = await BrowserManager.getActiveTab_async();
      feedUrl = tabInfo.url;
    }
    await Dialogs.openSubscribeDialog_async('', feedUrl);
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
    ItemsLayout.instance.resize();
    RenderItemLayout.instance.resize();
  }
}
SideBar.instance.init_async();
