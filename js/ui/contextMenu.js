/*global  selectionBar*/
/*global  checkFeedsForFolderAsync, OpenAllUpdatedFeedsAsync, MarkAllFeedsAsReadAsync, MarkAllFeedsAsUpdatedAsync*/
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

  onClicked_event(event){
    let self = contextMenu.instance;
    event.stopPropagation();
    event.preventDefault();
    self._idComeFrom = event.currentTarget.getAttribute('id');
    self._elContextMenu.classList.add('show');
    let xMax  = Math.max(0, self._elContent.offsetWidth - self._elContextMenu.offsetWidth - 36);
    let x = Math.min(xMax, event.clientX);
    self._elContextMenu.style.left = x + 'px';

    let rectTarget = event.currentTarget.getBoundingClientRect();
    let yMax  = Math.max(0, self._elContent.offsetHeight - self._elContextMenu.offsetHeight + 60);
    let y = Math.min(yMax, rectTarget.top+ 17);
    self._elContextMenu.style.top = y + 'px';
    selectionBar.instance.put(event.currentTarget);
  }

  hide(){
    document.getElementById('contextMenuId').classList.remove('show');
  }

  async _checkFeedsMenuClicked_event() {
    let self = contextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    checkFeedsForFolderAsync(self._idComeFrom);
  }

  async _openAllUpdatedFeedsMenuClicked_event() {
    let self = contextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    OpenAllUpdatedFeedsAsync(self._idComeFrom);
  }

  async _markAllFeedsAsReadMenuClicked_event() {
    let self = contextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    MarkAllFeedsAsReadAsync(self._idComeFrom);
  }

  async _markAllFeedsAsUpdatedMenuClicked_event() {
    let self = contextMenu.instance;
    let elContextMenu = document.getElementById('contextMenuId');
    elContextMenu.classList.remove('show');
    MarkAllFeedsAsUpdatedAsync(self._idComeFrom);
  }
}
