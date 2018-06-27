/*global browser LocalStorageManager DefaultValues*/
'use strict';
class TabHtmlFilter { /*exported TabHtmlFilter*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._allowedTagList = null;
    this._selectedCell = null;
    this._updateLocalizedStrings();
    document.getElementById('htmlFilterAddButton').addEventListener('click', (e) => { this._htmlFilterAddButtonOnClicked_event(e); });
    document.getElementById('htmlFilterRemoveButton').addEventListener('click', (e) => { this._htmlFilterRemoveButtonOnClicked_event(e); });
    document.getElementById('htmlFilterRestoreDefaultButton').addEventListener('click', (e) => { this._htmlFilterRestoreDefaultButtonOnClicked_event(e); });

    document.getElementById('htmlFilterAddDialogCancel').addEventListener('click', (e) => { this._htmlFilterAddDialogCancelOnClicked_event(e); });
    document.getElementById('htmlFilterAddDialogOk').addEventListener('click', (e) => { this._htmlFilterAddDialogOkOnClicked_event(e); });

  }

  async init_async() {
    this._allowedTagList = await LocalStorageManager.getValue_async('allowedHtmlElementsList', DefaultValues.getAllowedTagList());
    this._allowedTagList.sort();
    this._updateHtmlTagsTable();
  }

  _updateHtmlTagsTable() {
    let tableElement = document.getElementById('allowedHtmlElementsList');
    let range = document.createRange();
    range.selectNodeContents(tableElement);
    range.deleteContents();
    this._allowedTagList.map(tag => {
      let lineElement = document.createElement('tr');
      lineElement.addEventListener('click', (e) => { this.rowSelected_event(e); });
      let cellElement = document.createElement('td');
      cellElement.textContent = tag;
      lineElement.appendChild(cellElement);
      tableElement.appendChild(lineElement);
    });
  }

  _updateLocalizedStrings() {
    document.getElementById('securityFilterSettings').textContent = browser.i18n.getMessage('optSecurityFilterSettings');
    document.getElementById('htmlFilterTabButton').textContent = browser.i18n.getMessage('optHtmlFilter');
    document.getElementById('allowedHtmlElements').textContent = browser.i18n.getMessage('optAllowedHtmlElements');
    document.getElementById('htmlFilterAddButton').textContent = browser.i18n.getMessage('optHtmlFilterAddButton');
    document.getElementById('htmlFilterRemoveButton').textContent = browser.i18n.getMessage('optHtmlRemoveAddButton');
    document.getElementById('htmlFilterRestoreDefaultButton').textContent = browser.i18n.getMessage('optHtmlFilterRestoreDefaultButton');
    document.getElementById('htmlFilterAddDialogTitle').textContent = browser.i18n.getMessage('optHtmlFilterAddDialogTitle');
    document.getElementById('htmlFilterAddDialogElementToAllow').textContent = browser.i18n.getMessage('optHtmlFilterAddDialogElementToAllow');
    document.getElementById('htmlFilterAddDialogCancel').textContent = browser.i18n.getMessage('optHtmlFilterAddDialogCancel');
    document.getElementById('htmlFilterAddDialogOk').textContent = browser.i18n.getMessage('optHtmlFilterAddDialogOk');
  }

  async rowSelected_event(event) {
    let rowList = Array.from(document.getElementById('allowedHtmlElementsList').querySelectorAll('tr'));
    rowList.map(row => row.classList.remove('selectedRow'));
    let target = (event.target.tagName.toLowerCase() == 'td' ? event.target.parentNode : event.target);
    target.classList.add('selectedRow');
    this._selectedCell = target.children[0];
  }

  async _htmlFilterAddButtonOnClicked_event() {
    let htmlFilterAddDialog = document.getElementById('htmlFilterAddDialog');
    let xMax = window.scrollX + window.innerWidth - htmlFilterAddDialog.offsetWidth;
    let yMax = window.scrollY + window.innerHeight - htmlFilterAddDialog.offsetHeight;
    let rectHtmlFilterAddButton = document.getElementById('htmlFilterAddButton').getBoundingClientRect();
    let xPos = Math.max(0, Math.min(rectHtmlFilterAddButton.right, xMax));
    let yPos = Math.max(0, Math.min(rectHtmlFilterAddButton.bottom, yMax));
    htmlFilterAddDialog.style.left = xPos + 'px';
    htmlFilterAddDialog.style.top = yPos + 'px';
    document.getElementById('htmlFilterAddDialogTag').value = '';
    htmlFilterAddDialog.classList.remove('hide');
    htmlFilterAddDialog.classList.add('show');
  }

  async _htmlFilterRemoveButtonOnClicked_event() {
    if (this._selectedCell) {
      this._allowedTagList = this._allowedTagList.filter(tag => tag != this._selectedCell.textContent);
      this._allowedTagList.sort();
      LocalStorageManager.setValue_async('allowedHtmlElementsList', this._allowedTagList);
      this._updateHtmlTagsTable();
    }
  }

  async _htmlFilterRestoreDefaultButtonOnClicked_event() {
    this._allowedTagList = DefaultValues.getAllowedTagList();
    this._allowedTagList.sort();
    this._allowedTagList.sort();
    LocalStorageManager.setValue_async('allowedHtmlElementsList', this._allowedTagList);
    this._updateHtmlTagsTable();
  }

  async _htmlFilterAddDialogCancelOnClicked_event() {
    let htmlFilterAddDialog = document.getElementById('htmlFilterAddDialog');
    htmlFilterAddDialog.classList.remove('show');
    htmlFilterAddDialog.classList.add('hide');
  }

  async _htmlFilterAddDialogOkOnClicked_event() {
    let htmlFilterAddDialogTag = document.getElementById('htmlFilterAddDialogTag');
    this._allowedTagList.push(htmlFilterAddDialogTag.value.trim().toLowerCase());
    this._allowedTagList.sort();
    LocalStorageManager.setValue_async('allowedHtmlElementsList', this._allowedTagList);
    let htmlFilterAddDialog = document.getElementById('htmlFilterAddDialog');
    htmlFilterAddDialog.classList.remove('show');
    htmlFilterAddDialog.classList.add('hide');
    this._updateHtmlTagsTable();
  }

}