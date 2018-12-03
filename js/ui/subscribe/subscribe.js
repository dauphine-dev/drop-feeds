/*global browser FolderTreeView LocalStorageManager FeedsNewFolderDialog BrowserManager Feed CssManager*/
'use strict';
class Subscribe {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._feedTitle = null;
    this._feedUrl = null;
    this._subscribeInfoWinId = null;
    this._feedTitleUpdatingAborted = false;
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
    if (this._feedTitle == '') {  
      await this._updateFeedTitle_async();
    }
    else {
      document.getElementById('inputName').value = this._feedTitle;
    }
    CssManager.setElementEnableById('updateFeedTitleButton', true);
    CssManager.setElementEnableById('stopUpdatingFeedTitleButton', false);
    document.getElementById('updateFeedTitleButton').addEventListener('click', (e) => { this._updateFeedTitleButtonClicked_event(e); });
    document.getElementById('stopUpdatingFeedTitleButton').addEventListener('click', (e) => { this.stopUpdatingFeedTitleButtonClicked_event(e); });
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

  async _updateFeedTitle_async() {
    this._feedTitleUpdatingAborted = false;
    CssManager.setElementEnableById('updateFeedTitleButton', false);
    CssManager.setElementEnableById('stopUpdatingFeedTitleButton', true);
    document.getElementById('inputName').disabled = true;
    document.getElementById('inputName').value = 'Updating feed title, please wait...';
    let feed = await Feed.newByUrl(this._feedUrl);
    await feed.updateTitle_async();
    if (!this._feedTitleUpdatingAborted) {
      this._feedTitle = feed.title;
      document.getElementById('inputName').value = this._feedTitle;
      document.getElementById('inputName').disabled = false;  
      CssManager.setElementEnableById('updateFeedTitleButton', true);
      CssManager.setElementEnableById('stopUpdatingFeedTitleButton', false);
    }
  }

  async _stopUpdatingFeedTitle_async() {
    this._feedTitleUpdatingAborted = true;
    document.getElementById('inputName').value = this._feedTitle;
    document.getElementById('inputName').disabled = false;
    CssManager.setElementEnableById('updateFeedTitleButton', true);
    CssManager.setElementEnableById('stopUpdatingFeedTitleButton', false);
}

  async _updateFeedTitleButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this._updateFeedTitle_async();
  }

  async stopUpdatingFeedTitleButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this._stopUpdatingFeedTitle_async();
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