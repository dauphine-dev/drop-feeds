/*global BrowserManager UserScriptsManager UserScriptsEditor*/
'use strict';
class Scripts {
  static get instance() { return (this._instance = this._instance || new this()); }

  async init_async() {
    await BrowserManager.instance.init_async();
    UserScriptsManager.instance;
    UserScriptsEditor.instance;
  }
}
Scripts.instance.init_async();

