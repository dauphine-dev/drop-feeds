/*global browser BloomFilter LocalStorageManager FeedManager ErrorHandler Feed*/
'use strict';

/**
 * Bloom Filter Manager for Drop-Feeds
 * 
 * This class manages the Bloom Filter instance and coordinates
 * synchronization across windows using browser.storage.sync.
 */
class BloomFilterManager { /*exported BloomFilterManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._bloomFilter = null;
    this._feedUrlCache = new Map();
    this._isInitialized = false;
    this._syncInterval = null;
    
    // Initialize with default configuration
    this._expectedFeedCount = 100;
    this._falsePositiveRate = 0.01;
    this._updateInterval = 30000; // 30 seconds
    this._isDirty = false;
    this._saveDebounceTimer = null;
    this._saveDebounceDelay = 5000; // 5 seconds
    this._cachedFeedCount = null;

    // Listen for storage changes
    browser.storage.onChanged.addListener((changes, areaName) => {
      this._onStorageChanged(changes, areaName);
    });
  }

  /**
   * Initialize the Bloom Filter Manager
   * @returns {Promise} Promise that resolves when initialized
   */
  async initAsync() {
    if (this._isInitialized) {
      return;
    }

    // Load existing Bloom Filter or create new one
    try {
      this._bloomFilter = await ErrorHandler.handleWithFallback_async(
        'BloomFilterManager.initAsync',
        async () => await BloomFilter.loadAsync(),
        async () => {
          // Fallback to localStorage if sync storage fails
          const result = await browser.storage.local.get('bloomFilter');
          return BloomFilter.fromJSON(result.bloomFilter);
        }
      );
      
      // Update expected feed count based on actual feed count
      await this._updateFeedCountAsync();
      
      // Start synchronization interval
      this._startSyncInterval();
      
      this._isInitialized = true;
    } catch (e) {
      ErrorHandler.logError('BloomFilterManager.initAsync', e);
      // Create a new Bloom Filter if initialization fails
      this._bloomFilter = new BloomFilter(this._expectedFeedCount, this._falsePositiveRate);
      this._isInitialized = true;
    }
  }

  /**
   * Get the Bloom Filter instance
   * @returns {BloomFilter} Bloom Filter instance
   */
  getBloomFilter() {
    if (!this._bloomFilter) {
      throw new Error('Bloom Filter Manager not initialized. Call initAsync() first.');
    }
    return this._bloomFilter;
  }
  
  /**
   * Check if the Bloom Filter Manager is initialized
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this._isInitialized;
  }

  /**
   * Add a feed URL to the Bloom Filter
   * @param {string} feedUrl - Feed URL to add
   * @returns {Promise} Promise that resolves when added
   */
  async addFeedAsync(feedUrl) {
    if (!this._bloomFilter) {
      await this.initAsync();
    }

    if (typeof feedUrl !== 'string' || !feedUrl) {
      return;
    }

    // Check if already in cache
    if (this._feedUrlCache.has(feedUrl)) {
      return;
    }

    // Add to Bloom Filter
    this._bloomFilter.add(feedUrl);

    // Add to cache
    this._feedUrlCache.set(feedUrl, true);

    // Mark dirty and schedule debounced save
    this._isDirty = true;
    this._scheduleSave();
  }

  /**
   * Check if a feed URL might be in the Bloom Filter
   * @param {string} feedUrl - Feed URL to check
   * @returns {boolean} True if feed might be present
   */
  containsFeed(feedUrl) {
    if (!this._bloomFilter) {
      return false;
    }

    return this._bloomFilter.contains(feedUrl);
  }

  /**
   * Update the expected feed count based on actual feed count
   * @returns {Promise} Promise that resolves when updated
   */
  async _updateFeedCountAsync() {
    try {
      // Use cached count if available
      if (this._cachedFeedCount !== null) {
        return;
      }

      // Get root folder ID
      const rootFolderId = await LocalStorageManager.getValue_async('rootBookmarkId', 'dropfeedsId=1');

      // Get feed count from bookmarks
      const bookmarks = await browser.bookmarks.getSubTree(rootFolderId);
      let feedCount = 0;

      // Count feeds (bookmarks with URLs)
      const countFeeds = (children) => {
        if (!children) return;
        for (const child of children) {
          if (child.url) {
            feedCount++;
          }
          if (child.children) {
            countFeeds(child.children);
          }
        }
      };

      countFeeds(bookmarks[0].children);
      this._cachedFeedCount = feedCount;
      
      // Update expected count with 1.5x overhead
      if (feedCount > 0) {
        this._expectedFeedCount = Math.ceil(feedCount * 1.5);
        
        // Recreate Bloom Filter with new size if needed
        if (this._bloomFilter && this._bloomFilter.expectedItems < this._expectedFeedCount) {
          const oldFilter = this._bloomFilter;
          const newFilter = new BloomFilter(this._expectedFeedCount, this._falsePositiveRate);
          
          // Merge old filter data into new filter to preserve existing state
          newFilter.merge(oldFilter);
          this._bloomFilter = newFilter;
        }
      }
    } catch (e) {
      ErrorHandler.logError('BloomFilterManager._updateFeedCountAsync', e);
    }
  }

