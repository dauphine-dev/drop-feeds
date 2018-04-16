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
    document.getElementById('ctxMnCheckFeeds').addEventListener('click', this._checkFeedsMenuClicked_event);
    document.getElementById('ctxMnMarkAllAsRead').addEventListener('click', this._markAllFeedsAsReadMenuClicked_event);
    document.getElementById('ctxMnMarkAllAsUpdated').addEventListener('click', this._markAllFeedsAsUpdatedMenuClicked_event);
    document.getElementById('ctxMnOpenAllUpdated').addEventListener('click', this._openAllUpdatedFeedsMenuClicked_event);
    document.getElementById('ctxMnOpenUpdatedAsUnified').addEventListener('click', this._ctxMnOpenUpdatedAsUnifiedMenuClicked_event);
    this._updateLocalizedStrings();
    this._elContent = document.getElementById('content');
    this._elContextMenu = document.getElementById('contextMenuId');
    this._idComeFrom = null;
  }

  hide(){
    document.getElementById('contextMenuId').classList.remove('show');
  }

  show(xPos, yPos, elFolder){
    let self = ContextMenu.instance;
    self._idComeFrom = elFolder.getAttribute('id');
    self._elContextMenu.classList.add('show');
    self._setPosition(xPos, yPos);
    TreeView.instance.selectionBar.put(elFolder);
  }

  _updateLocalizedStrings() {
    document.getElementById('ctxMnCheckFeeds').textContent = browser.i18n.getMessage('checkFeeds');
    document.getElementById('ctxMnMarkAllAsRead').textContent = browser.i18n.getMessage('markAsRead');
    document.getElementById('ctxMnMarkAllAsUpdated').textContent = browser.i18n.getMessage('markAllAsUpdated');
    document.getElementById('ctxMnOpenAllUpdated').textContent = browser.i18n.getMessage('openUpdatedFeeds');
    document.getElementById('ctxMnOpenUpdatedAsUnified').textContent = browser.i18n.getMessage('openUpdatedAsUnified');
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
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    FeedManager.instance.checkFeeds_async(self._idComeFrom);
  }

  async _openAllUpdatedFeedsMenuClicked_event() {
    let self = ContextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    FeedManager.instance.openAllUpdatedFeeds_async(self._idComeFrom);
  }

  async _ctxMnOpenUpdatedAsUnifiedMenuClicked_event() {
    let self = ContextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    FeedManager.instance.openAsUnifiedFeed_async(self._idComeFrom);
  }

  async _markAllFeedsAsReadMenuClicked_event() {
    let self = ContextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    FeedManager.instance.markAllFeedsAsRead_async(self._idComeFrom);
  }

  async _markAllFeedsAsUpdatedMenuClicked_event() {
    let self = ContextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    FeedManager.instance.markAllFeedsAsUpdated_async(self._idComeFrom);
  }

}
