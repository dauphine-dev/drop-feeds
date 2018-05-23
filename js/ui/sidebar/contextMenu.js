/*global browser TreeView FeedManager NewFolderDialog BookmarkManager*/
'use strict';
class ContextMenu { /*exported ContextMenu*/
  static get instance() {
    if (!this._instance) {
      this._instance = new ContextMenu();
    }
    return this._instance;
  }

  constructor() {
    document.getElementById('ctxFldMnCheckFeeds').addEventListener('click', this._checkFeedsMenuClicked_event);
    document.getElementById('ctxFldMnMarkAllAsRead').addEventListener('click', this._markAllFeedsAsReadMenuClicked_event);
    document.getElementById('ctxFldMnMarkAllAsUpdated').addEventListener('click', this._markAllFeedsAsUpdatedMenuClicked_event);
    document.getElementById('ctxFldMnOpenAllUpdated').addEventListener('click', this._openAllUpdatedFeedsMenuClicked_event);
    document.getElementById('ctxFldMnOpenUpdatedAsUnified').addEventListener('click', this._ctxMnOpenUpdatedAsUnifiedMenuClicked_event);
    document.getElementById('ctxFldMnSortByName').addEventListener('click', this._ctxMnSortByNameMenuClicked_event);
    document.getElementById('ctxFldMnNewFolder').addEventListener('click', this._ctxMnNewFolderClicked_event);
    document.getElementById('ctxFldMnDeleteFolder').addEventListener('click', this._ctxMnDeleteFolderMenuClicked_event);

    document.getElementById('ctxFdtMnGetFeedTitle').addEventListener('click', this._ctxMnGetFeedTitleMenuClicked_event);
    document.getElementById('ctxFdMnOpenFeed').addEventListener('click', this._ctxMnOpenFeedMenuClicked_event);
    document.getElementById('ctxFdMnMarkFeedAsRead').addEventListener('click', this._ctxMnMarkFeedAsReadMenuClicked_event);
    document.getElementById('ctxFdMnMarkFeedAsUpdated').addEventListener('click', this._ctxMnMarkFeedAsUpdatedMenuClicked_event);
    document.getElementById('ctxFdMnNewFolder').addEventListener('click', this._ctxMnFdNewFolderClicked_event);
    document.getElementById('ctxFdtMnDeleteFeed').addEventListener('click', this._ctxMnDeleteFeedMenuClicked_event);

    this._updateLocalizedStrings();
    this._elContent = document.getElementById('content');
    this._elContextMenu = null;
    this._idComeFrom = null;
  }

  hide(){
    document.getElementById('folderContextMenuId').classList.remove('show');
    document.getElementById('feedContextMenuId').classList.remove('show');
  }

  show(xPos, yPos, elTarget){
    let self = ContextMenu.instance;
    self._idComeFrom = elTarget.getAttribute('id');
    let contextMenuId = null;
    if (self._idComeFrom.startsWith('dv-')) {
      contextMenuId = 'folderContextMenuId';
      document.getElementById('feedContextMenuId').classList.remove('show');
    }
    else {
      contextMenuId = 'feedContextMenuId';
      document.getElementById('folderContextMenuId').classList.remove('show');
    }
    self._elContextMenu = document.getElementById(contextMenuId);
    self._elContextMenu.classList.add('show');
    self._setPosition(xPos, yPos);
    TreeView.instance.selectionBar.put(elTarget);
  }

