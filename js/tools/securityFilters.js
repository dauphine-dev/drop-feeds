/* global Listener ListenerProviders DefaultValues LocalStorageManager*/
'use strict';
const _blackListHtmlTagsTopShow = [ {'blink': []}, {'marquee': []}];
class SecurityFilters { /* exported SecurityFilters*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._allowedHtmlTagList = DefaultValues.allowedTagList;
    this._rejectedCssFragmentList = DefaultValues.rejectedCssFragmentList;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'allowedHtmlElementsList', (v) => this._setAllowedHtmlElementsList_sbscrb(v), true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'rejectedCssFragmentList', (v) => this._setRejectedCssFragmentsList_sbscrb(v), true);
  }

  async init_async() {
    this._allowedHtmlTagList = await LocalStorageManager.getValue_async('allowedHtmlElementsList', DefaultValues.allowedTagList);
    this._rejectedCssFragmentList = await LocalStorageManager.getValue_async('rejectedCssFragmentList', DefaultValues.rejectedCssFragmentList);
  }

  get blackListHtmlTagsTopShow() {
    return _blackListHtmlTagsTopShow;
  }

  get whiteListHtmlTags() {
    return this._allowedHtmlTagList;
  }

  get rejectedCssFragmentsList() {
    return this._rejectedCssFragmentList;
  }

  async _setAllowedHtmlElementsList_sbscrb(value) {
    this._allowedHtmlTagList = value;
  }

  async _setRejectedCssFragmentsList_sbscrb(value) {
    this._rejectedCssFragmentList = value;
  }


}