/*global browser, localStorageManager*/
'use strict';
class commonValues { /*exported commonValues*/
  static get instance() {
    if (!this._instance) {
      this._instance = new commonValues();
    }
    return this._instance;
  }

  constructor() {
    this._alwaysOpenNewTab = true;
    this._openNewTabForeground = true;
    this._timeOut= 10;
    this._displayRootFolder = true;
    this._rootBookmarkId = undefined;
    this._subscribeHtmlUrl = '/html/subscribe.html';

  }

  async init_async() {
    await this.reload_async();
    browser.storage.onChanged.addListener((changes, area) => { this._storageChanged_event(this, changes, area); });
  }

  async reload_async() {
    this._alwaysOpenNewTab = await localStorageManager.getValue_async('alwaysOpenNewTab', this.alwaysOpenNewTab);
    this._openNewTabForeground = await localStorageManager.getValue_async('openNewTabForeground', this._openNewTabForeground);
    this._timeOut = await localStorageManager.getValue_async('timeOut', this._timeOut);
    if (this._timeOut < 1 || this._timeOut >= 100) { this._timeOut = 10; }
    this._displayRootFolder = await localStorageManager.getValue_async('displayRootFolder', this._displayRootFolder);
    if (this._displayRootFolder == 'yes') { this._displayRootFolder = true; }
    this._rootBookmarkId = await localStorageManager.getValue_async('rootBookmarkId', this._rootBookmarkId);
  }

  _storageChanged_event(self, changes) {
    //listen for values changed from another instance
    let changedItems = Object.keys(changes);
    if (changedItems.includes('alwaysOpenNewTab')) {
      let change =  changes['alwaysOpenNewTab'];
      if (change.newValue != change.oldValue) {
        self._alwaysOpenNewTab = change.newValue;
      }
    }
    if (changedItems.includes('openNewTabForeground')) {
      let change =  changes['openNewTabForeground'];
      if (change.newValue != change.oldValue) {
        self._openNewTabForeground = change.newValue;
      }
    }
    if (changedItems.includes('timeOut')) {
      let change =  changes['timeOut'];
      if (change.newValue != change.oldValue) {
        self._timeOut = change.newValue;
      }
    }
    if (changedItems.includes('displayRootFolder')) {
      let change =  changes['displayRootFolder'];
      if (change.newValue != change.oldValue) {
        self._displayRootFolder = change.newValue;
      }
    }
    if (changedItems.includes('rootBookmarkId')) {
      let change =  changes['rootBookmarkId'];
      if (change.newValue != change.oldValue) {
        self._rootBookmarkId = change.newValue;
      }
    }
  }

  get alwaysOpenNewTab() {
    return this._alwaysOpenNewTab;
  }
  set alwaysOpenNewTab(value) {
    this._alwaysOpenNewTab = value; //change value in local instance
    localStorageManager.setValue_async('alwaysOpenNewTab', value); //change value in all instances
  }

  get openNewTabForeground() {
    return this._openNewTabForeground;
  }
  set openNewTabForeground(value) {
    this._openNewTabForeground = value;
    localStorageManager.setValue_async('openNewTabForeground', value);
  }

  get timeOut() {
    return this._timeOut;
  }
  set timeOut(value) {
    this._timeOut = value;
    localStorageManager.setValue_async('timeOut', this._timeOut);
  }

  get displayRootFolder() {
    return this._displayRootFolder;
  }
  set displayRootFolder(value) {
    this._displayRootFolder = value;
    localStorageManager.setValue_async('displayRootFolder', value);
  }

  get rootBookmarkId() {
    return this._rootBookmarkId;
  }
  set rootBookmarkId(value) {
    this._rootBookmarkId = value;
    localStorageManager.setValue_async('rootBookmarkId', value);
  }

  get subscribeHtmlUrl() {
    return this._subscribeHtmlUrl;
  }
}
//----------------------------------------------------------------------
