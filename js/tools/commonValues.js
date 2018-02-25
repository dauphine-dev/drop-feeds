/*global browser, themeManager*/
/*global getStoredValue_async, storageLocalSetItemAsync, delay_async*/
'use strict';
//----------------------------------------------------------------------
class commonValues {
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
    this._iconDF32Url = '/resources/img/drop-feeds-32.png';
    this._iconDF96Url = '/resources/img/drop-feeds-96.png';
    this._themeBaseFolderUrl = '/resources/themes/';
    this._themesListUrl = '/resources/themes/themes.list';
    this._themeDefaultFolderName = 'dauphine';
    this._subscribeHtmlUrl = '/html/subscribe.html';

  }

  async init_async() {
    await this.reload_async();
    browser.storage.onChanged.addListener((changes, area) => { this._storageChanged_event(this, changes, area); });
  }

  async reload_async() {
    this._alwaysOpenNewTab = await getStoredValue_async('alwaysOpenNewTab', this.alwaysOpenNewTab);
    this._openNewTabForeground = await getStoredValue_async('openNewTabForeground', this._openNewTabForeground);
    this._timeOut = await getStoredValue_async('timeOut', this._timeOut);
    if (this._timeOut < 1 || this._timeOut >= 100) { this._timeOut = 10; }
    this._displayRootFolder = await getStoredValue_async('displayRootFolder', this._displayRootFolder);
    if (this._displayRootFolder == 'yes') { this._displayRootFolder = true; }
    this._rootBookmarkId = await getStoredValue_async('rootBookmarkId', this._rootBookmarkId);
  }

  _storageChanged_event(self, changes, area) {
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
    storageLocalSetItemAsync('alwaysOpenNewTab', value); //change value in all instances
  }

  get openNewTabForeground() {
    return this._openNewTabForeground;
  }
  set openNewTabForeground(value) {
    this._openNewTabForeground = value;
    storageLocalSetItemAsync('openNewTabForeground', value);
  }

  get timeOut() {
    return this._timeOut;
  }
  set timeOut(value) {
    this._timeOut = value;
    storageLocalSetItemAsync('timeOut', this._timeOut);
  }

  get displayRootFolder() {
    return this._displayRootFolder;
  }
  set displayRootFolder(value) {
    this._displayRootFolder = value;
    storageLocalSetItemAsync('displayRootFolder', value);
  }

  get rootBookmarkId() {
    return this._rootBookmarkId;
  }
  set rootBookmarkId(value) {
    this._rootBookmarkId = value;
    storageLocalSetItemAsync('rootBookmarkId', value);
  }

  get iconDF32Url() {
    return this._iconDF32Url;
  }

  get iconDF96Url() {
    return this._iconDF96Url;
  }

  get themeBaseFolderUrl() {
    return this._themeBaseFolderUrl;
  }

  get themesListUrl() {
    return this._themesListUrl;
  }

  get themeDefaultFolderName() {
    return this._themeDefaultFolderName;
  }

  get subscribeHtmlUrl() {
    return this._subscribeHtmlUrl;
  }
}
//----------------------------------------------------------------------
