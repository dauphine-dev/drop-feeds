/*global browser*/
'use strict';
class SubscribeThisFeed {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._feedTitle = null;
    this._feedUrl = null;
    this._updateLocalizedStrings();
    document.getElementById('subscribeNow').addEventListener('click', (e) => { this._subscribeNowButtonOnClicked_event(e); });
  }

  _updateLocalizedStrings() {
    document.getElementById('txtSubscribeUsing').textContent = browser.i18n.getMessage('stfSubscribeUsing');
    document.getElementById('subscribeNow').textContent = browser.i18n.getMessage('stfSubscribeNow');
  }

  async _subscribeNowButtonOnClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    browser.runtime.sendMessage({key:'openSubscribeDialog'});
    window.close();
  }
}
SubscribeThisFeed.instance;
