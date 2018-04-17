/*global browser ThemeManager TabControl Timeout*/
'use strict';
class Options {
  static async new() {
    await ThemeManager.instance.init_async();
    await TabControl.init_async();
    await Timeout.instance.init_async();
    Options._updateLocalizedStrings();
  }

  static _updateLocalizedStrings() {
    document.title = browser.i18n.getMessage('optDropFeedsOptions');
  }

}
Options.new();
