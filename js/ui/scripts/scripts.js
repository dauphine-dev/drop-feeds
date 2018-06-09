/*global ScriptsManager ScriptsEditor*/
'use strict';
class Scripts {
  static get instance() { return (this._instance = this._instance || new this()); }

  async init_async() {
    await ScriptsManager.instance.init_async();
    await ScriptsEditor.instance.init_async();
  }
}
Scripts.instance.init_async();

