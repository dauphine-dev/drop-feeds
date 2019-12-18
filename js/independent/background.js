/*global browser*/
'use strict';
const SIDEBAR_URL = '/html/sidebar.html';

class BackgroundManager {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._windowList = [];
    this._windowId = null;
  }

  async init_async() {
    this._sidebarListener();
    let windowInfo = await browser.windows.getCurrent({ populate: true });
    this._windowId = windowInfo.id;
    browser.windows.onFocusChanged.addListener((windowId) => { this._windowOnFocused_event(windowId); });
    browser.browserAction.onClicked.addListener((e) => { this._toggleDropFeedsPanel_async(e); });

  }

  async _windowOnFocused_event(windowId) {
    if (windowId >= 0) {
      this._windowId = windowId;
    }
  }

  async _toggleDropFeedsPanel_async() {
    if (typeof browser.sidebarAction.toggle !== 'undefined') { 
      browser.sidebarAction.toggle();
      return;
    }
  
    
    let sidebarActionIsOpen = this._windowList.includes(this._windowId);
    if (sidebarActionIsOpen) {
      browser.sidebarAction.close();
    }
    else {
      let panelUrl = browser.runtime.getURL(SIDEBAR_URL);
      browser.sidebarAction.setPanel({ panel: panelUrl });
      browser.sidebarAction.open();
    }
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
}
BackgroundManager.instance.init_async();
