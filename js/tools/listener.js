/*global browser LocalStorageManager*/
'use strict';
const ListenerProviders = {
  localStorage: 'localStorage',
  message: 'message',
  bookmarks: 'bookmarks'
};

const bookmarkListeners =  {
  created: 'created',
  removed: 'removed',
  changed: 'changed',
  moved: 'moved',
  childrenReordered: 'childrenReordered',
  importBegan: 'importBegan',
  importEnded: 'importEnded'
};

const _listenerFields = {
  key: 0,
  callback: 1
};

class Listener { /*exported Listener*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._localStorageSubscriberList = [];
    this._messageSubscriberList = [];
    this._bookmarksSubscriberList = [];
    browser.storage.onChanged.addListener((e) => { this._storageChanged_event(e); });
    browser.runtime.onMessage.addListener((e) => { this._runtimeOnMessage_event(e); });
    browser.bookmarks.onCreated.addListener((id, info) => { this._bookmarkOnCreated_event(id, info); });
    browser.bookmarks.onRemoved.addListener((id, info) => { this._bookmarkOnRemoved_event(id, info); });
    browser.bookmarks.onChanged.addListener((id, info) => { this._bookmarkOnChanged_event(id, info); });
    browser.bookmarks.onMoved.addListener((id, info) => { this._bookmarkOnMoved_event(id, info); });
  }

  subscribe(provider, key, callback, fireOnSubscribe) {
    let subscriberList = this._getSubscriberList(provider);
    subscriberList.push([key, callback]);
    if (fireOnSubscribe) {
      this._fire(provider, key, callback);
    }
  }

  unsubscribe(provider, key) {
    /*eslint-disable no-unused-vars*/
    let subscriberList = this._getSubscriberList(provider);
    subscriberList = subscriberList.filter(subscriber => subscriber[_listenerFields.key] !== key);
    /*eslint-enable no-unused-vars*/
  }

  _getSubscriberList(provider) {
    let subscriberList = null;
    switch(provider) {
      case ListenerProviders.localStorage:
        subscriberList = this._localStorageSubscriberList;
        break;
      case ListenerProviders.message:
        subscriberList = this._messageSubscriberList;
        break;
      case ListenerProviders.bookmarks:
        subscriberList = this._bookmarksSubscriberList;
        break;
    }
    return subscriberList;
  }

  _fire(provider, key, callback) {
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

  async _storageChanged_event(changes) {
    let changeKeys = Object.keys(changes);

    if (this._localStorageSubscriberList.length <= changes.length) {
      for (let subscriber of this._localStorageSubscriberList) {
        if (changeKeys.includes(subscriber[_listenerFields.key])) {
          subscriber[_listenerFields.callback](changes[subscriber[_listenerFields.key]].newValue);
        }
      }
    }
    else {
      let subscriberKeyList = this._localStorageSubscriberList.map(sb => (sb[_listenerFields.key]));
      for (let chgKey in changes) {
        let chg = changes[chgKey];
        if (subscriberKeyList.includes(chgKey)) {
          let subscriberEntry = this._localStorageSubscriberList.filter(subscriber => subscriber[_listenerFields.key] == chgKey);
          subscriberEntry[_listenerFields.key][_listenerFields.callback](chg.newValue);
        }
      }
    }
  }

  async _runtimeOnMessage_event(request) {
    let response = null;
    let subscriberKeyList = this._messageSubscriberList.map(sb => (sb[_listenerFields.key]));
    if (subscriberKeyList.includes(request.key)) {
      let subscriberEntry = this._messageSubscriberList.filter(subscriber => subscriber[_listenerFields.key] == request.key);
      subscriberEntry[_listenerFields.key][_listenerFields.callback](request.value);
    }
    return Promise.resolve(response);
  }

  async _bookmarkOnCreated_event(id, bookmarkInfo) {
    this._bookmarkOnAny_event(bookmarkListeners.created, id, bookmarkInfo);
  }
  async _bookmarkOnRemoved_event(id, removeInfo) {
    this._bookmarkOnAny_event(bookmarkListeners.removed, id, removeInfo);
  }
  async _bookmarkOnChanged_event(id, changeInfo) {
    this._bookmarkOnAny_event(bookmarkListeners.changed, id, changeInfo);
  }
  async _bookmarkOnMoved_event(id, moveInfo) {
    this._bookmarkOnAny_event(bookmarkListeners.moved, id, moveInfo);
  }
  async _bookmarkOnChildrenReordered_event(id, reorderInfo) {
    this._bookmarkOnAny_event(bookmarkListeners.childrenReordered, id, reorderInfo);
  }
  async _bookmarkImportBegan_event() {
    this._bookmarkOnAny_event(bookmarkListeners.importBegan, null, null);
  }
  async _bookmarkImportEnded_event() {
    this._bookmarkOnAny_event(bookmarkListeners.importEnded, null, null);
  }

  async _bookmarkOnAny_event(key, id, eventInfo) {
    let subscriberKeyList = this._localStorageSubscriberList.map(sb => (sb[0]));
    if (subscriberKeyList.includes(key)) {
      let subscriberEntry = this._localStorageSubscriberList.filter(subscriber => subscriber[_listenerFields.key] == key);
      subscriberEntry[_listenerFields.key][_listenerFields.callback](id, eventInfo);
    }
  }
}
