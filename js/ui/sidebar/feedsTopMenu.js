/*global browser DefaultValues LocalStorageManager CssManager FeedManager FeedsTreeView BrowserManager*/
/*global Dialogs Listener ListenerProviders TabManager FeedsFilterBar FeedsContextMenu*/
'use strict';
class FeedsTopMenu { /*exported FeedsTopMenu*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updatedFeedsVisible = DefaultValues.updatedFeedsVisible;
    this._foldersOpened = DefaultValues.foldersOpened;
    this._buttonAddFeedEnabled = false;
    this.buttonAddFeedEnabled = this._buttonAddFeedEnabled;
    this._buttonDiscoverFeedsEnabled = false;
    this.discoverFeedsButtonEnabled = this._buttonDiscoverFeedsEnabled;
    this._workInProgress = false;
    this._checkingFeedsStartTime = new Date();
    this._forceAnimateCheckFeedButton = false;
    this._filterEnabled = DefaultValues.filterEnabled;
    this._isRootFolderChecked_async();
    this._updateLocalizedStrings();
    document.getElementById('checkFeedsButton').addEventListener('click', (e) => { this.checkFeedsButtonClicked_event(e); });
    document.getElementById('discoverFeedsButton').addEventListener('click', (e) => { this._discoverFeedsButtonClicked_event(e); });
    document.getElementById('onlyUpdatedFeedsButton').addEventListener('click', (e) => { this._onlyUpdatedFeedsButtonClicked_event(e); });
    document.getElementById('toggleFoldersButton').addEventListener('click', (e) => { this._toggleFoldersButtonClicked_event(e); });
    document.getElementById('addFeedButton').addEventListener('click', (e) => { this._addFeedButtonClicked_event(e); });
    document.getElementById('filterButton').addEventListener('click', (e) => { this._filterButtonClicked_event(e); });
    document.getElementById('optionsMenuButton').addEventListener('click', (e) => { this._optionsMenuClicked_event(e); });
    Listener.instance.subscribe(ListenerProviders.localStorage, 'showErrorsAsUnread', (v) => { this.showErrorsAsUnread_sbscrb(v); }, false);
  }

  async init_async() {
    this._updatedFeedsVisible = await LocalStorageManager.getValue_async('updatedFeedsVisibility', this._updatedFeedsVisible);
    await this.updatedFeedsSetVisibility_async(false);
    this._filterEnabled = await LocalStorageManager.getValue_async('filterEnabled', this._filterEnabled);
    this._updateFilterBar();
  }

  set workInProgress(value) {
    this._workInProgress = value;
  }

  set discoverFeedsButtonEnabled(value) {
    this._buttonDiscoverFeedsEnabled = value;
    CssManager.setElementEnableById('discoverFeedsButton', value);

  }

  async setFeedButton_async(enabled, type) {
    this._buttonAddFeedEnabled = enabled;
    CssManager.setElementEnableById('addFeedButton', this._buttonAddFeedEnabled);
    let elAddFeedButton = document.getElementById('addFeedButton');
    elAddFeedButton.classList.remove('subscribeAdd');
    elAddFeedButton.classList.remove('subscribeGo');
    elAddFeedButton.classList.add('subscribe' + type);
    elAddFeedButton.setAttribute('title', browser.i18n.getMessage('sbSubscription' + type));
  }

  animateCheckFeedButton(forceAnimate) {
    this._checkingFeedsStartTime = new Date();
    this._forceAnimateCheckFeedButton = forceAnimate;
    let checkFeedsButton = document.getElementById('checkFeedsButton');
    if (FeedManager.instance.checkingFeeds || this._forceAnimateCheckFeedButton) {
      checkFeedsButton.setAttribute('title', browser.i18n.getMessage('sbStopAndRestart'));
      checkFeedsButton.classList.add('checkFeedsButtonAnim');
      checkFeedsButton.classList.remove('checkFeedsButton');
    }
    else {
      checkFeedsButton.setAttribute('title', browser.i18n.getMessage('sbCheckFeeds'));
      checkFeedsButton.classList.add('checkFeedsButton');
      checkFeedsButton.classList.remove('checkFeedsButtonAnim');
    }
  }

  activateButton(buttonId, activated) {
    let el = document.getElementById(buttonId);
    if (activated) {
      el.classList.add('topMenuItemActivated');
      el.classList.remove('topMenuItemInactivated');
    }
    else {
      el.classList.add('topMenuItemInactivated');
      el.classList.remove('topMenuItemActivated');
    }
  }

  async updatedFeedsSetVisibility_async(setValue) {
    this.activateButton('onlyUpdatedFeedsButton', this._updatedFeedsVisible);
    await FeedsTreeView.instance.updatedFeedsSetVisibility_async(this._updatedFeedsVisible);
    if (setValue) {
      await LocalStorageManager.setValue_async('updatedFeedsVisibility', this._updatedFeedsVisible);
    }
  }

  async checkFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    await FeedManager.instance.checkFeeds_async('feedsContentPanel', true);
  }

  async _updateLocalizedStrings() {
    document.getElementById('checkFeedsButton').setAttribute('title', browser.i18n.getMessage('sbCheckFeeds'));
    document.getElementById('discoverFeedsButton').setAttribute('title', browser.i18n.getMessage('sbDiscoverFeeds'));
    document.getElementById('onlyUpdatedFeedsButton').setAttribute('title', browser.i18n.getMessage('sbViewOnlyUpdatedFeeds'));
    document.getElementById('toggleFoldersButton').setAttribute('title', browser.i18n.getMessage('sbToggleFolders'));
    document.getElementById('addFeedButton').setAttribute('title', browser.i18n.getMessage('sbSubscriptionGo'));
    document.getElementById('filterButton').setAttribute('title', browser.i18n.getMessage('sbFilter'));
    document.getElementById('optionsMenuButton').setAttribute('title', browser.i18n.getMessage('sbOpenOptionsTab'));
  }

  async _isRootFolderChecked_async() {
    try {
      let rootFolderId = 'cb-' + FeedsTreeView.instance.rootFolderUiId.substring(3);
      let rootFolder = await LocalStorageManager.getValue_async(rootFolderId, DefaultValues.getStoredFolder(rootFolderId));
      this._foldersOpened = rootFolder.checked;
    } catch (e) { }
    this.activateButton('toggleFoldersButton', this._foldersOpened);
  }

  _updateFilterBar() {
    this.activateButton('filterButton', this._filterEnabled);
    FeedsFilterBar.instance.enabled = this._filterEnabled;
  }

  async _onlyUpdatedFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this._updatedFeedsVisible = !this._updatedFeedsVisible;
    await this.updatedFeedsSetVisibility_async(true);
    FeedsTreeView.instance.selectionBar.refresh();
  }

  async _toggleFoldersButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this._foldersOpened = !this._foldersOpened;
    let query = this._foldersOpened ? 'not(checked)' : 'checked';
    let folders = document.querySelectorAll('input[type=checkbox]:' + query);
    this.activateButton('toggleFoldersButton', this._foldersOpened);
    for (let folder of folders) {
      let folderId = folder.id;
      let storedFolder = DefaultValues.getStoredFolder(folderId);
      folder.checked = this._foldersOpened;
      storedFolder.checked = this._foldersOpened;
      await LocalStorageManager.setValue_async(folderId, storedFolder);
    }
    FeedsTreeView.instance.selectionBar.refresh();
  }

  async _addFeedButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this._buttonAddFeedEnabled) { return; }
    let feedList = TabManager.instance.activeTabFeedLinkList;
    if (feedList.length == 1) {
      let tabInfo = await BrowserManager.getActiveTab_async();
      await Dialogs.openSubscribeDialog_async(tabInfo.title, feedList[0].link);
    }
    else {
      BrowserManager.openPageAction();
    }
  }

  async _discoverFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this._buttonDiscoverFeedsEnabled) { return; }
    let tabInfo = await BrowserManager.getActiveTab_async();
    await LocalStorageManager.setValue_async('discoverInfo', { tabInfos: tabInfo });
    let win = await BrowserManager.openPopup_async(Dialogs.discoverFeedsUrl, 800, 300, '');
    await LocalStorageManager.setValue_async('discoverInfoWinId', { winId: win.id });
  }

  async _filterButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this._filterEnabled = !this._filterEnabled;
    await LocalStorageManager.setValue_async('filterEnabled', this._filterEnabled);
    this._updateFilterBar();
  }

  async _optionsMenuClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let optionOpened = FeedsContextMenu.instance.visible && (FeedsContextMenu.instance.type == 'optionMenu');
    if (optionOpened) {
      FeedsContextMenu.instance.hide();
    }
    else {
      let rec = event.currentTarget.getBoundingClientRect();
      FeedsContextMenu.instance.show(rec.left, rec.bottom, event.currentTarget);
    }
  }

  async showErrorsAsUnread_sbscrb() {
    await this.updatedFeedsSetVisibility_async(false);
  }
}
