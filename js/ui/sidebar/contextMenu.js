/*global browser TreeView FeedManager*/
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
    let elContextMenu = document.getElementById('folderContextMenuId');
    elContextMenu.classList.remove('show');
    FeedManager.instance.checkFeeds_async(self._idComeFrom);
  }

  async _openAllUpdatedFeedsMenuClicked_event() {
    let self = ContextMenu.instance;
    let elContextMenu = document.getElementById('folderContextMenuId');
    elContextMenu.classList.remove('show');
    FeedManager.instance.openAllUpdatedFeeds_async(self._idComeFrom);
  }

  async _ctxMnOpenUpdatedAsUnifiedMenuClicked_event() {
    let self = ContextMenu.instance;
    let elContextMenu = document.getElementById('folderContextMenuId');
    elContextMenu.classList.remove('show');
    FeedManager.instance.openAsUnifiedFeed_async(self._idComeFrom);
  }

  async _markAllFeedsAsReadMenuClicked_event() {
    let self = ContextMenu.instance;
    let elContextMenu = document.getElementById('folderContextMenuId');
    elContextMenu.classList.remove('show');
    FeedManager.instance.markAllFeedsAsRead_async(self._idComeFrom);
  }

  async _markAllFeedsAsUpdatedMenuClicked_event() {
    let self = ContextMenu.instance;
    let elContextMenu = document.getElementById('folderContextMenuId');
    elContextMenu.classList.remove('show');
    FeedManager.instance.markAllFeedsAsUpdated_async(self._idComeFrom);
  }

}
