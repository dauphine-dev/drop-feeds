/*global browser BrowserManager DefaultValues*/
'use strict';
class TabAdvanced { /*exported TabAdvanced*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updateLocalizedStrings();
    document.getElementById('scriptManagerButton').addEventListener('click', (e) => { this._scriptManagerButtonOnClicked_event(e); });
    document.getElementById('securityFilterButton').addEventListener('click', (e) => { this._securityFilterButtonOnClicked_event(e); });
    document.getElementById('fieldGuid').value = BrowserManager.getDropFeedGUID();
    document.getElementById('dateTimeLocale').value = 'System';
    document.getElementById('dateOptions').value = DefaultValues.dateOptions;
    document.getElementById('timeOptions').value = DefaultValues.timeOptions;
  }

  async init_async() {
  }

  _updateLocalizedStrings() {
    document.getElementById('lblScriptManager').textContent = browser.i18n.getMessage('optLblScriptManager');
    document.getElementById('scriptManagerButton').textContent = browser.i18n.getMessage('optScriptManagerButton');
    document.getElementById('lblSecurityFilter').textContent = browser.i18n.getMessage('optLblSecurityFilter');
    document.getElementById('securityFilterButton').textContent = browser.i18n.getMessage('optSecurityFilterButton');
  }

  async _scriptManagerButtonOnClicked_event() {
    await browser.tabs.create({url: '/html/userScripts.html', active: true});
  }

  async _securityFilterButtonOnClicked_event() {
    await browser.tabs.create({url: '/html/securityFilter.html', active: true});
  }
}