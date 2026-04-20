/*global browser ErrorHandler*/
'use strict';

/**
 * Cross-Window Lock Manager for Drop-Feeds
 * 
 * This module provides distributed locking functionality across browser windows
 * to ensure only one instance can perform feed updates at a time.
 */
class FeedUpdateLockManager { /*exported FeedUpdateLockManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._lockKey = 'dropfeeds-feedUpdateLock';
    this._lockTimeout = 30000; // 30 seconds
    this._refreshInterval = 5000; // 5 seconds
    // Hard cap on how long a single acquisition can keep refreshing. Stops
    // runaway/stuck feed updates from holding the lock forever. After this,
    // the heartbeat stops and the normal TTL lets another window take over.
    this._maxHoldMs = 90000; // 90 seconds — worst-case block: 90s + 30s TTL.
    this._lockId = null;
    this._acquiredAt = 0;
    this._refreshTimer = null;
    this._lockListeners = [];
    this._isLocked = false;
    this._storageChangeListener = null;
    // Single-flight guard: prevents concurrent acquireLock_async calls from
    // the same instance from racing and orphaning the stored lock.
    this._acquireInFlight = null;
    
    // Listen for storage changes to detect lock status changes
    this._storageChangeListener = (changes, areaName) => {
      if (areaName === 'local' && this._lockKey in changes) {
        this._onLockStorageChanged(changes[this._lockKey]);
      }
    };
    browser.storage.onChanged.addListener(this._storageChangeListener);
  }

  /**
   * Clear any existing lock from storage unconditionally.
   * Safe to call at background startup where no window can legitimately
   * still hold a lock from a prior browser session.
   * @returns {Promise<void>}
   */
  async clearStaleLock_async() {
    try {
      await browser.storage.local.remove(this._lockKey);
    } catch (e) {
      ErrorHandler.logError('FeedUpdateLockManager.clearStaleLock_async', e);
    }
  }

  /**
   * Acquire a lock for feed updating
   * @returns {Promise<boolean>} True if lock was acquired, false otherwise
   */
  async acquireLock_async() {
    // Single-flight: coalesce concurrent calls so we never overwrite our own
    // in-flight _lockId and orphan the stored lock.
    if (this._acquireInFlight) {
      return this._acquireInFlight;
    }
    this._acquireInFlight = this._acquireLockInner_async();
    try {
      return await this._acquireInFlight;
    } finally {
      this._acquireInFlight = null;
    }
  }