  /**
   * Schedule a debounced save
   */
  _scheduleSave() {
    if (this._saveDebounceTimer) {
      clearTimeout(this._saveDebounceTimer);
    }
    this._saveDebounceTimer = setTimeout(() => {
      this._saveAsync();
    }, this._saveDebounceDelay);
  }

  /**
   * Save the Bloom Filter to storage
   * @returns {Promise} Promise that resolves when saved
   */
  async _saveAsync() {
    if (!this._bloomFilter || !this._isDirty) {
      return;
    }

    this._isSaving = true;
    try {
      await this._bloomFilter.saveAsync();
      this._isDirty = false;
    } catch (e) {
      ErrorHandler.logError('BloomFilterManager._saveAsync', e);
    } finally {
      this._isSaving = false;
    }
  }

  /**
   * Start the synchronization interval
   */
  _startSyncInterval() {
    if (this._syncInterval) {
      clearInterval(this._syncInterval);
    }
    
    this._syncInterval = setInterval(() => {
      this._syncAsync();
    }, this._updateInterval);
  }

  /**
   * Synchronize the Bloom Filter with storage
   * @returns {Promise} Promise that resolves when synchronized
   */
  async _syncAsync() {
    if (!this._isInitialized) {
      return;
    }

    try {
      // Load latest from storage
      const latestFilter = await ErrorHandler.handleWithFallback_async(
        'BloomFilterManager._syncAsync',
        async () => await BloomFilter.loadAsync(),
        async () => {
          // Fallback to localStorage if sync storage fails
          const result = await browser.storage.local.get('bloomFilter');
          return BloomFilter.fromJSON(result.bloomFilter);
        }
      );
      
      // Merge if needed
      // Check if filters are different and if the latest filter is newer
      const latestTimestamp = latestFilter.timestamp || 0;
      const currentTimestamp = this._bloomFilter.timestamp || 0;

      if (latestFilter.id !== this._bloomFilter.id || latestTimestamp > currentTimestamp) {
        // Only merge if the latest filter is newer or has different data
        if (latestTimestamp >= currentTimestamp) {
          this._bloomFilter.merge(latestFilter);
          this._isDirty = true;
          await this._saveAsync();
        }
      }
    } catch (e) {
      ErrorHandler.logError('BloomFilterManager._syncAsync', e);
    }
  }

  /**
   * Handle storage changes
   * @param {object} changes - Changes object from browser.storage.onChanged
   * @param {string} areaName - Storage area name ('sync' or 'local')
   */
  async _onStorageChanged(changes, areaName) {
    if (!this._isInitialized || this._isSaving) {
      return;
    }

    if (changes.bloomFilter) {
      try {
        const newValue = changes.bloomFilter.newValue;
        if (!newValue) return;

        const newFilter = BloomFilter.fromJSON(newValue);

        // Only merge if the change came from a different filter instance
        if (newFilter.id === this._bloomFilter.id) {
          return;
        }

        this._bloomFilter.merge(newFilter);
        this._broadcastUpdateAsync();
      } catch (e) {
        ErrorHandler.logError('BloomFilterManager._onStorageChanged', e);
      }
    }
  }

  /**
   * Broadcast update to all windows via runtime messaging
   * @returns {Promise} Promise that resolves when broadcast is complete
   */
  async _broadcastUpdateAsync() {
    try {
      await browser.runtime.sendMessage({
        type: 'bloomFilterUpdate',
        timestamp: Date.now()
      });
    } catch (e) {
      // "Could not establish connection" is expected when no listeners exist
      if (!e.message || !e.message.includes('Could not establish connection')) {
        ErrorHandler.logError('BloomFilterManager._broadcastUpdateAsync', e);
      }
    }
  }

  /**
   * Clear the Bloom Filter
   * @returns {Promise} Promise that resolves when cleared
   */
  async clearAsync() {
    if (!this._bloomFilter) {
      return;
    }

    this._bloomFilter.clear();
    this._feedUrlCache.clear();
    this._cachedFeedCount = null;
    this._isDirty = true;
    await this._saveAsync();
  }

