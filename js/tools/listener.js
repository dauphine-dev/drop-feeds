/*global browser LocalStorageManager*/
'use strict';
const ListenerProviders = {
  localStorage: 'localStorage',
  message: 'message'
};


const _listenerFields = {
  key: 0,
  callback: 1
};

class Listener { /*exported Listener*/
  static get instance() {
    if (!this._instance) {
      this._instance = new Listener();
    }
    return this._instance;
  }

  constructor() {
    this._localStorageSubscriberList = [];
    browser.storage.onChanged.addListener(this._storageChanged_event);
  }

  async _storageChanged_event(changes) {
    let self = Listener.instance;
    let changeKeys = Object.keys(changes);

    if (self._localStorageSubscriberList.length < changes.length) {
      for (let subscriber of self._localStorageSubscriberList) {
        if (changeKeys.includes(subscriber[_listenerFields.key])) {
          subscriber[_listenerFields.callback](changes[subscriber[_listenerFields.key]].newValue);
        }
      }
    }
    else {
      let subscriberKeyList = self._localStorageSubscriberList.map(sb => (sb[0]));
      for (let chgKey in changes) {
        let chg = changes[chgKey];
        if (subscriberKeyList.includes(chgKey)) {
          let subscriberEntry = self._localStorageSubscriberList.filter(subscriber => subscriber[0] == chgKey);
          subscriberEntry[_listenerFields.key][_listenerFields.callback](chg.newValue);
        }
      }
    }
  }

  subscribe(provider, key, callback, fireOnSubscribe) {
    let subscriberList = this._getSubscriberList(provider);
    subscriberList.push([key, callback]);
    if (fireOnSubscribe) {
      Listener._fire(provider, key, callback);
    }
  }

  unsubscribe(provider, key) {
    switch(provider) {
      case ListenerProviders.localStorage:
        this._localStorageSubscriberList = this._localStorageSubscriberList.filter(subscriber => subscriber[_listenerFields.key] !== key);
        break;
    }
  }

  _getSubscriberList(provider) {
    let subscriberList = null;
    switch(provider) {
      case ListenerProviders.localStorage:
        subscriberList = this._localStorageSubscriberList;
        break;
    }
    return subscriberList;
  }

  static _fire(provider, key, callback) {
    switch(provider) {
      case ListenerProviders.localStorage:
        LocalStorageManager.getValue_async(key, undefined).then((newValue) => {
          if (typeof newValue != 'undefined') {
            callback(newValue);
          }
        });
        break;
    }
  }
}
