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
    // Track the lockId currently held by each sidebar port so we can
    // release stale locks when a sidebar window closes mid-update.
    this._portToLockId = new WeakMap();
  }

  async init_async() {
    // Prevent multiple initialization attempts
    if (this._isInitializing) {
      return;
    }
    this._isInitializing = true;

    try {
      // Clear any stale feed-update lock left over from a previous browser
      // session. No sidebar window can legitimately hold one at this point.
      await this._lockManager.clearStaleLock_async();

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
        if (request.key === 'bloomFilterUpdate') {
          this._onBloomFilterUpdate(request, sender, sendResponse);
          return true; // keep message channel open for async sendResponse
        }
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
      key: 'feedUpdateLockStatusChange',
      value: status
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
      port.onMessage.addListener((message) => { self.portOnMessage_event(message, port); });
    }
  }

  portOnDisconnect_event(port) {
    let self = BackgroundManager.instance;
    let portNameInfoList = port.name.split(':');
    let sidebarWindowId = parseInt(portNameInfoList[1], 10);
    self._windowList = self._windowList.filter(item => item !== sidebarWindowId);

    // Release any feed-update lock the disconnecting sidebar was holding.
    const lockId = self._portToLockId.get(port);
    if (lockId) {
      self._portToLockId.delete(port);
      self._releaseLockIfHeldBy_async(lockId);
    }
  }

  portOnMessage_event(message, port) {
    let self = BackgroundManager.instance;
    if (message && typeof message.sidebarWindowId !== 'undefined') {
      self._windowList.push(message.sidebarWindowId);
      return;
    }
    if (message && message.key === 'lockStatus' && message.value) {
      if (message.value.status === 'acquired' && message.value.lockId) {
        self._portToLockId.set(port, message.value.lockId);
      } else if (message.value.status === 'released') {
        self._portToLockId.delete(port);
      }
    }
  }

  async _releaseLockIfHeldBy_async(lockId) {
    try {
      const lockKey = this._lockManager._lockKey;
      const result = await browser.storage.local.get(lockKey);
      const current = result[lockKey];
      if (current && current.lockId === lockId) {
        await browser.storage.local.remove(lockKey);
      }
    } catch (e) {
      ErrorHandler.logError('BackgroundManager._releaseLockIfHeldBy_async', e);
    }
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

    try {
      await browser.runtime.sendMessage({
        key: 'bloomFilterUpdate',
        value: { timestamp: request.value ? request.value.timestamp : Date.now() }
      });
      sendResponse({ success: true });
    } catch (e) {
      ErrorHandler.logError('BackgroundManager._onBloomFilterUpdate', e);
      sendResponse({ success: false });
    }
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
