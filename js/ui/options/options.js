/*global ThemeManager TabControl Timeout*/
'use strict';
class Options {
  static async new() {
    await ThemeManager.instance.init_async();
    await TabControl.init_async();
    await Timeout.instance.init_async();
  }
}
Options.new();
