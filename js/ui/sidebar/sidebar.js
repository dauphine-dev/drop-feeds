/*global browser ThemeManager FeedsTopMenu Dialogs BrowserManager ItemSorter SecurityFilters FeedRendererOptions RenderItemLayout FeedsFilterBar FeedsNewFolderDialog*/
/*global FeedsContextMenu FeedsTreeView Listener ListenerProviders BookmarkManager FeedManager ItemsLayout TabManager OptionSubscribeDialog FeedTabHandler FeedUpdateLockManager*/
'use strict';
class SideBar { /*exported SideBar*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    /*eslint-disable no-console*/
    console.log('Drop Feeds loading...');
    /*eslint-enable no-console*/
    this._contentTop = null;
    this._bgPort = null;
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
    FeedManager.instance.init_async();
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
    this._bgPort = browser.runtime.connect(connectInfo);
    this._bgPort.postMessage({ sidebarWindowId: windowInfo.id });

    // Forward local lock acquire/release events to the background so it can
    // clean up on sidebar close. Local FeedUpdateLockManager already fires
    // these via its storage listener; we just relay them.
    FeedUpdateLockManager.instance.subscribe((status) => {
      if (!this._bgPort) { return; }
      if (status.status === 'acquired' || status.status === 'released') {
        try {
          this._bgPort.postMessage({ key: 'lockStatus', value: { status: status.status, lockId: status.lockId } });
        } catch (e) {
          // Port may be disconnected during teardown — non-fatal.
        }
      }
    });

    // Best-effort release on sidebar unload. Fire-and-forget because the
    // page is going away; the background's port-disconnect cleanup is the
    // authoritative fallback.
    window.addEventListener('pagehide', () => {
      try {
        const p = FeedUpdateLockManager.instance.releaseLock_async();
        if (p && typeof p.catch === 'function') { p.catch(() => {}); }
      } catch (e) { /* noop */ }
    });
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
