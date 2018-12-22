/*global DefaultValues Listener ListenerProviders*/
'use strict';

class FeedRendererOptions { /* exported FeedRendererOptions */
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._itemNewTab = DefaultValues.dateTimeOptions;
    this._dateTimeOptions = DefaultValues.itemNewTab;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'itemNewTab', (v) => { this._setItemNewTab_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'dateTimeOptions', (v) => { this._setDateTimeOptions_sbscrb(v); }, true);
  }

  get itemNewTab() {
    return this._itemNewTab;
  }

  get dateTimeOptions() {
    return this._dateTimeOptions;
  }

  _setItemNewTab_sbscrb(value) {
    this._itemNewTab = value;
  }

  _setDateTimeOptions_sbscrb(value) {
    this._dateTimeOptions = value;
  }

}