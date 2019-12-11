/*global browser*/
'use strict';
class LocalStorageManager { /*exported LocalStorageManager*/
  static async clean_async() {
    let keysToRemove = [];
    let storageItems = await browser.storage.local.get();
    let items = Object.entries(storageItems);
    for (let [key, value] of items) {
      if (value) {
        if (value.isFeedInfo || value.isBkmrk || value.bkmrkId) {
          keysToRemove.push(key);
        } else if (value.checked) {
          keysToRemove.push(key);
        }
      }
    }
    await browser.storage.local.remove(keysToRemove);
  }

  static async getValue_async(valueName, defaultValue) {
    let value = defaultValue;
    let storedValue = (await browser.storage.local.get(valueName))[valueName];
    if (typeof storedValue != 'undefined') {
      value = storedValue;
    }
    return value;
  }

  static async setValue_async(valueName, value) {
    try {
      await browser.storage.local.set({ [valueName]: value });
    }
    catch(e) {
      // eslint-disable-next-line no-console
      console.log('Error writing to local storage:', e);
    }
  }

  static async getCache_async() {
    return await browser.storage.local.get();
  }
}
