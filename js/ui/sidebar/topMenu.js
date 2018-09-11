/*global browser DefaultValues LocalStorageManager CssManager FeedManager TreeView BrowserManager Dialogs Listener ListenerProviders TabManager VERSION_ENUM*/
'use strict';
const _delayMsStopChecking = 1000;
class TopMenu { /*exported TopMenu*/
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
  }

  async init_async() {
    this._updatedFeedsVisible = await LocalStorageManager.getValue_async('updatedFeedsVisibility', this._updatedFeedsVisible);
    await this.updatedFeedsSetVisibility_async();
    await this._isRootFolderChecked_async();
    await this._updateLocalizedStrings_async();
    this.activateButton('toggleFoldersButton', this._foldersOpened);
    document.getElementById('checkFeedsButton').addEventListener('click', (e) => { this.checkFeedsButtonClicked_event(e); });
    document.getElementById('discoverFeedsButton').addEventListener('click', (e) => { this._discoverFeedsButtonClicked_event(e); });
    document.getElementById('onlyUpdatedFeedsButton').addEventListener('click', (e) => { this._onlyUpdatedFeedsButtonClicked_event(e); });
    document.getElementById('toggleFoldersButton').addEventListener('click', (e) => { this._toggleFoldersButtonClicked_event(e); });
    document.getElementById('addFeedButton').addEventListener('click', (e) => { this._addFeedButtonClicked_event(e); });
    document.getElementById('optionsMenuButton').addEventListener('click', (e) => { this._optionsMenuClicked_event(e); });
    Listener.instance.subscribe(ListenerProviders.localStorage, 'showErrorsAsUnread', (v) => { this.showErrorsAsUnread_sbscrb(v); }, false);
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
    let browserVersion = await BrowserManager.instance.getVersion_async();
    if (browserVersion[VERSION_ENUM.MAJ] < 57) {
      this._buttonAddFeedEnabled = false;
    }
    CssManager.setElementEnableById('addFeedButton', this._buttonAddFeedEnabled);
    let elAddFeedButton = document.getElementById('addFeedButton');
    elAddFeedButton.classList.remove('subscribeAdd');
    elAddFeedButton.classList.remove('subscribeGo');
    elAddFeedButton.classList.add('subscribe' + type);
    if (browserVersion[VERSION_ENUM.MAJ] >= 57) {
      elAddFeedButton.setAttribute('tooltiptext', browser.i18n.getMessage('sbSubscription' + type));
    }
  }

  animateCheckFeedButton(forceAnimate) {
    this._checkingFeedsStartTime = new Date();
    let checkFeedsButton = document.getElementById('checkFeedsButton');
    if (FeedManager.instance.checkingFeeds || forceAnimate) {
      checkFeedsButton.setAttribute('title', browser.i18n.getMessage('sbStopAndRestart'));
      checkFeedsButton.classList.add('checkFeedsButtonAnim');
      checkFeedsButton.classList.remove('checkFeedsButton');
      setTimeout(() => {checkFeedsButton.classList.add('checkFeedsButtonCursorRestart');}, _delayMsStopChecking);

    }
    else {
      checkFeedsButton.setAttribute('title', browser.i18n.getMessage('sbCheckFeeds'));
      checkFeedsButton.classList.add('checkFeedsButton');
      checkFeedsButton.classList.remove('checkFeedsButtonAnim');
      checkFeedsButton.classList.remove('checkFeedsButtonCursorRestart');
    }
  }

  activateButton(buttonId, activated) {
    let el = document.getElementById(buttonId);
    if (activated) {
      el.classList.add('topMenuItemSelected');
      el.classList.remove('topMenuItem');
    }
    else {
      el.classList.add('topMenuItem');
      el.classList.remove('topMenuItemSelected');
    }
  }

  async updatedFeedsSetVisibility_async() {
    this.activateButton('onlyUpdatedFeedsButton', this._updatedFeedsVisible);
    let visibleValue = this._updatedFeedsVisible ? 'display:none !important;' : 'visibility:visible;';
    let unreadValue = '  visibility: visible;\n  font-weight: bold;';
    let showErrorsAsUnread = await LocalStorageManager.getValue_async('showErrorsAsUnread', DefaultValues.showErrorsAsUnreadCheckbox);
    CssManager.replaceStyle('.feedUnread', unreadValue);
    CssManager.replaceStyle('.feedRead', visibleValue);
    CssManager.replaceStyle('.feedError', showErrorsAsUnread ? unreadValue : visibleValue);
    LocalStorageManager.setValue_async('updatedFeedsVisibility', this._updatedFeedsVisible);
  }

  async checkFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let checkingFeedsStartTimeDelay  = new Date(this._checkingFeedsStartTime.getTime() + _delayMsStopChecking);
    if (FeedManager.instance.checkingFeeds && new Date() > checkingFeedsStartTimeDelay ) {
      await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
      return;
    }
    FeedManager.instance.checkFeeds_async('content');
  }

  async _updateLocalizedStrings_async() {
    document.getElementById('checkFeedsButton').setAttribute('title', browser.i18n.getMessage('sbCheckFeeds'));
    document.getElementById('discoverFeedsButton').setAttribute('title', browser.i18n.getMessage('sbDiscoverFeeds'));
    document.getElementById('onlyUpdatedFeedsButton').setAttribute('title', browser.i18n.getMessage('sbViewOnlyUpdatedFeeds'));
    document.getElementById('toggleFoldersButton').setAttribute('title', browser.i18n.getMessage('sbToggleFolders'));
    document.getElementById('addFeedButton').setAttribute('title', browser.i18n.getMessage('sbSubscriptionGo'));
    let browserVersion = await BrowserManager.instance.getVersion_async();
    if (browserVersion[VERSION_ENUM.MAJ] < 57) {
      document.getElementById('addFeedButton').setAttribute('title', 'Not available in Firefox 56, please update');
    }

    document.getElementById('optionsMenuButton').setAttribute('title', browser.i18n.getMessage('sbOpenOptionsTab'));
  }

  async _isRootFolderChecked_async() {
    try {
      let rootFolderId = 'cb-' + TreeView.instance.selectionBar.getRootElementId().substring(3);
      let rootFolder = await LocalStorageManager.getValue_async(rootFolderId, DefaultValues.getStoredFolder(rootFolderId));
      this._foldersOpened = rootFolder.checked;
    } catch (e) { }
  }

  async _onlyUpdatedFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this._updatedFeedsVisible = !this._updatedFeedsVisible;
    await this.updatedFeedsSetVisibility_async();
    TreeView.instance.selectionBarRefresh();
  }

  async _toggleFoldersButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this._foldersOpened = !this._foldersOpened;
    let query = this._foldersOpened ? 'not(checked)' : 'checked';
    let folders = document.querySelectorAll('input[type=checkbox]:' + query);
    let i = folders.length;
    this.activateButton('toggleFoldersButton', this._foldersOpened);
    while (i--) {
      let folderId = folders[i].id;
      let storedFolder = DefaultValues.getStoredFolder(folderId);
      folders[i].checked = this._foldersOpened;
      storedFolder.checked = this._foldersOpened;
      LocalStorageManager.setValue_async(folderId, storedFolder);
    }
    TreeView.instance.selectionBarRefresh();
  }

  async _addFeedButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this._buttonAddFeedEnabled) { return; }
    let feedList = TabManager.instance.activeTabFeedLinkList;
    if (feedList.length == 1) {
      await browser.tabs.create({ url: feedList[0].link, active: true });
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
    await LocalStorageManager.setValue_async('discoverInfoWinId', {winId: win.id});
  }

  async _optionsMenuClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    await browser.runtime.openOptionsPage();
  }

  async showErrorsAsUnread_sbscrb() {
    this.updatedFeedsSetVisibility_async();
  }
}
