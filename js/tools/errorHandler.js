/*global browser*/
'use strict';

/**
 * Centralized error handling for Drop-Feeds
 * 
 * This module provides consistent error handling patterns across the application.
 */

/**
 * Error handling utility
 */
const ErrorHandler = {
  /**
    * Log an error with context
    * @param {string} context - Context where the error occurred
    * @param {Error} error - Error object
    * @param {object} additionalData - Additional data to include in the log
    */
  logError(context, error, additionalData = {}) {
    if (typeof error === 'string') {
      console.error(`[${context}] ${error}`, additionalData);
    } else {
      console.error(`[${context}] ${error.message}`, {
        stack: error.stack,
        ...additionalData
      });
    }
  },

  /**
    * Handle an error with a fallback mechanism
    * @param {string} context - Context where the error occurred
    * @param {Function} operation - Operation to execute
    * @param {Function} fallback - Fallback operation if the main operation fails
    */
  async handleWithFallback_async(context, operation, fallback) {
    try {
      return await operation();
    } catch (error) {
      // Log generic error without sensitive details
      console.error(`[${context}] Operation failed, attempting fallback`);
      
      try {
        if (fallback) {
          return await fallback();
        }
      } catch (fallbackError) {
        console.error(`${context} (fallback) Failed`);
        // Include original error information in the new error
        throw new Error(`${context} failed: Unable to complete operation. Original error: ${fallbackError.message}`);
      }
    }
  },

  /**
    * Handle an error with retry logic
    * @param {string} context - Context where the error occurred
    * @param {Function} operation - Operation to execute
    * @param {number} maxRetries - Maximum number of retries
    * @param {number} delay - Delay between retries in milliseconds
    */
  async handleWithRetry_async(context, operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logError(`${context} (attempt ${i + 1}/${maxRetries})`, error);
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  },

  /**
    * Handle storage errors with fallback to local storage
    * @param {string} context - Context where the error occurred
    * @param {Function} syncOperation - Operation using sync storage
    * @param {Function} localOperation - Operation using local storage
    */
  async handleStorageError_async(context, syncOperation, localOperation) {
    try {
      return await syncOperation();
    } catch (syncError) {
      this.logError(`${context} (sync storage)`, syncError);
      
      try {
        return await localOperation();
      } catch (localError) {
        this.logError(`${context} (local storage)`, localError);
        throw syncError; // Re-throw the original error
      }
    }
  },

  /**
    * Check if an error is a storage limit error
    * @param {Error} error - Error object
    * @returns {boolean} True if it's a storage limit error
    */
  isStorageLimitError(error) {
    return error.message && 
           (error.message.includes('QUOTA_BYTES') || 
            error.message.includes('storage') || 
            error.message.includes('limit'));
  }
};

// Export for use in other modules
/*exported ErrorHandler*/