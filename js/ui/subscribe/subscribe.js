/*global browser FolderTreeView LocalStorageManager NewFolderDialog*/
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
      let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
      this._feedTitle = tabInfos[0].title;
      this._feedUrl = tabInfos[0].url;
    }
    FolderTreeView.instance.load_async();
    NewFolderDialog.instance.init_async();
    document.getElementById('inputName').value = this._feedTitle;
    document.getElementById('newFolderButton').addEventListener('click', Subscribe._newFolderButtonClicked_event);
    document.getElementById('cancelButton').addEventListener('click', Subscribe._cancelButtonClicked_event);
    document.getElementById('subscribeButton').addEventListener('click', Subscribe._subscribeButtonClicked_event);
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