  async _acquireLockInner_async() {
    // Re-entrancy: if we already hold the lock, verify with storage and
    // return true if still ours — do NOT generate a new lockId.
    if (this._isLocked && this._lockId) {
      try {
        const r = await browser.storage.local.get(this._lockKey);
        if (r[this._lockKey] && r[this._lockKey].lockId === this._lockId) {
          return true;
        }
      } catch (e) {
        ErrorHandler.logError('FeedUpdateLockManager._acquireLockInner_async (reentrancy check)', e);
      }
      // Lost the lock (expired, stolen, or storage cleared). Reset state
      // and fall through to a fresh acquisition.
      this._resetLockState();
    }

    // Generate unique lock ID in a local, then commit to `this._lockId` only
    // on successful acquisition. Avoids orphaning if the attempt fails.
    const candidateId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const result = await browser.storage.local.get(this._lockKey);

      if (!result[this._lockKey] || this._isLockExpired(result[this._lockKey])) {
        // Lock appears available — write our claim
        await browser.storage.local.set({
          [this._lockKey]: {
            lockId: candidateId,
            timestamp: Date.now(),
            expiresAt: Date.now() + this._lockTimeout
          }
        });

        // Verify we actually hold the lock (mitigates TOCTOU race)
        const verify = await browser.storage.local.get(this._lockKey);
        if (!verify[this._lockKey] || verify[this._lockKey].lockId !== candidateId) {
          // Another window won the race; do not clobber our state.
          return false;
        }

        this._lockId = candidateId;
        this._isLocked = true;
        this._acquiredAt = Date.now();
        this._startRefreshTimer();
        this._notifyLockAcquired();
        return true;
      } else {
        // Lock is held by another window
        return false;
      }
    } catch (e) {
      ErrorHandler.logError('FeedUpdateLockManager._acquireLockInner_async', e);
      return false;
    }
  }

  _resetLockState() {
    this._isLocked = false;
    this._lockId = null;
    this._acquiredAt = 0;
    this._stopRefreshTimer();
  }

  /**
   * Release the current lock
   * @returns {Promise<void>}
   */
  async releaseLock_async() {
    if (!this._isLocked || !this._lockId) {
      return;
    }
    
    try {
      // Verify we still hold the lock before releasing
      const result = await browser.storage.local.get(this._lockKey);
      const lockData = result[this._lockKey];
      
      if (lockData && lockData.lockId === this._lockId) {
        // Only release if we still hold the lock
        await browser.storage.local.remove(this._lockKey);
      }

      const releasedLockId = this._lockId;
      this._resetLockState();
      this._notifyLockReleased(releasedLockId);
    } catch (e) {
      ErrorHandler.logError('FeedUpdateLockManager.releaseLock_async', e);
      // Still reset local state on error so future acquires aren't blocked.
      this._resetLockState();
    }
  }

  /**
   * Check if the current window holds the lock
   * @returns {boolean}
   */
  async isLockHeld_async() {
    if (!this._isLocked || !this._lockId) {
      return false;
    }
    
    try {
      const result = await browser.storage.local.get(this._lockKey);
      const lockData = result[this._lockKey];
      return lockData && lockData.lockId === this._lockId;
    } catch (e) {
      ErrorHandler.logError('FeedUpdateLockManager.isLockHeld_async', e);
      return false;
    }
  }

  /**
   * Subscribe to lock status changes
   * @param {Function} callback - Function to call when lock status changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this._lockListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this._lockListeners = this._lockListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Check if a lock is expired
   * @param {object} lockData - Lock data object
   * @returns {boolean}
   */
  _isLockExpired(lockData) {
    // Validate lockData structure
    if (!lockData || typeof lockData !== 'object') {
      return true;
    }
    
    // Validate expiresAt is a valid number
    if (!lockData.expiresAt || typeof lockData.expiresAt !== 'number' || isNaN(lockData.expiresAt)) {
      return true;
    }
    
    // Check if lock has expired
    return Date.now() > lockData.expiresAt;
  }

  /**
   * Handle storage changes for lock key
   * @param {object} change - Storage change object
   */
  _onLockStorageChanged(change) {
    const newLockData = change.newValue;
    const oldLockData = change.oldValue;

    // Check if we held the lock and lost it
    if (oldLockData && oldLockData.lockId === this._lockId && !newLockData) {
      const lostLockId = this._lockId;
      this._resetLockState();
      this._notifyLockReleased(lostLockId);
      return;
    }

    // Another window released its lock (cleared storage) — notify so UIs can clear.
    if (!newLockData && oldLockData) {
      this._notifyLockReleasedByOther(oldLockData.lockId);
      return;
    }

    // Check if another window acquired the lock.
    if (newLockData && newLockData.lockId !== this._lockId) {
      // If we thought we held the lock but someone else now does, we've been
      // replaced (our refresh stopped due to max-hold, or we were evicted).
      // Reset local state so we don't keep refreshing a lock we no longer own.
      if (this._isLocked) {
        this._resetLockState();
      }
      this._notifyLockAcquiredByOther(newLockData.lockId);
    }
  }

  /**
   * Start the refresh timer to extend lock expiration
   */
  _startRefreshTimer() {
    // Stop any existing timer first to prevent accumulation
    this._stopRefreshTimer();
    
    // Only start a new timer if we actually hold a lock
    if (!this._isLocked || !this._lockId) {
      return;
    }
    
    this._refreshTimer = setInterval(async () => {
      try {
        if (this._isLocked && this._lockId) {
          // Enforce hard cap on lock hold time — if the holder has been
          // "working" for too long (e.g., stuck feed fetch), stop refreshing
          // so the TTL expires and another window can take over.
          if (this._acquiredAt && (Date.now() - this._acquiredAt) > this._maxHoldMs) {
            this._stopRefreshTimer();
            return;
          }

          const result = await browser.storage.local.get(this._lockKey);
          const lockData = result[this._lockKey];

          if (lockData && lockData.lockId === this._lockId) {
            // Extend lock expiration
            await browser.storage.local.set({
              [this._lockKey]: {
                lockId: this._lockId,
                timestamp: Date.now(),
                expiresAt: Date.now() + this._lockTimeout
              }
            });
          } else if (!lockData || lockData.lockId !== this._lockId) {
            // We no longer hold the lock, stop the timer
            const lostLockId = this._lockId;
            this._resetLockState();
            this._notifyLockReleased(lostLockId);
          }
        } else {
          // No longer holding lock, stop the timer
          this._stopRefreshTimer();
        }
      } catch (e) {
        ErrorHandler.logError('FeedUpdateLockManager._startRefreshTimer', e);
        // Stop timer on error to prevent infinite error loops
        this._stopRefreshTimer();
      }
    }, this._refreshInterval);
  }

  /**
   * Stop the refresh timer
   */
  _stopRefreshTimer() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  /**
   * Notify listeners that lock was acquired
   */
  _notifyLockAcquired() {
    this._lockListeners.forEach(callback => {
      try {
        callback({ type: 'feedUpdateLockStatusChange', status: 'acquired', lockId: this._lockId });
      } catch (e) {
        ErrorHandler.logError('FeedUpdateLockManager._notifyLockAcquired', e);
      }
    });
  }

  /**
   * Notify listeners that lock was released
   * @param {string} [lockId] - The lockId that was released (may have been cleared from state already)
   */
  _notifyLockReleased(lockId) {
    const id = (typeof lockId !== 'undefined') ? lockId : this._lockId;
    this._lockListeners.forEach(callback => {
      try {
        callback({ type: 'feedUpdateLockStatusChange', status: 'released', lockId: id });
      } catch (e) {
        ErrorHandler.logError('FeedUpdateLockManager._notifyLockReleased', e);
      }
    });
  }

  /**
   * Notify listeners that lock was acquired by another window
   * @param {string} lockId - The lockId that was just acquired
   */
  _notifyLockAcquiredByOther(lockId) {
    this._lockListeners.forEach(callback => {
      try {
        callback({ type: 'feedUpdateLockStatusChange', status: 'acquiredByOther', lockId: lockId });
      } catch (e) {
        ErrorHandler.logError('FeedUpdateLockManager._notifyLockAcquiredByOther', e);
      }
    });
  }

  /**
   * Notify listeners that the lock was released by another window
   * @param {string} lockId - The lockId that was just released
   */
  _notifyLockReleasedByOther(lockId) {
    this._lockListeners.forEach(callback => {
      try {
        callback({ type: 'feedUpdateLockStatusChange', status: 'releasedByOther', lockId: lockId });
      } catch (e) {
        ErrorHandler.logError('FeedUpdateLockManager._notifyLockReleasedByOther', e);
      }
    });
  }
  
  /**
   * Unsubscribe from lock status changes
   * @param {Function} callback - Function to unsubscribe
   */
  unsubscribe(callback) {
    this._lockListeners = this._lockListeners.filter(cb => cb !== callback);
  }
  
  /**
   * Cleanup resources when the component is no longer needed
   */
  cleanup() {
    // Stop refresh timer
    this._stopRefreshTimer();
    
    // Remove storage listener
    if (this._storageChangeListener) {
      browser.storage.onChanged.removeListener(this._storageChangeListener);
      this._storageChangeListener = null;
    }
    
    // Clear listeners
    this._lockListeners = [];
    
    // Reset state
    this._isLocked = false;
    this._lockId = null;
  }
}

// Export for use in other modules
/*exported FeedUpdateLockManager*/
