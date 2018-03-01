/*global browser*/
'use strict';
class localStorageManager { /*exported localStorageManager*/

  static async clean() {
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
      value  = storedValue;
    }
    return value;
  }

  static async setValue_async(valueName, value) {
    await browser.storage.local.set({[valueName]: value});
  }
}