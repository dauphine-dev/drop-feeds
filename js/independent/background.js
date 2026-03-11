/*global browser chrome BloomFilterManager ErrorHandler FeedUpdateLockManager*/
'use strict';

class BackgroundManager {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._windowList = [];
    this._windowId = null;
    this._portKeepAlive = null;
    this._bloomFilterManager = BloomFilterManager.instance;
    this._lockManager = FeedUpdateLockManager.instance;
    this._bloomFilterUpdateListener = null;
    this._feedUpdateLockStatusListener = null;
  }

  async init_async() {
    // Prevent multiple initialization attempts
    if (this._isInitializing) {
      return;
    }
    this._isInitializing = true;

    try {
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

      // Initialize Bloom Filter Manager
      await this._bloomFilterManager.initAsync();

      // Listen for Bloom Filter updates from other windows
      this._bloomFilterUpdateListener = (request, sender, sendResponse) => {
        this._onBloomFilterUpdate(request, sender, sendResponse);
      };
      browser.runtime.onMessage.addListener(this._bloomFilterUpdateListener);

      // Listen for feed update lock status changes
      this._feedUpdateLockStatusListener = (status) => {
        this._onFeedUpdateLockStatusChanged(status);
      };
      this._feedUpdateLockUnsubscribe = this._lockManager.subscribe(this._feedUpdateLockStatusListener);
    } catch (error) {
      this._isInitializing = false;
      throw error;
    }
  }

  _onFeedUpdateLockStatusChanged(status) {
    browser.runtime.sendMessage({
      type: 'feedUpdateLockStatusChange',
      status: status
    }).catch(e => {
      ErrorHandler.logError('BackgroundManager._onFeedUpdateLockStatusChanged', e);
    });
  }

  cleanup() {
    if (this._bloomFilterUpdateListener) {
      browser.runtime.onMessage.removeListener(this._bloomFilterUpdateListener);
      this._bloomFilterUpdateListener = null;
    }

    if (this._feedUpdateLockUnsubscribe) {
      this._feedUpdateLockUnsubscribe();
      this._feedUpdateLockUnsubscribe = null;
    }

    this._lockManager.cleanup();
    this._isInitializing = false;
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

  async _onBloomFilterUpdate(request, sender, sendResponse) {
    if (!sender || !sender.id) {
      return false;
    }

    if (sender.id !== browser.runtime.id) {
      return false;
    }

    if (typeof request !== 'object' || request === null) {
      return false;
    }

    if (request.type !== 'bloomFilterUpdate') {
      return false;
    }

    try {
      await browser.runtime.sendMessage({
        type: 'bloomFilterUpdate',
        timestamp: request.timestamp
      });
      sendResponse({ success: true });
    } catch (e) {
      ErrorHandler.logError('BackgroundManager._onBloomFilterUpdate', e);
      sendResponse({ success: false });
    }
    return false;
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
