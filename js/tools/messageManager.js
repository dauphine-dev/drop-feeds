/*global browser SideBar*/
'use strict';
class MessageManager { /*exported MessageManager*/
  static get instance() {
    if (!this._instance) {
      this._instance = new MessageManager();
    }
    return this._instance;
  }

  constructor() {
    browser.runtime.onMessage.addListener(this._runtimeOnMessage_event);
  }

  async _runtimeOnMessage_event(request) {
    let response = null;
    switch (request.req) {
      case 'openSubscribeDialog':
        SideBar.instance.openSubscribeDialog_async();
        break;
    }
    return Promise.resolve(response);
  }
}