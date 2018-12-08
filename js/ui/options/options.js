/*global browser ThemeManager AllTabControl Timeout*/
'use strict';
class Options {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    ThemeManager.instance.init_async();
    Timeout.instance;
    this._updateLocalizedStrings();
    AllTabControl.instance.init_async();
  }

  _updateLocalizedStrings() {
    document.title = browser.i18n.getMessage('optDropFeedsOptions');
  }

}
Options.instance;
