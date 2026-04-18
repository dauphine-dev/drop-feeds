/*global browser LocalStorageManager murmurHash3*/
'use strict';

/**
 * Bloom Filter implementation for tracking checked feed URLs
 * 
 * This Bloom Filter is designed to be portable and machine-independent
 * to support future network synchronization between different machines.
 * 
 * The filter uses a JSON-based representation with 32-bit integer chunks
 * for maximum precision and compatibility.
 */
class BloomFilter { /*exported BloomFilter*/
  /**
   * Create a new Bloom Filter
   * @param {number} expectedItems - Expected number of items to store
   * @param {number} falsePositiveRate - Desired false positive rate (0.01 = 1%)
   */
  constructor(expectedItems = 1000, falsePositiveRate = 0.01) {
    this._expectedItems = expectedItems;
    this._falsePositiveRate = falsePositiveRate;

    // Calculate optimal size and number of hash functions
    this._sizeInBits = Math.ceil(-Math.log(falsePositiveRate) * expectedItems / Math.pow(Math.log(2), 2));
    this._hashCount = Math.round(this._sizeInBits / expectedItems * Math.log(2));

    // Ensure minimum values
    if (this._sizeInBits < 64) this._sizeInBits = 64;
    if (this._hashCount < 1) this._hashCount = 1;
    if (this._hashCount > 10) this._hashCount = 10;

    this._bitArray = {};

    this._id = 'bloomFilter_' + Date.now() + '_' +
               Math.random().toString(36).substr(2, 9) + '_' +
               Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get the size of the bit array in bits
   */
  get sizeInBits() {
    return this._sizeInBits;
  }

  /**
   * Get the number of hash functions used
   */
  get hashCount() {
    return this._hashCount;
  }

  /**
   * Get the expected number of items
   */
  get expectedItems() {
    return this._expectedItems;
  }

  /**
   * Get the configured false positive rate
   */
  get falsePositiveRate() {
    return this._falsePositiveRate;
  }

  /**
   * Get the unique identifier for this filter instance
   */
  get id() {
    return this._id;
  }

  /**
   * Set the unique identifier for this filter instance
   * @param {string} id - New identifier
   */
  set id(id) {
    this._id = id;
  }

  /**
   * Get the timestamp for this filter instance
   */
  get timestamp() {
    return this._timestamp || 0;
  }

  /**
   * Hash a string using a seed value
   * Uses MurmurHash3 algorithm for consistent hashing
   *
   * @param {string} item - Item to hash
   * @param {number} seed - Seed value for the hash function
   * @returns {number} Hash value
   */
  _hash(item, seed) {
    const hash = murmurHash3(item, seed);
    return hash % this._sizeInBits;
  }

  /**
   * Add an item to the Bloom Filter
   * @param {string} item - Item to add
   */
  add(item) {
    if (typeof item !== 'string' || !item) {
      return;
    }

    for (let i = 0; i < this._hashCount; i++) {
      const bitIndex = this._hash(item, i + 1);
      this._setBit(bitIndex);
    }
  }

  /**
   * Check if an item might be in the Bloom Filter
   * @param {string} item - Item to check
   * @returns {boolean} True if item might be present, false if definitely not present
   */
  contains(item) {
    if (typeof item !== 'string' || !item) {
      return false;
    }

    for (let i = 0; i < this._hashCount; i++) {
      const bitIndex = this._hash(item, i + 1);
      if (!this._getBit(bitIndex)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Set a bit in the bit array
   * @param {number} index - Bit index (0-based)
   */
  _setBit(index) {
    // Calculate which 32-bit chunk this bit belongs to
    const chunkIndex = Math.floor(index / 32);
    const bitOffset = index % 32;
    const bitValue = 1 << bitOffset;

    // Get current chunk value or 0 if not set
    const currentChunk = this._bitArray[chunkIndex] || 0;
    
    // Set the bit
    this._bitArray[chunkIndex] = currentChunk | bitValue;
  }

  /**
   * Get a bit from the bit array
   * @param {number} index - Bit index (0-based)
   * @returns {boolean} True if bit is set, false otherwise
   */
  _getBit(index) {
    // Calculate which 32-bit chunk this bit belongs to
    const chunkIndex = Math.floor(index / 32);
    const bitOffset = index % 32;
    const bitValue = 1 << bitOffset;

    // Get current chunk value or 0 if not set
    const currentChunk = this._bitArray[chunkIndex] || 0;
    
    // Check if bit is set
    return (currentChunk & bitValue) !== 0;
  }

  /**
   * Merge another Bloom Filter into this one
   * @param {BloomFilter} otherFilter - Filter to merge
   */
  merge(otherFilter) {
    if (!(otherFilter instanceof BloomFilter)) {
      throw new Error('Cannot merge with non-BloomFilter object');
    }

    // Merge bit arrays
    for (const chunkIndex in otherFilter._bitArray) {
      if (otherFilter._bitArray.hasOwnProperty(chunkIndex)) {
        const currentChunk = this._bitArray[chunkIndex] || 0;
        this._bitArray[chunkIndex] = currentChunk | otherFilter._bitArray[chunkIndex];
      }
    }
  }

  /**
   * Serialize the Bloom Filter to JSON
   * @returns {object} JSON representation
   */
  toJSON() {
    return {
      id: this._id,
      sizeInBits: this._sizeInBits,
      hashCount: this._hashCount,
      expectedItems: this.expectedItems,
      falsePositiveRate: this.falsePositiveRate,
      bitArray: this._bitArray,
      timestamp: Date.now()
    };
  }

  /**
   * Deserialize a Bloom Filter from JSON
   * @param {object} json - JSON representation
   * @returns {BloomFilter} Deserialized Bloom Filter
   */
  static fromJSON(json) {
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid JSON for BloomFilter deserialization');
    }

    const expectedItems = json.expectedItems || 100;
    const falsePositiveRate = json.falsePositiveRate || 0.01;
    const filter = new BloomFilter(expectedItems, falsePositiveRate);
    filter._id = json.id || filter._id;
    if (json.sizeInBits) filter._sizeInBits = json.sizeInBits;
    if (json.hashCount) filter._hashCount = json.hashCount;
    filter._bitArray = json.bitArray || {};
    filter._timestamp = json.timestamp || Date.now();

    return filter;
  }

  /**
   * Create a Bloom Filter from a feed list
   * @param {Array<string>} feedUrls - Array of feed URLs
   * @returns {BloomFilter} New Bloom Filter with feeds added
   */
  static fromFeedList(feedUrls) {
    if (!Array.isArray(feedUrls)) {
      throw new Error('feedUrls must be an array');
    }

    const filter = new BloomFilter(feedUrls.length);
    for (const url of feedUrls) {
      filter.add(url);
    }
    return filter;
  }

  /**
   * Get the storage key for this Bloom Filter
   * @returns {string} Storage key
   */
  getStorageKey() {
    return 'bloomFilter';
  }

  /**
   * Save the Bloom Filter to browser.storage.sync
   * @returns {Promise} Promise that resolves when saved
   */
  async saveAsync() {
    try {
      const data = this.toJSON();
      await browser.storage.sync.set({ [this.getStorageKey()]: data });
    } catch (e) {
      console.error('Error saving Bloom Filter:', e);
      // Fallback to localStorage if sync storage fails
      try {
        const data = this.toJSON();
        await browser.storage.local.set({ [this.getStorageKey()]: data });
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
      }
    }
  }

  /**
   * Load the Bloom Filter from browser.storage.sync
   * @returns {Promise<BloomFilter>} Promise that resolves with the Bloom Filter
   */
  static async loadAsync() {
    try {
      const result = await browser.storage.sync.get('bloomFilter');
      if (result.bloomFilter) {
        return BloomFilter.fromJSON(result.bloomFilter);
      }
    } catch (e) {
      console.error('Error loading from sync storage:', e);
    }

    // Fallback to localStorage
    try {
      const result = await browser.storage.local.get('bloomFilter');
      if (result.bloomFilter) {
        return BloomFilter.fromJSON(result.bloomFilter);
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }

    // Return a new empty filter if none found
    return new BloomFilter();
  }

  /**
   * Clear all entries from the Bloom Filter
   */
  clear() {
    this._bitArray = {};
  }

  /**
   * Get the bit array for merging
   * @returns {object} Bit array object
   */
  getBitArray() {
    return this._bitArray;
  }

  /**
   * Set the bit array from another filter for merging
   * @param {object} bitArray - Bit array object
   */
  setBitArray(bitArray) {
    if (!bitArray || typeof bitArray !== 'object') {
      throw new Error('Invalid bit array');
    }
    this._bitArray = bitArray;
  }
}