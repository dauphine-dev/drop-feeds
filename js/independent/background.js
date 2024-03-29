/*global browser chrome*/
'use strict';

class BackgroundManager {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._windowList = [];
    this._windowId = null;
    this._portKeepAlive = null;
  }

  async init_async() {
    this._sidebarListener();
    let windowInfo = await browser.windows.getCurrent({ populate: true });
    this._windowId = windowInfo.id;
    browser.windows.onFocusChanged.addListener((windowId) => { this._windowOnFocused_event(windowId); });
    if (browser.runtime.getManifest().manifest_version >= 3) {
      browser.action.onClicked.addListener((e) => { this._toggleDropFeedsPanel_async(e); });
    } else {
      browser.browserAction.onClicked.addListener((e) => { this._toggleDropFeedsPanel_async(e); });
    }
    this.keepMeAlive();
  }

  async _windowOnFocused_event(windowId) {
    if (windowId >= 0) {
      this._windowId = windowId;
    }
  }

  async _toggleDropFeedsPanel_async() {
    browser.sidebarAction.toggle();
  }

  _sidebarListener() {
    browser.runtime.onConnect.addListener((port) => { this.runtimeOnConnect_event(port); });
  }

  runtimeOnConnect_event(port) {
    let self = BackgroundManager.instance;
    if (port.sender.id == browser.runtime.id) {
      port.onDisconnect.addListener((port) => { self.portOnDisconnect_event(port); });
      port.onMessage.addListener((message) => { self.portOnMessage_event(message); });
    }
  }

  portOnDisconnect_event(port) {
    let self = BackgroundManager.instance;
    let portNameInfoList = port.name.split(':');
    let sidebarWindowId = parseInt(portNameInfoList[1], 10);
    self._windowList = self._windowList.filter(item => item !== sidebarWindowId);
  }

  portOnMessage_event(message) {
    let self = BackgroundManager.instance;
    self._windowList.push(message.sidebarWindowId);
  }

  async keepMeAlive() {
    setInterval(() => {
      if (this._portKeepAlive == null) {
        this._portKeepAlive = chrome.runtime.connect({ name: 'keep-background-script-alive' });
        this._portKeepAlive.onDisconnect.addListener(() => { this._portKeepAlive = null; });
      }
      if (this._portKeepAlive) { this._portKeepAlive.postMessage({ content: 'keep-me-alive' }); }
    }, 15000);
  }
}
BackgroundManager.instance.init_async();
