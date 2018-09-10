/*global BrowserManager UserScriptsManager UserScriptsEditor*/
'use strict';
class Scripts {
  static get instance() { return (this._instance = this._instance || new this()); }

  async init_async() {
    await BrowserManager.instance.init_async();
    await UserScriptsManager.instance.init_async();
    await UserScriptsEditor.instance.init_async();
  }
}
Scripts.instance.init_async();