  /**
   * Invalidate cache for a specific feed URL
   * @param {string} feedUrl - Feed URL to invalidate
   */
  invalidateCache(feedUrl) {
    // Validate input
    if (typeof feedUrl !== 'string' || !feedUrl) {
      ErrorHandler.logError('BloomFilterManager.invalidateCache', 'Invalid feedUrl parameter');
      return;
    }
    
    if (this._feedUrlCache.has(feedUrl)) {
      this._feedUrlCache.delete(feedUrl);
    }
  }

  /**
   * Invalidate cache for all feeds in a folder
   * @param {string} folderId - Folder ID
   */
  async invalidateFolderCache_async(folderId) {
    try {
      const rootFolderId = await LocalStorageManager.getValue_async('rootBookmarkId', 'dropfeedsId=1');
      const bookmarks = await browser.bookmarks.getSubTree(rootFolderId);
      
      // Find feeds in the specified folder
      const findFeedsInFolder = (children, folderId) => {
        if (!children) return [];
        let feeds = [];
        for (const child of children) {
          if (child.id === folderId && child.children) {
            feeds = feeds.concat(findFeedsInFolder(child.children, folderId));
          } else if (child.url) {
            feeds.push(child.url);
          } else if (child.children) {
            feeds = feeds.concat(findFeedsInFolder(child.children, folderId));
          }
        }
        return feeds;
      };
      
      const feeds = findFeedsInFolder(bookmarks[0].children, folderId);
      
      // Invalidate cache for each feed
      for (const feedUrl of feeds) {
        this.invalidateCache(feedUrl);
      }
    } catch (e) {
      ErrorHandler.logError('BloomFilterManager.invalidateFolderCache_async', e);
    }
  }

  /**
   * Invalidate cache for a specific feed
   * @param {string} feedId - Feed ID
   */
  async invalidateFeedCache_async(feedId) {
    try {
      const feed = await Feed.new(feedId);
      this.invalidateCache(feed.url);
    } catch (e) {
      ErrorHandler.logError('BloomFilterManager.invalidateFeedCache_async', e);
    }
  }

  /**
   * Get statistics about the Bloom Filter
   * @returns {object} Statistics object
   */
  getStatistics() {
    if (!this._bloomFilter) {
      return {
        initialized: false
      };
    }

    // Count set bits
    let setBits = 0;
    for (const chunk in this._bloomFilter._bitArray) {
      if (this._bloomFilter._bitArray.hasOwnProperty(chunk)) {
        const value = this._bloomFilter._bitArray[chunk];
        // Count set bits in this 32-bit chunk
        let bits = value;
        while (bits) {
          setBits += bits & 1;
          bits >>>= 1;
        }
      }
    }

    return {
      initialized: true,
      sizeInBits: this._bloomFilter.sizeInBits,
      hashCount: this._bloomFilter.hashCount,
      expectedItems: this._bloomFilter.expectedItems,
      setBits: setBits,
      fillRatio: setBits / this._bloomFilter.sizeInBits,
      falsePositiveRate: this._bloomFilter.falsePositiveRate,
      feedUrlCacheSize: this._feedUrlCache.size
    };
  }

  /**
   * Get the current expected feed count
   * @returns {number} Expected feed count
   */
  getExpectedFeedCount() {
    return this._expectedFeedCount;
  }

  /**
   * Set the expected feed count
   * @param {number} count - Expected feed count
   */
  setExpectedFeedCount(count) {
    this._expectedFeedCount = Math.max(count, 10);
  }

  /**
   * Get the false positive rate
   * @returns {number} False positive rate
   */
  getFalsePositiveRate() {
    return this._falsePositiveRate;
  }

  /**
   * Set the false positive rate
   * @param {number} rate - False positive rate (0.01 = 1%)
   */
  setFalsePositiveRate(rate) {
    this._falsePositiveRate = Math.min(Math.max(rate, 0.001), 0.1);
  }

  /**
   * Cleanup resources when the component is no longer needed
   */
  cleanup() {
    // Stop sync interval
    if (this._syncInterval) {
      clearInterval(this._syncInterval);
      this._syncInterval = null;
    }

    // Clear debounce timer
    if (this._saveDebounceTimer) {
      clearTimeout(this._saveDebounceTimer);
      this._saveDebounceTimer = null;
    }

    // Clear bloom filter reference
    this._bloomFilter = null;

    // Clear cache
    this._feedUrlCache.clear();
    this._cachedFeedCount = null;

    // Reset initialization state
    this._isInitialized = false;
    this._isDirty = false;
  }
}