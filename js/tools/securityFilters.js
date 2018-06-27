/* global Listener ListenerProviders DefaultValues LocalStorageManager*/
'use strict';
const _blackListHtmlTagsTopShow = ['blink', 'marquee'];
class SecurityFilters { /* exported SecurityFilters*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._allowedHtmlTagList = DefaultValues.allowedTagList;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'allowedHtmlElementsList', (v) => this._setAllowedHtmlElementsList_sbscrb(v), true);
  }

  async init_async() {
    this._allowedHtmlTagList = await LocalStorageManager.getValue_async('allowedHtmlElementsList', DefaultValues.allowedTagList);
  }

  get blackListHtmlTagsTopShow() {
    return _blackListHtmlTagsTopShow;
  }

  get whiteListHtmlTags() {
    return this._allowedHtmlTagList;
  }

  async _setAllowedHtmlElementsList_sbscrb(value) {
    this._allowedHtmlTagList = value;
  }

}