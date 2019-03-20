/*global browser LocalStorageManager DefaultValues*/
'use strict';
class TabCssFilter { /*exported TabCssFilter*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._cssFilterList = null;
    this._selectedCell = null;
    this._updateLocalizedStrings();
    document.getElementById('cssFilterAddButton').addEventListener('click', (e) => { this._cssFilterAddButtonOnClicked_event(e); });
    document.getElementById('cssFilterEditButton').addEventListener('click', (e) => { this._cssFilterEditButtonOnClicked_event(e); });
    document.getElementById('cssFilterRemoveButton').addEventListener('click', (e) => { this._cssFilterRemoveButtonOnClicked_event(e); });
    document.getElementById('cssFilterRestoreDefaultButton').addEventListener('click', (e) => { this._cssFilterRestoreDefaultButtonOnClicked_event(e); });
    document.getElementById('cssFilterDialogCancel').addEventListener('click', (e) => { this._cssFilterAddDialogCancelOnClicked_event(e); });
    document.getElementById('cssFilterDialogOk').addEventListener('click', (e) => { this._cssFilterDialogOkOnClicked_event(e); });
    document.getElementById('messageDialogOk').addEventListener('click', (e) => { this.messageDialogOkOnClicked_event(e); });
  }

  async init_async() {
    this._cssFilterList = await LocalStorageManager.getValue_async('rejectedCssFragmentList', DefaultValues.rejectedCssFragmentList);
    this._updateCssTagsTable();
  }

  
  _updateCssTagsTable() {
    let tableElement = document.getElementById('cssFilterList');
    let range = document.createRange();
    range.selectNodeContents(tableElement);
    range.deleteContents();
    this._cssFilterList.map(entry => {
      let lineElement = document.createElement('tr');
      lineElement.addEventListener('click', (e) => { this.rowSelected_event(e); });
      let cellElement = document.createElement('td');
      cellElement.textContent = entry;
      lineElement.appendChild(cellElement);
      tableElement.appendChild(lineElement);
    });
  }

  _updateLocalizedStrings() {
    document.getElementById('cssFilterTabButton').textContent = browser.i18n.getMessage('optCssFilter');
    document.getElementById('rejectedCssFragments').textContent = browser.i18n.getMessage('optRejectedCssFragments');
    document.getElementById('cssFilterAddButton').textContent = browser.i18n.getMessage('optCssFilterAddButton');
    document.getElementById('cssFilterEditButton').textContent = browser.i18n.getMessage('optCssFilterEditButton');
    document.getElementById('cssFilterRemoveButton').textContent = browser.i18n.getMessage('optCssRemoveAddButton');
    document.getElementById('cssFilterRestoreDefaultButton').textContent = browser.i18n.getMessage('optCssFilterRestoreDefaultButton');
    document.getElementById('cssInfo').textContent = browser.i18n.getMessage('optCssInfo');
    document.getElementById('cssFilterDialogTitle').textContent = browser.i18n.getMessage('optCssFilterAddDialogTitle');
    document.getElementById('cssFilterDialogCssFragmentToRejected').textContent = browser.i18n.getMessage('optCssFilterDialogCssFragmentToRejected');
    document.getElementById('cssFilterDialogCancel').textContent = browser.i18n.getMessage('optCssFilterAddDialogCancel');
    document.getElementById('cssFilterDialogOk').textContent = browser.i18n.getMessage('optCssFilterAddDialogOk');
  }

  async rowSelected_event(event) {
    let rowList = Array.from(document.getElementById('cssFilterList').querySelectorAll('tr'));
    rowList.map(row => row.classList.remove('selectedRow'));
    let target = (event.target.tagName.toLowerCase() == 'td' ? event.target.parentNode : event.target);
    target.classList.add('selectedRow');
    this._selectedCell = target.children[0];
  }

  async _cssFilterAddButtonOnClicked_event() {
    document.getElementById('cssFilterDialogFilter').value = '';
    this._openCssFilterDialog('cssFilterAddButton', browser.i18n.getMessage('optCssFilterAddDialogTitle'));
  }

  async _cssFilterEditButtonOnClicked_event() {
    if (this._selectedCell) {
      document.getElementById('cssFilterDialogFilter').value = this._selectedCell.textContent;
      document.getElementById('cssInitialFilter').value = this._selectedCell.textContent;
      this._openCssFilterDialog('cssFilterEditButton', browser.i18n.getMessage('optCssFilterEditDialogTitle'));
    }
  }

  _openCssFilterDialog(sourceButtonId, title) {
    let dialogElement = document.getElementById('cssFilterDialog');
    let xMax = window.scrollX + window.innerWidth - dialogElement.offsetWidth;
    let yMax = window.scrollY + window.innerHeight - dialogElement.offsetHeight;
    let rectCssFilterEditButton = document.getElementById(sourceButtonId).getBoundingClientRect();
    document.getElementById('cssComeFrom').value = sourceButtonId;
    let xPos = Math.max(0, Math.min(rectCssFilterEditButton.right, xMax));
    let yPos = Math.max(0, Math.min(rectCssFilterEditButton.bottom, yMax));
    dialogElement.style.left = xPos + 'px';
    dialogElement.style.top = yPos + 'px';
    document.getElementById('cssFilterDialogTitle').textContent = title;
    dialogElement.classList.remove('hide');
    dialogElement.classList.add('show');
  }

  async _cssFilterRemoveButtonOnClicked_event() {
    if (this._selectedCell) {
      this._cssFilterList = this._cssFilterList.filter(entry => entry != this._selectedCell.textContent);
      await LocalStorageManager.setValue_async('rejectedCssFragmentList', this._cssFilterList);
      this._updateCssTagsTable();
    }
  }

  async _cssFilterRestoreDefaultButtonOnClicked_event() {
    this._cssFilterList = DefaultValues.rejectedCssFragmentList;
    await LocalStorageManager.setValue_async('rejectedCssFragmentList', this._cssFilterList);
    this._updateCssTagsTable();
  }

  async _cssFilterAddDialogCancelOnClicked_event() {
    let cssFilterDialog = document.getElementById('cssFilterDialog');
    cssFilterDialog.classList.remove('show');
    cssFilterDialog.classList.add('hide');
  }

  async _cssFilterDialogOkOnClicked_event() {
    let cssFilterDialogFilter = document.getElementById('cssFilterDialogFilter');
    let editMode = (document.getElementById('cssComeFrom').value == 'cssFilterEditButton');
    let initialFilter = document.getElementById('cssInitialFilter').value;
    let cssFilter = cssFilterDialogFilter.value.trim().toLowerCase();
    let isAlreadyHere = false;
    if (!editMode || cssFilter != initialFilter) {
      isAlreadyHere = (this._cssFilterList.findIndex(e => e == cssFilter)) >=0;
    }
    if (isAlreadyHere) {
      this._openMessageDialog('cssFilterDialogFilter', 'Already exist');
    }
    else {
      this._cssFilterList = this._cssFilterList.filter(entry =>  entry != initialFilter);

      this._cssFilterList.push(cssFilter);
      await LocalStorageManager.setValue_async('rejectedCssFragmentList', this._cssFilterList);
    }
    let cssFilterDialog = document.getElementById('cssFilterDialog');
    cssFilterDialog.classList.remove('show');
    cssFilterDialog.classList.add('hide');
    this._updateCssTagsTable();
  }

  async messageDialogOkOnClicked_event() {
    let cssFilterDialog = document.getElementById('messageDialog');
    cssFilterDialog.classList.remove('show');
    cssFilterDialog.classList.add('hide');
  }

  _openMessageDialog(sourceId, text) {
    let dialogElement = document.getElementById('messageDialog');
    let xMax = window.scrollX + window.innerWidth - dialogElement.offsetWidth;
    let yMax = window.scrollY + window.innerHeight - dialogElement.offsetHeight;
    let rectCssFilterEditButton = document.getElementById(sourceId).getBoundingClientRect();
    let xPos = Math.max(0, Math.min(rectCssFilterEditButton.right, xMax));
    let yPos = Math.max(0, Math.min(rectCssFilterEditButton.bottom, yMax));
    dialogElement.style.left = xPos + 'px';
    dialogElement.style.top = yPos + 'px';
    document.getElementById('messageDialogMsg').textContent = text;
    dialogElement.classList.remove('hide');
    dialogElement.classList.add('show');
  }

}