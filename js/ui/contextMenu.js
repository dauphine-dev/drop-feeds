/*global  selectionBar feedManager*/
'use strict';
class contextMenu { /*exported contextMenu*/
  static get instance() {
    if (!this._instance) {
      this._instance = new contextMenu();
    }
    return this._instance;
  }

  constructor() {
    document.getElementById('ctxMnCheckFeeds').addEventListener('click', this._checkFeedsMenuClicked_event);
    document.getElementById('ctxMnMarkAllAsRead').addEventListener('click', this._markAllFeedsAsReadMenuClicked_event);
    document.getElementById('ctxMnMarkAllAsUpdated').addEventListener('click', this._markAllFeedsAsUpdatedMenuClicked_event);
    document.getElementById('ctxMnOpenAllUpdated').addEventListener('click', this._openAllUpdatedFeedsMenuClicked_event);
    this._elContent = document.getElementById('content');
    this._elContextMenu = document.getElementById('contextMenuId');
    this._idComeFrom = null;
  }

  hide(){
    document.getElementById('contextMenuId').classList.remove('show');
  }

  onClicked_event(event){
    let self = contextMenu.instance;
    event.stopPropagation();
    event.preventDefault();
    self._idComeFrom = event.currentTarget.getAttribute('id');
    self._elContextMenu.classList.add('show');
    self._setPosition(event.clientX, event.currentTarget.getBoundingClientRect().top);
    selectionBar.instance.put(event.currentTarget);
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
    let self = contextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    let rootElement = document.getElementById(self._idComeFrom);
    feedManager.instance.checkFeeds_async(rootElement);
  }

  async _openAllUpdatedFeedsMenuClicked_event() {
    let self = contextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    feedManager.instance.openAllUpdatedFeeds_async(self._idComeFrom);
  }

  async _markAllFeedsAsReadMenuClicked_event() {
    let self = contextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    feedManager.instance.markAllFeedsAsRead_async(self._idComeFrom);
  }

  async _markAllFeedsAsUpdatedMenuClicked_event() {
    let self = contextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    feedManager.instance.markAllFeedsAsUpdated_async(self._idComeFrom);
  }

}
