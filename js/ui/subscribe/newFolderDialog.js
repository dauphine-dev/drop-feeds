/*global browser FolderTreeView*/
'use strict';
class FeedsNewFolderDialog { /*exported FeedsNewFolderDialog*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._selectedId = null;
    this._elNewFolderDialog = document.getElementById('newFolderDialog');
  }

  async init_async() {
    document.getElementById('cancelNewFolderButton').addEventListener('click', (e) => { this._cancelButtonClicked_event(e); });
    document.getElementById('createNewFolderButton').addEventListener('click', (e) => { this._createButtonClicked_event(e); });
    document.getElementById('inputNewFolder').addEventListener('keyup', (e) => { this._inputNewFolderKeyup_event(e); });
  }

  show(selectedId) {
    this._selectedId = selectedId;
    this._elNewFolderDialog.classList.remove('hide');
    this._elNewFolderDialog.classList.add('show');
    this._setPosition();
    this._selectAndFocusInputNewFolder();
  }

  hide() {
    let elNewFolderDialog = document.getElementById('newFolderDialog');
    elNewFolderDialog.classList.remove('show');
    elNewFolderDialog.classList.add('hide');
  }

  _setPosition() {
    let elMainDiv = document.getElementById('mainDiv');
    let elSelectedLabel = document.getElementById('lbl-' + this._selectedId);
    let rectSelectedLabel = elSelectedLabel.getBoundingClientRect();
    let x = Math.round(rectSelectedLabel.left);
    let y = Math.round(rectSelectedLabel.bottom);
    let xMax  = Math.max(0, elMainDiv.offsetWidth - this._elNewFolderDialog.offsetWidth + 18);
    let yMax  = Math.max(0, elMainDiv.offsetHeight - this._elNewFolderDialog.offsetHeight + 20);
    x = Math.min(xMax, x);
    y = Math.min(yMax, y);
    this._elNewFolderDialog.style.left = x + 'px';
    this._elNewFolderDialog.style.top = y + 'px';
  }

  _selectAndFocusInputNewFolder() {
    let elInputNewFolder = document.getElementById('inputNewFolder');
    elInputNewFolder.setSelectionRange(0, elInputNewFolder.value.length);
    elInputNewFolder.focus();
  }

  async _cancelButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this.hide();
  }

  async _createButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    try {
      let folderName = document.getElementById('inputNewFolder').value;
      let createBookmark = await browser.bookmarks.create({parentId: this._selectedId, title: folderName});
      await FolderTreeView.instance.load_async(createBookmark.id);
    }
    catch(e) {
      /* eslint-disable no-console */
      console.error(e);
      /* eslint-enable no-console */
    }
    this.hide();
  }

  _inputNewFolderKeyup_event(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      document.getElementById('createNewFolderButton').click();
    }
  }
}
