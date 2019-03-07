/*global browser LocalStorageManager DefaultValues TextTools*/
'use strict';
class TabHtmlFilter { /*exported TabHtmlFilter*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._allowedTagList = null;
    this._selectedCellTag = null;
    this._selectedCellAtt = null;
    this._updateLocalizedStrings();
    document.getElementById('htmlFilterAddButton').addEventListener('click', (e) => { this._htmlFilterAddButtonOnClicked_event(e); });
    document.getElementById('htmlFilterEditButton').addEventListener('click', (e) => { this._htmlFilterEditButtonOnClicked_event(e); });
    document.getElementById('htmlFilterRemoveButton').addEventListener('click', (e) => { this._htmlFilterRemoveButtonOnClicked_event(e); });
    document.getElementById('htmlFilterRestoreDefaultButton').addEventListener('click', (e) => { this._htmlFilterRestoreDefaultButtonOnClicked_event(e); });
    document.getElementById('htmlFilterDialogCancel').addEventListener('click', (e) => { this._htmlFilterAddDialogCancelOnClicked_event(e); });
    document.getElementById('htmlFilterDialogOk').addEventListener('click', (e) => { this._htmlFilterDialogOkOnClicked_event(e); });
    document.getElementById('messageDialogOk').addEventListener('click', (e) => { this.messageDialogOkOnClicked_event(e); });
  }

  async init_async() {
    this._allowedTagList = await LocalStorageManager.getValue_async('allowedHtmlElementsList', DefaultValues.allowedTagList);
    this._allowedTagListSort();
    this._updateHtmlTagsTable();
  }

  _allowedTagListSort() {
    this._allowedTagList.sort((a,b) => {
      return (Object.keys(a)<Object.keys(b) ? -1 : Object.keys(a)>Object.keys(b) ? 1 : 0);
    });
  }
  
  _updateHtmlTagsTable() {
    let tableElement = document.getElementById('allowedHtmlElementsList');
    let range = document.createRange();
    range.selectNodeContents(tableElement);
    range.deleteContents();
    this._allowedTagList.map(entry => {
      let lineElement = document.createElement('tr');
      lineElement.addEventListener('click', (e) => { this.rowSelected_event(e); });
      let tag = Object.keys(entry);
      let cellElement = document.createElement('td');
      cellElement.textContent = tag[0];
      lineElement.appendChild(cellElement);
      let attList = entry[tag];
      let attributeElement = document.createElement('td');
      attributeElement.textContent = attList;
      lineElement.appendChild(attributeElement);
      tableElement.appendChild(lineElement);
    });
  }

  _updateLocalizedStrings() {
    document.getElementById('htmlFilterTabButton').textContent = browser.i18n.getMessage('optHtmlFilter');
    document.getElementById('allowedHtmlElements').textContent = browser.i18n.getMessage('optAllowedHtmlElements');
    document.getElementById('thElm').textContent = browser.i18n.getMessage('optHtmlFilterThElm');
    document.getElementById('thAtt').textContent = browser.i18n.getMessage('optHtmlFilterThAtt');
    document.getElementById('htmlFilterAddButton').textContent = browser.i18n.getMessage('optHtmlFilterAddButton');
    document.getElementById('htmlFilterEditButton').textContent = browser.i18n.getMessage('optHtmlFilterEditButton');
    document.getElementById('htmlFilterRemoveButton').textContent = browser.i18n.getMessage('optHtmlRemoveAddButton');
    document.getElementById('htmlFilterRestoreDefaultButton').textContent = browser.i18n.getMessage('optHtmlFilterRestoreDefaultButton');
    document.getElementById('htmlFilterDialogTitle').textContent = browser.i18n.getMessage('optHtmlFilterAddDialogTitle');
    document.getElementById('htmlFilterDialogElementToAllow').textContent = browser.i18n.getMessage('optHtmlFilterAddDialogElementToAllow');
    document.getElementById('htmlFilterAddDialogAttributesToAllow').textContent = browser.i18n.getMessage('optHtmlFilterAddDialogAttributesToAllow');
    document.getElementById('htmlFilterDialogCancel').textContent = browser.i18n.getMessage('optHtmlFilterAddDialogCancel');
    document.getElementById('htmlFilterDialogOk').textContent = browser.i18n.getMessage('optHtmlFilterAddDialogOk');
  }

  async rowSelected_event(event) {
    let rowList = Array.from(document.getElementById('allowedHtmlElementsList').querySelectorAll('tr'));
    rowList.map(row => row.classList.remove('selectedRow'));
    let target = (event.target.tagName.toLowerCase() == 'td' ? event.target.parentNode : event.target);
    target.classList.add('selectedRow');
    this._selectedCellTag = target.children[0];
    this._selectedCellAtt = target.children[1];
  }

  async _htmlFilterAddButtonOnClicked_event() {
    document.getElementById('htmlFilterDialogTag').value = '';
    document.getElementById('htmlFilterDialogAtt').value = '';
    this._openHtmlFilterDialog('htmlFilterAddButton', browser.i18n.getMessage('optHtmlFilterAddDialogTitle'));
  }

  async _htmlFilterEditButtonOnClicked_event() {
    if (this._selectedCellTag) {
      document.getElementById('htmlFilterDialogTag').value = this._selectedCellTag.textContent;
      document.getElementById('initialTag').value = this._selectedCellTag.textContent;
      document.getElementById('htmlFilterDialogAtt').value = this._selectedCellAtt.textContent;
      this._openHtmlFilterDialog('htmlFilterEditButton', browser.i18n.getMessage('optHtmlFilterEditDialogTitle'));
    }
  }

  _openHtmlFilterDialog(sourceButtonId, title) {
    let dialogElement = document.getElementById('htmlFilterDialog');
    let xMax = window.scrollX + window.innerWidth - dialogElement.offsetWidth;
    let yMax = window.scrollY + window.innerHeight - dialogElement.offsetHeight;
    let rectHtmlFilterEditButton = document.getElementById(sourceButtonId).getBoundingClientRect();
    document.getElementById('comeFrom').value = sourceButtonId;
    let xPos = Math.max(0, Math.min(rectHtmlFilterEditButton.right, xMax));
    let yPos = Math.max(0, Math.min(rectHtmlFilterEditButton.bottom, yMax));
    dialogElement.style.left = xPos + 'px';
    dialogElement.style.top = yPos + 'px';
    document.getElementById('htmlFilterDialogTitle').textContent = title;
    dialogElement.classList.remove('hide');
    dialogElement.classList.add('show');
  }

  async _htmlFilterRemoveButtonOnClicked_event() {
    if (this._selectedCellTag) {
      this._allowedTagList = this._allowedTagList.filter(entry => Object.keys(entry) != this._selectedCellTag.textContent);
      this._allowedTagListSort();
      await LocalStorageManager.setValue_async('allowedHtmlElementsList', this._allowedTagList);
      this._updateHtmlTagsTable();
    }
  }

  async _htmlFilterRestoreDefaultButtonOnClicked_event() {
    this._allowedTagList = DefaultValues.allowedTagList;
    this._allowedTagListSort();
    await LocalStorageManager.setValue_async('allowedHtmlElementsList', this._allowedTagList);
    this._updateHtmlTagsTable();
  }

  async _htmlFilterAddDialogCancelOnClicked_event() {
    let htmlFilterDialog = document.getElementById('htmlFilterDialog');
    htmlFilterDialog.classList.remove('show');
    htmlFilterDialog.classList.add('hide');
  }

  async _htmlFilterDialogOkOnClicked_event() {
    let htmlFilterDialogTag = document.getElementById('htmlFilterDialogTag');
    let editMode = (document.getElementById('comeFrom').value == 'htmlFilterEditButton');
    let initialTag = document.getElementById('initialTag').value;
    let tag = htmlFilterDialogTag.value.trim().toLowerCase();
    let isAlreadyHere = false;
    if (!editMode || tag != initialTag) {
      isAlreadyHere = (this._allowedTagList.findIndex(e => Object.keys(e) == tag)) >=0;
    }
    if (isAlreadyHere) {
      this._openMessageDialog('htmlFilterDialogTag', 'Already exist');
    }
    else {
      let htmlFilterDialogAtt = document.getElementById('htmlFilterDialogAtt');
      let attLine = htmlFilterDialogAtt.value.trim().toLowerCase().replace(/\s/g, '');
      let tagEntry = {[tag]: []};
      if (!TextTools.isNullOrEmpty(attLine)) {
        let attList = attLine.split(',');
        tagEntry = {[tag]: attList};
      }
      this._allowedTagList = this._allowedTagList.filter(entry => Object.keys(entry) != initialTag);
      this._allowedTagList.push(tagEntry);
      this._allowedTagListSort();
      await LocalStorageManager.setValue_async('allowedHtmlElementsList', this._allowedTagList);
    }
    let htmlFilterDialog = document.getElementById('htmlFilterDialog');
    htmlFilterDialog.classList.remove('show');
    htmlFilterDialog.classList.add('hide');
    this._updateHtmlTagsTable();
  }

  async messageDialogOkOnClicked_event() {
    let htmlFilterDialog = document.getElementById('messageDialog');
    htmlFilterDialog.classList.remove('show');
    htmlFilterDialog.classList.add('hide');
  }

  _openMessageDialog(sourceId, text) {
    let dialogElement = document.getElementById('messageDialog');
    let xMax = window.scrollX + window.innerWidth - dialogElement.offsetWidth;
    let yMax = window.scrollY + window.innerHeight - dialogElement.offsetHeight;
    let rectHtmlFilterEditButton = document.getElementById(sourceId).getBoundingClientRect();
    let xPos = Math.max(0, Math.min(rectHtmlFilterEditButton.right, xMax));
    let yPos = Math.max(0, Math.min(rectHtmlFilterEditButton.bottom, yMax));
    dialogElement.style.left = xPos + 'px';
    dialogElement.style.top = yPos + 'px';
    document.getElementById('messageDialogMsg').textContent = text;
    dialogElement.classList.remove('hide');
    dialogElement.classList.add('show');
  }

}