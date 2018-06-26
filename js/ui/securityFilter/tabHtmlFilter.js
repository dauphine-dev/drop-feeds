/*global browser LocalStorageManager DefaultValues*/
'use strict';
class TabHtmlFilter { /*exported TabHtmlFilter*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._allowedTagList = null;
    this._updateLocalizedStrings();
    document.getElementById('htmlFilterAddButton').addEventListener('click', (e) => { this._htmlFilterAddButtonOnClicked_event(e); });
    document.getElementById('htmlFilterRemoveButton').addEventListener('click', (e) => { this._htmlFilterRemoveButtonOnClicked_event(e); });
  }

  async init_async() {
    this._allowedTagList = await LocalStorageManager.getValue_async('allowedHtmlElementsList', DefaultValues.getAllowedTagList());
    let tableElement = document.getElementById('allowedHtmlElementsList');
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
  }

  async _scriptManagerButtonOnClicked_event() {
    await browser.tabs.create({ url: '/html/userScripts.html', active: true });
  }

  async _securityFilterButtonOnClicked_event() {
    await browser.tabs.create({ url: '/html/securityFilter.html', active: true });
  }

  async rowSelected_event(event) {
    let rowList = Array.from(document.getElementById('allowedHtmlElementsList').querySelectorAll('tr'));
    rowList.map(row => row.classList.remove('selectedRow'));
    let target = (event.target.tagName.toLowerCase() == 'td' ? event.target.parentNode : event.target);
    target.classList.add('selectedRow');
  }

  async _htmlFilterAddButtonOnClicked_event() {

  }

  async _htmlFilterRemoveButtonOnClicked_event() {

  }

}