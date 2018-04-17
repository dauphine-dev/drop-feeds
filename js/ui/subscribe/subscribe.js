/*global browser FolderTreeView LocalStorageManager NewFolderDialog BrowserManager*/
'use strict';
class Subscribe {

  static get instance() {
    if (!this._instance) {
      this._instance = new Subscribe();
    }
    return this._instance;
  }

  constructor() {
    this._feedTitle = null;
    this._feedUrl = null;
  }

  async init_async() {
    let subscribeInfo = await LocalStorageManager.getValue_async('subscribeInfo');
    await FolderTreeView.instance.init_async();
    if (subscribeInfo) {
      LocalStorageManager.setValue_async('subscribeInfo', null);
      this._feedTitle = subscribeInfo.feedTitle;
      this._feedUrl = subscribeInfo.feedUrl;
    }
    else {
      let tabInfo = await BrowserManager.getActiveTab_async();
      this._feedTitle = tabInfo.title;
      this._feedUrl = tabInfo.url;
    }
    FolderTreeView.instance.load_async();
    NewFolderDialog.instance.init_async();
    this._updateLocalizedStrings();
    document.getElementById('inputName').value = this._feedTitle;
    document.getElementById('newFolderButton').addEventListener('click', Subscribe._newFolderButtonClicked_event);
    document.getElementById('cancelButton').addEventListener('click', Subscribe._cancelButtonClicked_event);
    document.getElementById('subscribeButton').addEventListener('click', Subscribe._subscribeButtonClicked_event);
  }

  _updateLocalizedStrings() {
    document.title = browser.i18n.getMessage('subDropFeedsSubscribe');
    document.getElementById('title').textContent = browser.i18n.getMessage('subSubscribeWithDropFeed');
    document.getElementById('labelName').textContent = browser.i18n.getMessage('subName') + ': ';
    document.getElementById('labelFolder').textContent = browser.i18n.getMessage('subFolder') + ': ';
    document.getElementById('newFolderButton').textContent = browser.i18n.getMessage('subNewFolder');
    document.getElementById('cancelButton').textContent = browser.i18n.getMessage('subCancel');
    document.getElementById('subscribeButton').textContent = browser.i18n.getMessage('subSubscribe');
    document.getElementById('newFolderButtonDialog').textContent = browser.i18n.getMessage('subNewFolder');
    document.getElementById('cancelNewFolderButton').textContent = browser.i18n.getMessage('subCancel');
    document.getElementById('createNewFolderButton').textContent = browser.i18n.getMessage('subCreate');
    document.getElementById('inputNewFolder').value = browser.i18n.getMessage('subNewFolder');
  }

  static async _newFolderButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    NewFolderDialog.instance.show(FolderTreeView.instance.selectedId);
  }

  static async _cancelButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    window.close();
  }

  static async _subscribeButtonClicked_event() {
    let self = Subscribe.instance;
    try {
      let name = document.getElementById('inputName').value;
      await browser.bookmarks.create({parentId: FolderTreeView.instance.selectedId, title: name, url: self._feedUrl});
    }
    catch(e) {
      /* eslint-disable no-console */
      console.log(e);
      /* eslint-enable no-console */
    }
    window.close();
  }

}

Subscribe.instance.init_async();