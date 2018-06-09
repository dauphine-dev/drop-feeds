/*global browser */
'use strict';
class TabScripts { /*exported TabScripts*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updateLocalizedStrings();
    document.getElementById('scriptManagerButton').addEventListener('click', (e) => { this._scriptManagerButtonOnClicked_event(e); });
  }

  async init_async() {
  }

  _updateLocalizedStrings() {
    //document.getElementById('lblScriptManager').textContent = browser.i18n.getMessage('optLblScriptManager');
    //document.getElementById('scriptManagerButton').textContent = browser.i18n.getMessage('optScriptManagerButton');
  }

  async _scriptManagerButtonOnClicked_event() {
    await browser.tabs.create({url: '/html/scripts.html', active: true});
  }
}