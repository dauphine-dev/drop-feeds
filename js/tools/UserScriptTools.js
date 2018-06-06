/*global Listener ListenerProviders */
'use strict';
class UserScriptTools { /* exported UserScriptTools */
  static get instance() {
    if (!this._instance) {
      this._instance = new UserScriptTools();
    }
    return this._instance;
  }

  constructor() {
  }

  async init_async() {
    Listener.instance.subscribe(ListenerProviders.localStorage, 'itemSortOrder', UserScriptTools._setItemSortOrder_sbscrb, true);
  }
}
