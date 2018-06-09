/*global browser ThemeManager AllTabControl Timeout*/
'use strict';
class Options {
  static get instance() { return (this._instance = this._instance || new this()); }

  async init_async() {
    await ThemeManager.instance.init_async();
    await AllTabControl.instance.init_async();
    await Timeout.instance.init_async();
    Options._updateLocalizedStrings();
  }

  _updateLocalizedStrings() {
    document.title = browser.i18n.getMessage('optDropFeedsOptions');
  }

}
Options.instance.init_async();
