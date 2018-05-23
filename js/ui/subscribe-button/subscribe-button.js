'use strict';
class SubscribeButton {

  static get instance() {
    if (!this._instance) {
      this._instance = new SubscribeButton();
    }
    return this._instance;
  }

  constructor() {
    this._feedTitle = null;
    this._feedUrl = null;
  }

  async init_async() {
  }
}
SubscribeButton.instance.init_async();
