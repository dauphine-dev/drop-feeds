/*global browser FolderTreeView*/
'use strict';
class NewFolderDialog { /*exported NewFolderDialog*/
  static get instance() {
    if (!this._instance) {
      this._instance = new NewFolderDialog();
    }
    return this._instance;
  }

  constructor() {
    this._selectedId = null;
    this._elNewFolderDialog = document.getElementById('newFolderDialog');
  }

  async init_async() {
    document.getElementById('cancelNewFolderButton').addEventListener('click', NewFolderDialog._cancelButtonClicked_event);
    document.getElementById('createNewFolderButton').addEventListener('click', NewFolderDialog._createButtonClicked_event);
    document.getElementById('inputNewFolder').addEventListener('keyup', NewFolderDialog._inputNewFolderKeyup_event);
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

  static async _cancelButtonClicked_event(event) {
    let self = NewFolderDialog.instance;
    event.stopPropagation();
    event.preventDefault();
    self.hide();
  }

  static async _createButtonClicked_event(event) {
    let self = NewFolderDialog.instance;
    event.stopPropagation();
    event.preventDefault();
    try {
      let folderName = document.getElementById('inputNewFolder').value;
      let createBookmark = await browser.bookmarks.create({parentId: self._selectedId, title: folderName});
      FolderTreeView.instance.load_async(createBookmark.id);
    }
    catch(e) {
      /* eslint-disable no-console */
      console.log(e);
      /* eslint-enable no-console */
    }
    self.hide();
  }

  static _inputNewFolderKeyup_event(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      document.getElementById('createNewFolderButton').click();
    }
  }
}
