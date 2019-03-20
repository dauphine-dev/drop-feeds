/*global browser FolderTreeView LocalStorageManager FeedsNewFolderDialog Feed CssManager SecurityFilters DefaultValues*/
'use strict';
class Subscribe {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._feedTitles = [];
    this._feedUrls = [];
    this._subscribeInfoWinId = null;
    this._feedTitleUpdatingAborted = false;
    this._feeds = [];
    this._updateFeedTitleButtonEnabled = true;
    this._stopUpdatingFeedTitleButtonEnabled = false;
    CssManager.setElementEnableById('updateFeedTitleButton', this._updateFeedTitleButtonEnabled);
    CssManager.setElementEnableById('stopUpdatingFeedTitleButton', this._stopUpdatingFeedTitleButtonEnabled);
    window.addEventListener('resize', (e) => { this._windowOnResize_event(e); });
    let loadingMessage = browser.i18n.getMessage('subLoading');
    let urlLoading = URL.createObjectURL(new Blob([loadingMessage]));
    document.getElementById('feedPreview').setAttribute('src', urlLoading);
    SecurityFilters.instance;
    document.getElementById('updateFeedTitleButton').addEventListener('click', (e) => { this._updateFeedTitleButtonClicked_event(e); });
    document.getElementById('stopUpdatingFeedTitleButton').addEventListener('click', (e) => { this.stopUpdatingFeedTitleButtonClicked_event(e); });
    document.getElementById('newFolderButton').addEventListener('click', (e) => { this._newFolderButtonClicked_event(e); });
    document.getElementById('cancelButton').addEventListener('click', (e) => { this._cancelButtonClicked_event(e); });
    document.getElementById('subscribeButton').addEventListener('click', (e) => { this._subscribeButtonClicked_event(e); });
    document.getElementById('chkShowFeedPreview').addEventListener('click', (e) => { this._chkShowFeedPreviewClicked_event(e); });
    document.getElementById('chkShowFeedPreview').addEventListener('click', (e) => { this._chkShowFeedPreviewClicked_event(e); });
    this._updateLocalizedStrings();
    this._setFeedPreviewVisibility_async();
    this._setSubscribeInfoWinId_async();
    FeedsNewFolderDialog.instance.init_async();
  }

  async init_async() {
    await FolderTreeView.instance.init_async();
    await FolderTreeView.instance.load_async();
    let subscribeInfo = await LocalStorageManager.getValue_async('subscribeInfo');
    if (subscribeInfo) {
      if (Array.isArray(subscribeInfo.feedTitle)) {
        this._feedTitles = subscribeInfo.feedTitle;
      }
      else {
        this._feedTitles.push(subscribeInfo.feedTitle);
      }
      if (Array.isArray(subscribeInfo.feedUrl)) {
        this._feedUrls = subscribeInfo.feedUrl;
      }
      else {
        this._feedUrls.push(subscribeInfo.feedUrl);
      }
    }
    for (let url of this._feedUrls) {
      this._feeds.push(await Feed.newByUrl(url));
    }
    await this._setFeedTitle_async();
    await this._updateFeedPreview_async();
  }

  async _setFeedTitle_async() {
    if (this._feedTitles.length == 1 /*&& this._feedTitles[0] == ''*/) {
      await this._updateFeedTitle_async();
    }
    else {
      document.getElementById('inputName').value = this._getTitleList(this._feedTitles);
    }
  }

  _getTitleList(feedTitles) {
    let titleList = '';
    for (let title of feedTitles) {
      titleList += title + '; ';
    }
    titleList = titleList.substring(0, Math.max(titleList.length - 2, 0));
    return titleList;
  }

  _setTitleList(feeds) {
    let feedTitles = [];
    for (let feed of feeds) {
      feedTitles.push(feed.title);
    }
    return feedTitles;
  }

  async _setFeedPreviewVisibility_async() {
    let showFeedPreview = await LocalStorageManager.getValue_async('showFeedPreview', DefaultValues.showFeedPreview);
    document.getElementById('chkShowFeedPreview').checked = showFeedPreview;
    await this._updateFeedPreviewVisibility_async(showFeedPreview);
  }

  async _setSubscribeInfoWinId_async() {
    try {
      this._subscribeInfoWinId = (await LocalStorageManager.getValue_async('subscribeInfoWinId')).winId;
    } catch (e) { }
    await LocalStorageManager.setValue_async('subscribeInfoWinId', null);
  }

  _updateLocalizedStrings() {
    document.title = browser.i18n.getMessage('subDropFeedsSubscribe');
    document.getElementById('title').textContent = browser.i18n.getMessage('subSubscribeWithDropFeed');
    document.getElementById('labelName').textContent = browser.i18n.getMessage('subName') + ': ';
    document.getElementById('updateFeedTitleButton').setAttribute('title', browser.i18n.getMessage('subUpdateFeedTitleButton'));
    document.getElementById('stopUpdatingFeedTitleButton').setAttribute('title', browser.i18n.getMessage('subStopUpdatingFeedTitleButton'));
    document.getElementById('labelFolder').textContent = browser.i18n.getMessage('subFolder') + ': ';
    document.getElementById('newFolderButton').textContent = browser.i18n.getMessage('subNewFolder');
    document.getElementById('windowCloseError').textContent = browser.i18n.getMessage('subWindowCloseError');
    document.getElementById('cancelButton').textContent = browser.i18n.getMessage('subCancel');
    document.getElementById('subscribeButton').textContent = browser.i18n.getMessage('subSubscribe');
    document.getElementById('textShowFeedPreview').textContent = browser.i18n.getMessage('subShowFeedPreview');
    document.getElementById('newFolderButtonDialog').textContent = browser.i18n.getMessage('subNewFolder');
    document.getElementById('cancelNewFolderButton').textContent = browser.i18n.getMessage('subCancel');
    document.getElementById('createNewFolderButton').textContent = browser.i18n.getMessage('subCreate');
    document.getElementById('inputNewFolder').value = browser.i18n.getMessage('subNewFolder');
  }

  async _updateFeedPreview_async() {
    let feedHtmlUrl = '';
    if (this._feeds.length == 1) {
      await this._feeds[0].update_async();
      feedHtmlUrl = await this._feeds[0].getDocUrl_async();
    }
    else {
      let unifiedFeedItems = [];
      for (let feed of this._feeds) {
        await feed.update_async();
        let itemList = (await feed.getInfo_async()).itemList;
        if (itemList) { unifiedFeedItems.push(...(itemList)); }
      }
      feedHtmlUrl = await Feed.getUnifiedDocUrl_async(unifiedFeedItems, 'Merged preview (' + this._getTitleList(this._feedTitles) + ')');
    }
    document.getElementById('feedPreview').setAttribute('src', feedHtmlUrl);
  }

  async _updateFeedTitle_async() {
    if (!this._updateFeedTitleButtonEnabled) { return; }
    this._feedTitleUpdatingAborted = false;
    this._updateFeedTitleButtonEnabled = false;
    CssManager.setElementEnableById('updateFeedTitleButton', this._updateFeedTitleButtonEnabled);
    this._stopUpdatingFeedTitleButtonEnabled = true;
    CssManager.setElementEnableById('stopUpdatingFeedTitleButton', this._stopUpdatingFeedTitleButtonEnabled);
    document.getElementById('inputName').disabled = true;
    document.getElementById('inputName').value = browser.i18n.getMessage('subUpdatingFeedTitlePlsWait');
    for (let feed of this._feeds) {
      await feed.updateTitle_async();
    }
    if (!this._feedTitleUpdatingAborted) {
      this._feedTitles =this._setTitleList(this._feeds);
      document.getElementById('inputName').value = this._getTitleList(this._feedTitles);
      document.getElementById('inputName').disabled = false;
      this._updateFeedTitleButtonEnabled = true;
      CssManager.setElementEnableById('updateFeedTitleButton', this._updateFeedTitleButtonEnabled);
      this._stopUpdatingFeedTitleButtonEnabled = false;
      CssManager.setElementEnableById('stopUpdatingFeedTitleButton', this._stopUpdatingFeedTitleButtonEnabled);
    }
  }

  async _stopUpdatingFeedTitle_async() {
    if (!this._stopUpdatingFeedTitleButtonEnabled) { return; }
    this._feedTitleUpdatingAborted = true;
    document.getElementById('inputName').value = this._getTitleList(this._feedTitles);
    document.getElementById('inputName').disabled = false;
    this._updateFeedTitleButtonEnabled = true;
    CssManager.setElementEnableById('updateFeedTitleButton', this._updateFeedTitleButtonEnabled);
    this._stopUpdatingFeedTitleButtonEnabled = false;
    CssManager.setElementEnableById('stopUpdatingFeedTitleButton', this._stopUpdatingFeedTitleButtonEnabled);
  }

  async _updateFeedTitleButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    await this._updateFeedTitle_async();
  }

  async stopUpdatingFeedTitleButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    await this._stopUpdatingFeedTitle_async();
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
      let names = document.getElementById('inputName').value.split(';');
      let i = 0;
      let j = 1;
      for (let url of this._feedUrls) {
        let title = '';
        try { title = names[i++].trim(); }
        catch (e) { title = 'undefined' + j++; }
        await browser.bookmarks.create({ parentId: FolderTreeView.instance.selectedId, title: title, url: url });
      }
    }
    catch (e) {
      /* eslint-disable no-console */
      console.error(e);
      /* eslint-enable no-console */
    }
    await this._windowClose_async();
  }

  async _chkShowFeedPreviewClicked_event() {
    let showFeedPreview = document.getElementById('chkShowFeedPreview').checked;
    await this._updateFeedPreviewVisibility_async(showFeedPreview);
  }

  async _updateFeedPreviewVisibility_async(showFeedPreview) {
    await LocalStorageManager.setValue_async('showFeedPreview', showFeedPreview);
    if (showFeedPreview) {
      document.getElementById('feedPreview').classList.remove('hide');
      this._windowOnResize_event();
    }
    else {
      document.getElementById('feedPreview').classList.add('hide');
    }
  }

  async _windowClose_async() {
    await LocalStorageManager.setValue_async('subscribeInfo', null);
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

  async _windowOnResize_event() {
    let rec = document.getElementById('feedPreview').getBoundingClientRect();
    let height = Math.max(window.innerHeight - rec.top - 10, 0);
    document.getElementById('feedPreview').style.height = height + 'px';
  }
}
Subscribe.instance.init_async();