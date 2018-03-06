/*global commonValues themeManager tabControl*/
'use strict';
class options {
  static async new() {
    await themeManager.instance.init_async();
    await commonValues.instance.init_async();
    tabControl.init();
  }
}
options.new();
