/*global browser */
'use strict';
class TabScripts { /*exported TabScripts*/
  static init() {
    TabScripts._updateLocalizedStrings();
    document.getElementById('scriptManagerButton').addEventListener('click', TabScripts._scriptManagerButtonOnClicked_event);
  }

  static _updateLocalizedStrings() {
    //document.getElementById('lblScriptManager').textContent = browser.i18n.getMessage('optLblScriptManager');
    //document.getElementById('scriptManagerButton').textContent = browser.i18n.getMessage('optScriptManagerButton');
  }

  static async _scriptManagerButtonOnClicked_event() {
    await browser.tabs.create({url: '/html/scripts.html', active: true});
  }
}