/*global CommonValues ThemeManager TabControl*/
'use strict';
class Options {
  static async new() {
    await ThemeManager.instance.init_async();
    await CommonValues.instance.init_async();
    TabControl.init();
  }
}
Options.new();
