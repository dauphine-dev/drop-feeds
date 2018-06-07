/*global ScriptsManager ScriptsEditor*/
'use strict';
class Scripts {
  static get instance() {
    if (!this._instance) {
      this._instance = new Scripts();
    }
    return this._instance;
  }

  async init_async() {
    await ScriptsManager.instance.init_async();
    await ScriptsEditor.instance.init_async();
  }
}
Scripts.instance.init_async();

