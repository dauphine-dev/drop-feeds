/*global browser */
'use strict';
class FeedsNewFolderDialog { /*exported FeedsNewFolderDialog*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._selectedId = null;
    this._elNewFolderDialog = document.getElementById('newFolderDialog');
    this._updateLocalizedStrings();
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

  _updateLocalizedStrings() {
    document.getElementById('newFolderDialogTitle').textContent = browser.i18n.getMessage('subFolderDialogTitle');
    document.getElementById('newFolderButtonDialog').textContent = browser.i18n.getMessage('subNewFolder');
    document.getElementById('cancelNewFolderButton').textContent = browser.i18n.getMessage('subCancel');
    document.getElementById('createNewFolderButton').textContent = browser.i18n.getMessage('subCreate');
  }

  _setPosition() {
    let elMainDiv = document.getElementById('mainBoxTable');
    let elSelectedElement = document.getElementById(this._selectedId);
    let rectSelectedElement = elSelectedElement.getBoundingClientRect();
    let x = Math.round(rectSelectedElement.left);
    let y = Math.round(rectSelectedElement.top) + 20;
    let xMax = Math.max(0, elMainDiv.offsetWidth - this._elNewFolderDialog.offsetWidth + 18);
    let yMax = Math.max(0, elMainDiv.offsetHeight - this._elNewFolderDialog.offsetHeight + 20);
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
      let folderId = null;
      let index = 0;
      if (this._selectedId.startsWith('dv-') || this._selectedId.startsWith('fd-')) {
        folderId = this._selectedId.substring(this._selectedId.indexOf('-') + 1);
      }
      else {
        let feedId = this._selectedId;
        let bookmarks = await browser.bookmarks.get(feedId);
        folderId = bookmarks[0].parentId;
        index = bookmarks[0].index + 1;
      }
      await browser.bookmarks.create({ parentId: folderId, title: folderName, index: index });
    }
    catch (e) {
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
