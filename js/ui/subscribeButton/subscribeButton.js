/*global browser*/
'use strict';
class SubscribeButton {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updateLocalizedStrings();
    document.getElementById('subscribeNow').addEventListener('click', (e) => { this._subscribeNowButtonOnClicked_event(e); });
  }

  _updateLocalizedStrings() {
    document.getElementById('txtSubscribeUsing').textContent = browser.i18n.getMessage('stfSubscribeUsing');
    document.getElementById('subscribeNow').textContent = browser.i18n.getMessage('stfSubscribeNow');
  }

  _subscribeNowButtonOnClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let targetFeed = event.target.getAttribute('target');
    browser.runtime.sendMessage({key:'openSubscribeDialog', value: targetFeed });
  }
}
SubscribeButton.instance;