  _updateLocalizedStrings() {
    document.getElementById('ctxFldMnCheckFeeds').textContent = browser.i18n.getMessage('sbCheckFeeds');
    document.getElementById('ctxFldMnMarkAllAsRead').textContent = browser.i18n.getMessage('sbMarkAsRead');
    document.getElementById('ctxFldMnMarkAllAsUpdated').textContent = browser.i18n.getMessage('sbMarkAllAsUpdated');
    document.getElementById('ctxFldMnOpenAllUpdated').textContent = browser.i18n.getMessage('sbOpenUpdatedFeeds');
    document.getElementById('ctxFldMnOpenUpdatedAsUnified').textContent = browser.i18n.getMessage('sbOpenUpdatedAsUnified');
    document.getElementById('ctxFldMnSortByName').textContent = browser.i18n.getMessage('sbSortByName');
    document.getElementById('ctxFldMnNewFolder').textContent = browser.i18n.getMessage('sbNewFolder');
    document.getElementById('ctxFldMnDeleteFolder').textContent = browser.i18n.getMessage('sbDeleteFeed');


    document.getElementById('ctxFdtMnGetFeedTitle').textContent = browser.i18n.getMessage('sbGetFeedTitle');
    document.getElementById('ctxFdMnOpenFeed').textContent = browser.i18n.getMessage('sbOpenFeed');
    document.getElementById('ctxFdMnMarkFeedAsRead').textContent = browser.i18n.getMessage('sbMarkFeedAsRead');
    document.getElementById('ctxFdMnMarkFeedAsUpdated').textContent = browser.i18n.getMessage('sbMarkFeedAsUpdated');
    document.getElementById('ctxFdMnNewFolder').textContent = browser.i18n.getMessage('sbNewFolder');
    document.getElementById('ctxFdtMnDeleteFeed').textContent = browser.i18n.getMessage('sbDeleteFeed');

  }

  _setPosition(xPos, yPos) {
    let xMax  = Math.max(0, this._elContent.offsetWidth - this._elContextMenu.offsetWidth - 36);
    let x = Math.min(xMax, xPos);

    let yMax  = Math.max(0, this._elContent.offsetHeight - this._elContextMenu.offsetHeight + 60);
    let y = Math.min(yMax, yPos + 17);

    this._elContextMenu.style.left = x + 'px';
    this._elContextMenu.style.top = y + 'px';
  }

  async _checkFeedsMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    FeedManager.instance.checkFeeds_async(self._idComeFrom);
  }

  async _openAllUpdatedFeedsMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    FeedManager.instance.openAllUpdatedFeeds_async(self._idComeFrom);
  }

  async _ctxMnOpenUpdatedAsUnifiedMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    FeedManager.instance.openAsUnifiedFeed_async(self._idComeFrom);
  }

  async _ctxMnSortByNameMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    let bookmarkId = self._idComeFrom.substring(3);
    await BookmarkManager.instance.sortBookmarks_async(bookmarkId);
    TreeView.instance.reload_async();
  }



  async _ctxMnNewFolderClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    NewFolderDialog.instance.show(self._idComeFrom);
  }

  async _ctxMnDeleteFolderMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    let bookmarkId = self._idComeFrom.substring(3);
    browser.bookmarks.removeTree(bookmarkId);
  }




  async _markAllFeedsAsReadMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    FeedManager.instance.markAllFeedsAsRead_async(self._idComeFrom);
  }

  async _markAllFeedsAsUpdatedMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    FeedManager.instance.markAllFeedsAsUpdated_async(self._idComeFrom);
  }

  async _ctxMnGetFeedTitleMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    FeedManager.instance.updateFeedTitle_async(self._idComeFrom);
  }

  async _ctxMnOpenFeedMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    TreeView.instance.openFeed(self._idComeFrom);
  }

  async _ctxMnMarkFeedAsReadMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    FeedManager.instance.markFeedAsReadById_async(self._idComeFrom);
  }

  async _ctxMnMarkFeedAsUpdatedMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    FeedManager.instance.markFeedAsUpdatedById_async(self._idComeFrom);
  }

  async _ctxMnFdNewFolderClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    NewFolderDialog.instance.show(self._idComeFrom);
  }

  async _ctxMnDeleteFeedMenuClicked_event() {
    let self = ContextMenu.instance;
    self.hide();
    FeedManager.instance.delete(self._idComeFrom);
  }

}
