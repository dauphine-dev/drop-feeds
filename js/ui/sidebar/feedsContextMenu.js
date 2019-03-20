/*global browser FeedsTreeView FeedManager FeedsNewFolderDialog BookmarkManager FeedsInfoView LocalStorageManager OptionSubscribeDialog*/
'use strict';
class FeedsContextMenu { /*exported FeedsContextMenu*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    document.getElementById('ctxFldMnCheckFeeds').addEventListener('click', (e) => { this._checkFeedsMenuClicked_event(e); });
    document.getElementById('ctxFldMnMarkAsRead').addEventListener('click', (e) => { this._markFeedsAsReadMenuClicked_event(e); });
    document.getElementById('ctxFldMnMarkAsUpdated').addEventListener('click', (e) => { this._markFeedsAsUpdatedMenuClicked_event(e); });
    document.getElementById('ctxFldMnMarkAllAsRead').addEventListener('click', (e) => { this._markAllFeedsAsReadMenuClicked_event(e); });
    document.getElementById('ctxFldMnMarkAllAsUpdated').addEventListener('click', (e) => { this._markAllFeedsAsUpdatedMenuClicked_event(e); });
    document.getElementById('ctxFldMnOpenAllUpdated').addEventListener('click', (e) => { this._openAllUpdatedFeedsMenuClicked_event(e); });
    document.getElementById('ctxFldMnOpenUpdatedAsUnified').addEventListener('click', (e) => { this._ctxMnOpenUpdatedAsUnifiedMenuClicked_event(e); });
    document.getElementById('ctxFldMnSortByName').addEventListener('click', (e) => { this._ctxMnSortByNameMenuClicked_event(e); });
    document.getElementById('ctxFldMnNewFolder').addEventListener('click', (e) => { this._ctxMnNewFolderClicked_event(e); });
    document.getElementById('ctxFldMnDeleteFolder').addEventListener('click', (e) => { this._ctxMnDeleteFolderMenuClicked_event(e); });
    document.getElementById('ctxFldMnInfo').addEventListener('click', (e) => { this._ctxMnInfoFolderMenuClicked_event(e); });

    document.getElementById('ctxFdtMnGetFeedTitle').addEventListener('click', (e) => { this._ctxMnGetFeedTitleMenuClicked_event(e); });
    document.getElementById('ctxFdMnOpenFeed').addEventListener('click', (e) => { this._ctxMnOpenFeedMenuClicked_event(e); });
    document.getElementById('ctxFdMnMarkFeedAsRead').addEventListener('click', (e) => { this._ctxMnMarkFeedAsReadMenuClicked_event(e); });
    document.getElementById('ctxFdMnMarkFeedAsUpdated').addEventListener('click', (e) => { this._ctxMnMarkFeedAsUpdatedMenuClicked_event(e); });
    document.getElementById('ctxFdMnMarkAllAsRead').addEventListener('click', (e) => { this._ctxMnMarkAllFeedsAsReadMenuClicked_event(e); });
    document.getElementById('ctxFdMnMarkAllAsUpdated').addEventListener('click', (e) => { this._ctxMnMarkAllFeedsAsUpdatedMenuClicked_event(e); });

    document.getElementById('ctxFdMnNewFolder').addEventListener('click', (e) => { this._ctxMnFdNewFolderClicked_event(e); });
    document.getElementById('ctxFdtMnDeleteFeed').addEventListener('click', (e) => { this._ctxMnDeleteFeedMenuClicked_event(e); });
    document.getElementById('ctxFdMnInfo').addEventListener('click', (e) => { this.ctxMnInfoFeedMenuClicked_event(e); });

    document.getElementById('ctxOptReload').addEventListener('click', (e) => { this._ctxOptReloadMenuClicked_event(e); });
    document.getElementById('ctxOptSubscribe').addEventListener('click', (e) => { this._ctxOptSubscribeMenuClicked_event(e); });
    document.getElementById('ctxOptSettings').addEventListener('click', (e) => { this._ctxOptSettingsMenuClicked_event(e); });

    window.addEventListener('keyup', (e) => { this._windowOnKeyup_event(e); });

    this._updateLocalizedStrings();
    this._elContent = document.getElementById('feedsContentPanel');
    this._elContextMenu = null;
    this._idComeFrom = null;
    this._yOffset = 0;
    this._visible = false;
  }

  hide() {
    this._visible = false;
    document.getElementById('folderContextMenuId').classList.remove('show');
    document.getElementById('folderContextMenuId').classList.add('hide');
    document.getElementById('feedContextMenuId').classList.remove('show');
    document.getElementById('feedContextMenuId').classList.add('hide');
    document.getElementById('optionMenu').classList.remove('show');
    document.getElementById('optionMenu').classList.add('hide');
  }

  show(xPos, yPos, elTarget) {
    this._idComeFrom = elTarget.getAttribute('id');
    this._accordingComeFrom();
    this._xPosOri = xPos;
    this._yPosOri = yPos;
    this.hide();
    this._elContextMenu = document.getElementById(this._contextMenuId);
    this._elContextMenu.classList.remove('hide');
    this._elContextMenu.classList.add('show');
    this._setPosition(xPos, yPos);
    FeedsTreeView.instance.selectionBar.put(elTarget);
    this._visible = true;
  }

  get visible() {
    return this._visible;
  }

  get type() {
    return this._contextMenuId;
  }

  _accordingComeFrom() {
    switch (this._idComeFrom) {
      case 'optionsMenuButton':
        this._contextMenuId = 'optionMenu';
        this._yOffset = 0;
        break;
      default:
        this._yOffset = 17;
        if (this._idComeFrom.startsWith('dv-') || this._idComeFrom.startsWith('fd-')) {
          this._contextMenuId = 'folderContextMenuId';
        }
        else {
          this._contextMenuId = 'feedContextMenuId';
        }
        break;
    }
  }

  _updateLocalizedStrings() {
    //Folder context menu
    document.getElementById('ctxFldMnCheckFeeds').textContent = browser.i18n.getMessage('sbCheckFeeds');
    document.getElementById('ctxFldMnMarkAsRead').textContent = browser.i18n.getMessage('sbMarkAsRead');
    document.getElementById('ctxFldMnMarkAsUpdated').textContent = browser.i18n.getMessage('sbMarkAsUnread');
    document.getElementById('ctxFldMnMarkAllAsRead').textContent = browser.i18n.getMessage('sbMarkAllAsRead');
    document.getElementById('ctxFldMnMarkAllAsUpdated').textContent = browser.i18n.getMessage('sbMarkAllAsUnread');
    document.getElementById('ctxFldMnOpenAllUpdated').textContent = browser.i18n.getMessage('sbOpenUpdatedFeeds');
    document.getElementById('ctxFldMnOpenUpdatedAsUnified').textContent = browser.i18n.getMessage('sbOpenUpdatedAsUnified');
    document.getElementById('ctxFldMnSortByName').textContent = browser.i18n.getMessage('sbSortByName');
    document.getElementById('ctxFldMnNewFolder').textContent = browser.i18n.getMessage('sbNewFolder');
    document.getElementById('ctxFldMnDeleteFolder').textContent = browser.i18n.getMessage('sbDeleteFolder');
    document.getElementById('ctxFldMnInfo').textContent = browser.i18n.getMessage('sbFolderInfo');

    //Feed context menu
    document.getElementById('ctxFdtMnGetFeedTitle').textContent = browser.i18n.getMessage('sbGetFeedTitle');
    document.getElementById('ctxFdMnOpenFeed').textContent = browser.i18n.getMessage('sbOpenFeed');
    document.getElementById('ctxFdMnMarkFeedAsRead').textContent = browser.i18n.getMessage('sbMarkFeedAsRead');
    document.getElementById('ctxFdMnMarkFeedAsUpdated').textContent = browser.i18n.getMessage('sbMarkFeedAsUpdated');
    document.getElementById('ctxFdMnMarkAllAsRead').textContent = browser.i18n.getMessage('sbMarkAllAsRead');
    document.getElementById('ctxFdMnMarkAllAsUpdated').textContent = browser.i18n.getMessage('sbMarkAllAsUnread');
    document.getElementById('ctxFdMnNewFolder').textContent = browser.i18n.getMessage('sbNewFolder');
    document.getElementById('ctxFdtMnDeleteFeed').textContent = browser.i18n.getMessage('sbDeleteFeed');
    document.getElementById('ctxFdMnInfo').textContent = browser.i18n.getMessage('sbFeedInfo');

    //Option context menu
    document.getElementById('ctxOptReload').textContent = browser.i18n.getMessage('sbCtxOptReload');
    document.getElementById('ctxOptSubscribe').textContent = browser.i18n.getMessage('sbCtxOptSubscribe');
    document.getElementById('ctxOptSettings').textContent = browser.i18n.getMessage('sbCtxOptSettings');

  }

  _setPosition(xPos, yPos) {
    let xMax = Math.max(0, this._elContent.offsetWidth - this._elContextMenu.offsetWidth - 26);
    let x = Math.min(xMax, xPos);

    let yMax = Math.max(0, this._elContent.offsetHeight - this._elContextMenu.offsetHeight + 60);
    let y = Math.min(yMax, yPos + this._yOffset);

    this._elContextMenu.style.left = x + 'px';
    this._elContextMenu.style.top = y + 'px';
  }

  async _checkFeedsMenuClicked_event() {
    this.hide();
    await FeedManager.instance.checkFeeds_async(this._idComeFrom);
  }

  async _windowOnKeyup_event(e) {
    if (e.key == 'Escape') {
      this.hide();
    }
  }

  async _openAllUpdatedFeedsMenuClicked_event() {
    this.hide();
    await FeedManager.instance.openAllUpdatedFeeds_async(this._idComeFrom);
  }

  async _ctxMnOpenUpdatedAsUnifiedMenuClicked_event() {
    this.hide();
    await FeedManager.instance.openAsUnifiedFeed_async(this._idComeFrom);
  }

  async _ctxMnSortByNameMenuClicked_event() {
    this.hide();
    let bookmarkId = this._idComeFrom.substring(3);
    await BookmarkManager.instance.sortBookmarks_async(bookmarkId);
  }

  async _ctxMnNewFolderClicked_event() {
    this.hide();
    FeedsNewFolderDialog.instance.show(this._idComeFrom);
  }

  async _ctxMnDeleteFolderMenuClicked_event() {
    this.hide();
    let bookmarkId = this._idComeFrom.substring(3);
    browser.bookmarks.removeTree(bookmarkId);
  }

  async _ctxMnInfoFolderMenuClicked_event() {
    this.hide();
    let bookmarkId = this._idComeFrom.substring(3);
    FeedsInfoView.instance.show(this._xPosOri, this._yPosOri, bookmarkId);
  }

  async _markFeedsAsReadMenuClicked_event() {
    this.hide();
    await FeedManager.instance.markAllFeedsAsRead_async(this._idComeFrom);
  }

  async _markFeedsAsUpdatedMenuClicked_event() {
    this.hide();
    await FeedManager.instance.markAllFeedsAsUpdated_async(this._idComeFrom);
  }

  async _markAllFeedsAsReadMenuClicked_event() {
    this.hide();
    await FeedManager.instance.markAllFeedsAsRead_async('feedsContentPanel');
  }

  async _markAllFeedsAsUpdatedMenuClicked_event() {
    this.hide();
    await FeedManager.instance.markAllFeedsAsUpdated_async('feedsContentPanel');
  }

  async _ctxMnGetFeedTitleMenuClicked_event() {
    this.hide();
    await FeedManager.instance.updateFeedTitle_async(this._idComeFrom);
  }

  async _ctxMnOpenFeedMenuClicked_event() {
    this.hide();
    FeedsTreeView.instance.openFeed(this._idComeFrom);
  }

  async _ctxMnMarkFeedAsReadMenuClicked_event() {
    this.hide();
    await FeedManager.instance.markFeedAsReadById_async(this._idComeFrom);
  }

  async _ctxMnMarkFeedAsUpdatedMenuClicked_event() {
    this.hide();
    await FeedManager.instance.markFeedAsUpdatedById_async(this._idComeFrom);
  }

  async _ctxMnMarkAllFeedsAsReadMenuClicked_event() {
    this.hide();
    await FeedManager.instance.markAllFeedsAsRead_async('feedsContentPanel');
  }

  async _ctxMnMarkAllFeedsAsUpdatedMenuClicked_event() {
    this.hide();
    await FeedManager.instance.markAllFeedsAsUpdated_async('feedsContentPanel');
  }

  async _ctxMnFdNewFolderClicked_event() {
    this.hide();
    FeedsNewFolderDialog.instance.show(this._idComeFrom);
  }

  async _ctxMnDeleteFeedMenuClicked_event() {
    this.hide();
    FeedManager.instance.delete(this._idComeFrom);
  }

  async ctxMnInfoFeedMenuClicked_event() {
    this.hide();
    FeedsInfoView.instance.show(this._xPosOri, this._yPosOri, this._idComeFrom);
  }

  async _ctxOptReloadMenuClicked_event() {
    this.hide();
    await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
  }

  async _ctxOptSubscribeMenuClicked_event() {
    this.hide();
    OptionSubscribeDialog.instance.show(this._idComeFrom);
  }

  async _ctxOptSettingsMenuClicked_event() {
    this.hide();
    browser.runtime.openOptionsPage();
  }

}
