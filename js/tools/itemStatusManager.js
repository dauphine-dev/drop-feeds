/*global browser ErrorHandler*/
'use strict';

/**
 * Cross-Window Item Status Manager for Drop-Feeds
 * 
 * This class manages item read/unread status tracking using browser.storage.sync
 * to provide cross-window synchronization of item states.
 */
class ItemStatusManager { /*exported ItemStatusManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._statusKey = 'dropfeeds-item-status';
    this._itemStatusCache = new Map(); // URL -> { visited: boolean, timestamp: number }
    this._isInitialized = false;
    
    // Listen for storage changes to detect status updates from other windows
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes[this._statusKey]) {
        this._onStorageChanged(changes[this._statusKey]);
      }
    });
  }

  /**
   * Initialize the Item Status Manager
   * @returns {Promise} Promise that resolves when initialized
   */
  async initAsync() {
    if (this._isInitialized) {
      return;
    }

    try {
      // Load existing item status from storage
      const result = await browser.storage.sync.get(this._statusKey);
      if (result[this._statusKey]) {
        this._itemStatusCache = new Map(Object.entries(result[this._statusKey]));
      }
      
      this._isInitialized = true;
    } catch (e) {
      ErrorHandler.logError('ItemStatusManager.initAsync', e);
      // Start with empty cache if initialization fails
      this._itemStatusCache = new Map();
      this._isInitialized = true;
    }
  }

  /**
   * Check if an item has been marked as read (visited)
   * @param {string} url - Item URL to check
   * @returns {boolean} True if item is marked as read
   */
  isItemRead(url) {
    if (!this._isInitialized || !url) {
      return false;
    }

    const status = this._itemStatusCache.get(url);
    return status ? status.visited : false;
  }

  /**
   * Mark an item as read (visited)
   * @param {string} url - Item URL to mark as read
   * @returns {Promise} Promise that resolves when saved
   */
  async markItemReadAsync(url) {
    if (!url) {
      return;
    }

    const now = Date.now();
    
    // Update cache
    this._itemStatusCache.set(url, { visited: true, timestamp: now });
    
    // Save to storage for cross-window sync
    try {
      await browser.storage.sync.set({
        [this._statusKey]: Object.fromEntries(this._itemStatusCache)
      });
    } catch (e) {
      ErrorHandler.logError('ItemStatusManager.markItemReadAsync', e);
    }
  }

  /**
   * Mark an item as unread (unvisited)
   * @param {string} url - Item URL to mark as unread
   * @returns {Promise} Promise that resolves when saved
   */
  async markItemUnreadAsync(url) {
    if (!url) {
      return;
    }

    // Update cache
    this._itemStatusCache.set(url, { visited: false, timestamp: Date.now() });
    
    // Save to storage for cross-window sync
    try {
      await browser.storage.sync.set({
        [this._statusKey]: Object.fromEntries(this._itemStatusCache)
      });
    } catch (e) {
      ErrorHandler.logError('ItemStatusManager.markItemUnreadAsync', e);
    }
  }

  /**
   * Handle storage changes from other windows
   * @param {object} change - Storage change object
   */
  _onStorageChanged(change) {
    try {
      const newValue = change.newValue;
      if (!newValue) {
        // Status was cleared, reset cache
        this._itemStatusCache.clear();
        return;
      }

      // Merge incoming status with local cache
      for (const [url, status] of Object.entries(newValue)) {
        this._itemStatusCache.set(url, status);
      }
    } catch (e) {
      ErrorHandler.logError('ItemStatusManager._onStorageChanged', e);
    }
  }

  /**
   * Get the cached status for an item URL
   * @param {string} url - Item URL to get status for
   * @returns {object|null} Status object or null if not found
   */
  getStatus(url) {
    return this._itemStatusCache.get(url) || null;
  }

  /**
   * Clear the item status cache
   * @returns {Promise} Promise that resolves when cleared
   */
  async clearAsync() {
    this._itemStatusCache.clear();
    try {
      await browser.storage.sync.remove(this._statusKey);
    } catch (e) {
      ErrorHandler.logError('ItemStatusManager.clearAsync', e);
    }
  }

  /**
   * Get statistics about tracked items
   * @returns {object} Statistics object
   */
  getStatistics() {
    let readCount = 0;
    for (const status of this._itemStatusCache.values()) {
      if (status.visited) {
        readCount++;
      }
    }

    return {
      initialized: this._isInitialized,
      totalTracked: this._itemStatusCache.size,
      markedAsRead: readCount,
      markedAsUnread: this._itemStatusCache.size - readCount
    };
  }

  /**
   * Cleanup resources when the component is no longer needed
   */
  cleanup() {
    this._isInitialized = false;
    this._itemStatusCache.clear();
  }
}
