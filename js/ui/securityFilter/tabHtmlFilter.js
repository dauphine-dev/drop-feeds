/*global browser LocalStorageManager DefaultValues*/
'use strict';
class TabHtmlFilter { /*exported TabHtmlFilter*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._allowedTagList = null;
    this._updateLocalizedStrings();
    //document.getElementById('scriptManagerButton').addEventListener('click', (e) => { this._scriptManagerButtonOnClicked_event(e); });
  }

  async init_async() {
    this._allowedTagList = await LocalStorageManager.getValue_async('allowedHtmlElements', DefaultValues.getAllowedTagList());
    let tableElement = document.getElementById('allowedHtmlElements');
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
    //document.getElementById('lblScriptManager').textContent = browser.i18n.getMessage('optLblScriptManager');
  }

  async _scriptManagerButtonOnClicked_event() {
    await browser.tabs.create({ url: '/html/userScripts.html', active: true });
  }

  async _securityFilterButtonOnClicked_event() {
    await browser.tabs.create({ url: '/html/securityFilter.html', active: true });
  }

  async rowSelected_event(event) {
    let rowList = Array.from(document.getElementById('allowedHtmlElements').querySelectorAll('tr'));
    rowList.map(row => row.classList.remove('selectedRow'));
    let target = (event.target.tagName.toLowerCase() == 'td' ? event.target.parentNode : event.target);
    target.classList.add('selectedRow');
  }
}