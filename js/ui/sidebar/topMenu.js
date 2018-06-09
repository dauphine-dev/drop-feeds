/*global browser DefaultValues LocalStorageManager CssManager FeedManager TreeView BrowserManager Dialogs Listener ListenerProviders TabManager VERSION_ENUM*/
'use strict';
class TopMenu  { /*exported TopMenu*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updatedFeedsVisible = DefaultValues.updatedFeedsVisible;
    this._foldersOpened = DefaultValues.foldersOpened;
    this._buttonAddFeedEnabled = false;
    this.buttonAddFeedEnabled = this._buttonAddFeedEnabled;
    this._buttonDiscoverFeedsEnabled = false;
    this.discoverFeedsButtonEnabled = this._buttonDiscoverFeedsEnabled;
    this._workInProgress = false;
    this.autoUpdateInterval = undefined;
    this.automaticUpdatesMilliseconds = undefined;
  }

  async init_async() {
    this._updatedFeedsVisible = await LocalStorageManager.getValue_async('updatedFeedsVisibility',  this._updatedFeedsVisible);
    await this.updatedFeedsSetVisibility_async();
    await this._isRootFolderChecked_async();
    this._updateLocalizedStrings();
    this.activateButton('toggleFoldersButton' , this._foldersOpened);
    document.getElementById('checkFeedsButton').addEventListener('click', (e) => { this.checkFeedsButtonClicked_event(e); });
    document.getElementById('discoverFeedsButton').addEventListener('click', (e) => { this._discoverFeedsButtonClicked_event(e); });
    document.getElementById('onlyUpdatedFeedsButton').addEventListener('click', (e) => { this._onlyUpdatedFeedsButtonClicked_event(e); });
    document.getElementById('toggleFoldersButton').addEventListener('click', (e) => { this._toggleFoldersButtonClicked_event(e); });
    document.getElementById('addFeedButton').addEventListener('click', (e) => { this._addFeedButtonClicked_event(e); });
    document.getElementById('optionsMenuButton').addEventListener('click', (e) => { this._optionsMenuClicked_event(e); });
    setTimeout((() => { this._automaticFeedUpdate(); } ), 2000);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'showErrorsAsUnread', (v) => { this.showErrorsAsUnread_sbscrb(v); }, false);
  }

  set workInProgress(value) {
    this._workInProgress = value;
  }

  set discoverFeedsButtonEnabled(value) {
    this._buttonDiscoverFeedsEnabled = value;
    CssManager.setElementEnableById('discoverFeedsButton', value);

  }

  setFeedButton(enabled, type) {
    this._buttonAddFeedEnabled = enabled;
    if (BrowserManager.instance.version[VERSION_ENUM.MAJ] < 57) {
      this._buttonAddFeedEnabled = false;
    }
    CssManager.setElementEnableById('addFeedButton', this._buttonAddFeedEnabled);
    let elAddFeedButton = document.getElementById('addFeedButton');
    elAddFeedButton.classList.remove('subscribeAdd');
    elAddFeedButton.classList.remove('subscribeGo');
    elAddFeedButton.classList.add('subscribe'+  type);
    if (BrowserManager.instance.version[VERSION_ENUM.MAJ] >= 57) {
      elAddFeedButton.setAttribute('tooltiptext', browser.i18n.getMessage('sbSubscription' + type));
    }
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

  async updatedFeedsSetVisibility_async() {
    this.activateButton('onlyUpdatedFeedsButton' , this._updatedFeedsVisible);
    let visibleValue = this._updatedFeedsVisible ? 'display:none !important;' : 'visibility:visible;';
    let unreadValue = '  visibility: visible;\n  font-weight: bold;';
    let showErrorsAsUnread = await LocalStorageManager.getValue_async('showErrorsAsUnread', DefaultValues.showErrorsAsUnreadCheckbox);
    CssManager.replaceStyle('.feedUnread', unreadValue);
    CssManager.replaceStyle('.feedRead', visibleValue);
    CssManager.replaceStyle('.feedError',  showErrorsAsUnread ? unreadValue : visibleValue);
    LocalStorageManager.setValue_async('updatedFeedsVisibility', this._updatedFeedsVisible);
  }

  async _automaticFeedUpdate() {
    await this.updateAutomaticUpdateInterval();

    let automaticUpdatesEnabled = await LocalStorageManager.getValue_async('automaticFeedUpdates', DefaultValues.automaticFeedUpdates);
    if (!automaticUpdatesEnabled)
      return;

    await this.updateAutomaticUpdateInterval();

    try
    {
      await FeedManager.instance.checkFeeds_async('content');
    }
    catch(e)
    {
      /*eslint-disable no-console*/
      console.log(e);
      /*eslint-enable no-console*/
    }
  }

  async updateAutomaticUpdateInterval() {
    let automaticUpdatesMinutes = await LocalStorageManager.getValue_async('automaticFeedUpdateMinutes', DefaultValues.automaticFeedUpdateMinutes);
    let automaticUpdatesMilliseconds = Math.min(automaticUpdatesMinutes * 60000, 300000);

    if(this.automaticUpdatesMilliseconds != automaticUpdatesMilliseconds)
    {
      this.automaticUpdatesMilliseconds = automaticUpdatesMilliseconds;

      if(this.autoUpdateInterval) {
        clearInterval(this.autoUpdateInterval);
      }
      this.autoUpdateInterval = setInterval(() => (this._automaticFeedUpdate), automaticUpdatesMilliseconds);
    }
  }

  async checkFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    FeedManager.instance.checkFeeds_async('content');
  }

  _updateLocalizedStrings() {
    document.getElementById('checkFeedsButton').setAttribute('title', browser.i18n.getMessage('sbCheckFeeds'));
    document.getElementById('discoverFeedsButton').setAttribute('title', browser.i18n.getMessage('sbDiscoverFeeds'));
    document.getElementById('onlyUpdatedFeedsButton').setAttribute('title', browser.i18n.getMessage('sbViewOnlyUpdatedFeeds'));
    document.getElementById('toggleFoldersButton').setAttribute('title', browser.i18n.getMessage('sbToggleFolders'));
    document.getElementById('addFeedButton').setAttribute('title', browser.i18n.getMessage('sbSubscriptionGo'));
    if (BrowserManager.instance.version[VERSION_ENUM.MAJ] < 57) {
      document.getElementById('addFeedButton').setAttribute('title', 'Not available in Firefox 56, please update');
    }

    document.getElementById('optionsMenuButton').setAttribute('title', browser.i18n.getMessage('sbOpenOptionsTab'));
  }

  async _isRootFolderChecked_async() {
    try {
      let rootFolderId = 'cb-' + TreeView.instance.selectionBar.getRootElementId().substring(3);
      let rootFolder = await LocalStorageManager.getValue_async(rootFolderId, DefaultValues.getStoredFolder(rootFolderId));
      this._foldersOpened = rootFolder.checked;
    } catch(e) { }
  }

  async _onlyUpdatedFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this._updatedFeedsVisible = ! this._updatedFeedsVisible;
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
    this.activateButton('toggleFoldersButton' , this._foldersOpened);
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
      await browser.tabs.create({url: feedList[0].link, active: true});
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
    await LocalStorageManager.setValue_async('discoverInfo', {tabInfos: tabInfo});
    BrowserManager.openPopup_async(Dialogs.discoverFeedsUrl, 800, 300, '');
  }

  async _optionsMenuClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    await browser.runtime.openOptionsPage();
  }

  async _automaticUpdateChanged_event() {
    await this.updateAutomaticUpdateInterval();
  }

  async showErrorsAsUnread_sbscrb() {
    this.updatedFeedsSetVisibility_async();
  }

}
