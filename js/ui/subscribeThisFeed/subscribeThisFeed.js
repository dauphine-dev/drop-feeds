/*global browser*/
'use strict';
class SubscribeThisFeed {

  static get instance() {
    if (!this._instance) {
      this._instance = new SubscribeThisFeed();
    }
    return this._instance;
  }

  constructor() {
    this._feedTitle = null;
    this._feedUrl = null;
    this._updateLocalizedStrings();
    document.getElementById('subscribeNow').addEventListener('click', SubscribeThisFeed._subscribeNowButtonOnClicked_event);
  }

  _updateLocalizedStrings() {
    document.getElementById('txtSubscribeUsing').textContent = browser.i18n.getMessage('stfSubscribeUsing');
    document.getElementById('subscribeNow').textContent = browser.i18n.getMessage('stfSubscribeNow');
  }

  static async _subscribeNowButtonOnClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    browser.runtime.sendMessage({key:'openSubscribeDialog'});
    window.close();
  }
}
SubscribeThisFeed.instance;
