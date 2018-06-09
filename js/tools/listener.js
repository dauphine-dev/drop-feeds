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
    browser.storage.onChanged.addListener(Listener._storageChanged_event);
    browser.runtime.onMessage.addListener(Listener._runtimeOnMessage_event);
    browser.bookmarks.onCreated.addListener(Listener._bookmarkOnCreated_event);
    browser.bookmarks.onRemoved.addListener(Listener._bookmarkOnRemoved_event);
    browser.bookmarks.onChanged.addListener(Listener._bookmarkOnChanged_event);
    browser.bookmarks.onMoved.addListener(Listener._bookmarkOnMoved_event);
  }

  subscribe(provider, key, callback, fireOnSubscribe) {
    let subscriberList = this._getSubscriberList(provider);
    subscriberList.push([key, callback]);
    if (fireOnSubscribe) {
      Listener._fire(provider, key, callback);
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

  static async _storageChanged_event(changes) {
    let self = Listener.instance;
    let changeKeys = Object.keys(changes);

    if (self._localStorageSubscriberList.length <= changes.length) {
      for (let subscriber of self._localStorageSubscriberList) {
        if (changeKeys.includes(subscriber[_listenerFields.key])) {
          subscriber[_listenerFields.callback](changes[subscriber[_listenerFields.key]].newValue);
        }
      }
    }
    else {
      let subscriberKeyList = self._localStorageSubscriberList.map(sb => (sb[_listenerFields.key]));
      for (let chgKey in changes) {
        let chg = changes[chgKey];
        if (subscriberKeyList.includes(chgKey)) {
          let subscriberEntry = self._localStorageSubscriberList.filter(subscriber => subscriber[_listenerFields.key] == chgKey);
          subscriberEntry[_listenerFields.key][_listenerFields.callback](chg.newValue);
        }
      }
    }
  }

  static async _runtimeOnMessage_event(request) {
    let self = Listener.instance;
    let response = null;
    let subscriberKeyList = self._messageSubscriberList.map(sb => (sb[_listenerFields.key]));
    if (subscriberKeyList.includes(request.key)) {
      let subscriberEntry = self._messageSubscriberList.filter(subscriber => subscriber[_listenerFields.key] == request.key);
      subscriberEntry[_listenerFields.key][_listenerFields.callback](request.value);
    }
    return Promise.resolve(response);
  }

  static async _bookmarkOnCreated_event(id, bookmarkInfo) {
    Listener._bookmarkOnAny_event(bookmarkListeners.created, id, bookmarkInfo);
  }
  static async _bookmarkOnRemoved_event(id, removeInfo) {
    Listener._bookmarkOnAny_event(bookmarkListeners.removed, id, removeInfo);
  }
  static async _bookmarkOnChanged_event(id, changeInfo) {
    Listener._bookmarkOnAny_event(bookmarkListeners.changed, id, changeInfo);
  }
  static async _bookmarkOnMoved_event(id, moveInfo) {
    Listener._bookmarkOnAny_event(bookmarkListeners.moved, id, moveInfo);
  }
  static async _bookmarkOnChildrenReordered_event(id, reorderInfo) {
    Listener._bookmarkOnAny_event(bookmarkListeners.childrenReordered, id, reorderInfo);
  }
  static async _bookmarkImportBegan_event() {
    Listener._bookmarkOnAny_event(bookmarkListeners.importBegan, null, null);
  }
  static async _bookmarkImportEnded_event() {
    Listener._bookmarkOnAny_event(bookmarkListeners.importEnded, null, null);
  }

  static async _bookmarkOnAny_event(key, id, eventInfo) {
    let self = Listener.instance;
    let subscriberKeyList = self._localStorageSubscriberList.map(sb => (sb[0]));
    if (subscriberKeyList.includes(key)) {
      let subscriberEntry = self._localStorageSubscriberList.filter(subscriber => subscriber[_listenerFields.key] == key);
      subscriberEntry[_listenerFields.key][_listenerFields.callback](id, eventInfo);
    }
  }
}
