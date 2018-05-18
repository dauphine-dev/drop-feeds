/*global browser*/
'use strict';
class browserActionFF56 {
  static get instance() {
    if (!this._instance) {
      this._instance = new browserActionFF56();
    }
    return this._instance;
  }

  constructor() {
    this._updateLocalizedStrings();
    document.addEventListener('click', browserActionFF56._onclickEvent);
  }

  _updateLocalizedStrings() {
    document.getElementById('txtFf56_1').textContent = browser.i18n.getMessage('ff56Text1');
    document.getElementById('txtFf56_2').textContent = browser.i18n.getMessage('ff56Text2');
    document.getElementById('txtFf56_3').textContent = browser.i18n.getMessage('ff56Text3');
    document.getElementById('txtFf56_4').textContent = browser.i18n.getMessage('ff56Text4');
    document.getElementById('txtFf56_5').textContent = browser.i18n.getMessage('ff56Text5');
    document.getElementById('txtFf56_6').textContent = browser.i18n.getMessage('ff56Text6');
    document.getElementById('txtFf56_7').textContent = browser.i18n.getMessage('ff56Text7');
  }

  static _onclickEvent(event) {
    event.stopPropagation();
    event.preventDefault();
    window.close();
  }

}
browserActionFF56.instance;
