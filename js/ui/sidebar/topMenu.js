/*global browser DefaultValues LocalStorageManager CssManager FeedManager TreeView BrowserManager Dialogs*/
'use strict';
class TopMenu  { /*exported TopMenu*/
  static get instance() {
    if (!this._instance) {
      this._instance = new TopMenu();
    }
    return this._instance;
  }

  constructor() {
    this._updatedFeedsVisible = DefaultValues.updatedFeedsVisible;
    this._foldersOpened = DefaultValues.foldersOpened;
    this._buttonAddFeedEnabled = false;
    this._buttonDiscoverFeedsEnabled = false;
    this.discoverFeedsButtonEnabled = this._buttonDiscoverFeedsEnabled;
  }

  async init_async() {
    this._updatedFeedsVisible = await LocalStorageManager.getValue_async('updatedFeedsVisibility',  this._updatedFeedsVisible);
    this.updatedFeedsSetVisibility();
    await this._isRootFolderChecked_async();
    this._updateLocalizedStrings();
    this.activateButton('toggleFoldersButton' , this._foldersOpened);
    document.getElementById('checkFeedsButton').addEventListener('click', TopMenu.checkFeedsButtonClicked_event);
    document.getElementById('discoverFeedsButton').addEventListener('click', TopMenu._discoverFeedsButtonClicked_event);
    document.getElementById('onlyUpdatedFeedsButton').addEventListener('click', TopMenu._onlyUpdatedFeedsButtonClicked_event);
    document.getElementById('toggleFoldersButton').addEventListener('click', TopMenu._toggleFoldersButtonClicked_event);
    document.getElementById('addFeedButton').addEventListener('click', TopMenu._addFeedButtonClicked_event);
    document.getElementById('optionsMenuButton').addEventListener('click', TopMenu._optionsMenuClicked_event);
  }

  set discoverFeedsButtonEnabled(value) {
    this._buttonDiscoverFeedsEnabled = value;
    document.getElementById('discoverFeedsButton').style.opacity = (value ? '1' : '0.2');
  }

  set addFeedButtonEnable(value) {
    this._buttonAddFeedEnabled = value;
    document.getElementById('addFeedButton').style.opacity = (value ? '1' : '0.2');
  }

  animateCheckFeedButton(animationEnable) {
    if (animationEnable)
    {
      document.getElementById('checkFeedsButton').classList.add('checkFeedsButtonAnim');
      document.getElementById('checkFeedsButton').classList.remove('checkFeedsButton');
    }
    else
    {
      document.getElementById('checkFeedsButton').classList.add('checkFeedsButton');
      document.getElementById('checkFeedsButton').classList.remove('checkFeedsButtonAnim');
    }
  }

  activateButton(buttonId, activated) {
    let el =  document.getElementById(buttonId);
    if (activated)
    {
      el.classList.add('topMenuItemSelected');
      el.classList.remove('topMenuItem');
    }
    else
    {
      el.classList.add('topMenuItem');
      el.classList.remove('topMenuItemSelected');
    }
  }

  updatedFeedsSetVisibility() {
    this.activateButton('onlyUpdatedFeedsButton' , this._updatedFeedsVisible);
    let visibleValue = this._updatedFeedsVisible ? 'display:none;' : 'visibility:visible;';
    CssManager.replaceStyle('.feedUnread', '  visibility: visible;\n  font-weight: bold;');
    CssManager.replaceStyle('.feedRead', visibleValue);
    CssManager.replaceStyle('.feedError', visibleValue);
    LocalStorageManager.setValue_async('updatedFeedsVisibility', this._updatedFeedsVisible);
  }

  static async checkFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    FeedManager.instance.checkFeeds_async('content');
  }

  _updateLocalizedStrings() {
    document.getElementById('checkFeedsButton').setAttribute('tooltiptext', browser.i18n.getMessage('checkFeeds'));
    document.getElementById('discoverFeedsButton').setAttribute('tooltiptext', browser.i18n.getMessage('discoverFeeds'));
    document.getElementById('onlyUpdatedFeedsButton').setAttribute('tooltiptext', browser.i18n.getMessage('viewOnlyUpdatedFeeds'));
    document.getElementById('toggleFoldersButton').setAttribute('tooltiptext', browser.i18n.getMessage('toggleFolders'));
    document.getElementById('addFeedButton').setAttribute('tooltiptext', browser.i18n.getMessage('addNewFeed'));
    document.getElementById('optionsMenuButton').setAttribute('tooltiptext', browser.i18n.getMessage('openOptionsTab'));
  }

  async _isRootFolderChecked_async() {
    try {
      let rootFolderId = 'cb-' + TreeView.instance.selectionBar.getRootElementId().substring(3);
      let rootFolder = await LocalStorageManager.getValue_async(rootFolderId, DefaultValues.getStoredFolder(rootFolderId));
      this._foldersOpened = rootFolder.checked;
    } catch(e) { }
  }

  static async _onlyUpdatedFeedsButtonClicked_event(event) {
    let self = TopMenu.instance;
    event.stopPropagation();
    event.preventDefault();
    self._updatedFeedsVisible = ! self._updatedFeedsVisible;
    self.updatedFeedsSetVisibility();
    TreeView.instance.selectionBarRefresh();
  }

  static async _toggleFoldersButtonClicked_event(event) {
    let self = TopMenu.instance;
    event.stopPropagation();
    event.preventDefault();
    self._foldersOpened = !self._foldersOpened;
    let query = self._foldersOpened ? 'not(checked)' : 'checked';
    let folders = document.querySelectorAll('input[type=checkbox]:' + query);
    let i = folders.length;
    self.activateButton('toggleFoldersButton' , self._foldersOpened);
    while (i--) {
      let folderId = folders[i].id;
      let storedFolder = DefaultValues.getStoredFolder(folderId);
      folders[i].checked = self._foldersOpened;
      storedFolder.checked = self._foldersOpened;
      LocalStorageManager.setValue_async(folderId, storedFolder);
    }
    TreeView.instance.selectionBarRefresh();
  }

  static async _addFeedButtonClicked_event(event) {
    let self = TopMenu.instance;
    event.stopPropagation();
    event.preventDefault();
    if (!self._buttonAddFeedEnabled) { return; }
    browser.pageAction.openPopup();
  }

  static async _discoverFeedsButtonClicked_event(event) {
    let self = TopMenu.instance;
    event.stopPropagation();
    event.preventDefault();
    if (!self._buttonDiscoverFeedsEnabled) { return; }
    let tabInfo = await BrowserManager.getActiveTab_async();
    await LocalStorageManager.setValue_async('discoverInfo', {tabInfos: tabInfo});
    BrowserManager.openPopup_async(Dialogs.discoverFeedsUrl, 800, 300, '');
  }

  static async _optionsMenuClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    await browser.runtime.openOptionsPage();
  }
}
