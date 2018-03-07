/*global browser*/
'use strict';
class LocalStorageListener { /*exported LocalStorageListener*/
  static get instance() {
    if (!this._instance) {
      this._instance = new LocalStorageListener();
    }
    return this._instance;
  }

  constructor() {
    this._subscriberList = [];
    browser.storage.onChanged.addListener(this._storageChanged_event);
  }

  async _storageChanged_event(changes) {
    let self = LocalStorageListener.instance;
    let changeKeys = Object.keys(changes);

    if (self._subscriberList.length < changes.length) {
      for (let subscriber of self._subscriberList) {
        if (changeKeys.includes(subscriber[0])) {
          subscriber[1](changes[subscriber[0]].newValue);
        }
      }
    }
    else {
      let subscriberKeyList = self._subscriberList.map(sb => (sb[0]));
      for (let chgKey in changes) {
        let chg = changes[chgKey];
        if (subscriberKeyList.includes(chgKey)) {
          let subscriberEntry = self._subscriberList.filter(subscriber => subscriber[0] == chgKey);
          subscriberEntry[0][1](chg.newValue);
        }
      }
    }
  }

  subscribe(key, callback) {
    let subscriber = [key, callback];
    this._subscriberList.push(subscriber);
  }

  unsubscribe(key) {
    this._subscriberList = this._subscriberList.filter(subscriber => subscriber[0] !== key);
  }
}
