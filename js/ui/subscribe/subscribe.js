/*global browser FolderTreeView LocalStorageManager FeedsNewFolderDialog BrowserManager*/
'use strict';
class Subscribe {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._feedTitle = null;
    this._feedUrl = null;
    this._subscribeInfoWinId = null;
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
    FeedsNewFolderDialog.instance.init_async();
    this._updateLocalizedStrings();
    document.getElementById('inputName').value = this._feedTitle;
    document.getElementById('newFolderButton').addEventListener('click', (e) => { this._newFolderButtonClicked_event(e); });
    document.getElementById('cancelButton').addEventListener('click', (e) => { this._cancelButtonClicked_event(e); });
    document.getElementById('subscribeButton').addEventListener('click', (e) => { this._subscribeButtonClicked_event(e); });
    try {
      this._subscribeInfoWinId = (await LocalStorageManager.getValue_async('subscribeInfoWinId')).winId;
    } catch (e) { }
    await LocalStorageManager.setValue_async('subscribeInfoWinId', null);
  }

  _updateLocalizedStrings() {
    document.title = browser.i18n.getMessage('subDropFeedsSubscribe');
    document.getElementById('title').textContent = browser.i18n.getMessage('subSubscribeWithDropFeed');
    document.getElementById('labelName').textContent = browser.i18n.getMessage('subName') + ': ';
    document.getElementById('labelFolder').textContent = browser.i18n.getMessage('subFolder') + ': ';
    document.getElementById('newFolderButton').textContent = browser.i18n.getMessage('subNewFolder');
    document.getElementById('windowCloseError').textContent = browser.i18n.getMessage('subWindowCloseError');
    document.getElementById('cancelButton').textContent = browser.i18n.getMessage('subCancel');
    document.getElementById('subscribeButton').textContent = browser.i18n.getMessage('subSubscribe');
    document.getElementById('newFolderButtonDialog').textContent = browser.i18n.getMessage('subNewFolder');
    document.getElementById('cancelNewFolderButton').textContent = browser.i18n.getMessage('subCancel');
    document.getElementById('createNewFolderButton').textContent = browser.i18n.getMessage('subCreate');
    document.getElementById('inputNewFolder').value = browser.i18n.getMessage('subNewFolder');
  }

  async _newFolderButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    FeedsNewFolderDialog.instance.show(FolderTreeView.instance.selectedId);
  }

  async _cancelButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    await this._windowClose_async();
  }

  async _subscribeButtonClicked_event() {
    try {
      let name = document.getElementById('inputName').value;
      await browser.bookmarks.create({ parentId: FolderTreeView.instance.selectedId, title: name, url: this._feedUrl });
    }
    catch (e) {
      /* eslint-disable no-console */
      console.log(e);
      /* eslint-enable no-console */
    }
    await this._windowClose_async();
  }

  async _windowClose_async() {
    try {
      await browser.windows.remove(this._subscribeInfoWinId);
    }
    catch (e) {
      try {
        let win = await browser.windows.getCurrent();
        await browser.windows.remove(win.id);
      }
      catch (e) {
        document.getElementById('windowCloseError').style.visibility = 'visible';
      }
    }
  }

}
Subscribe.instance.init_async();