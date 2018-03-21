/*global BrowserManager FeedParser*/
'use strict';
class ItemsPanel { /*exported ItemsPanel*/
  static get instance() {
    if (!this._instance) {
      this._instance = new ItemsPanel();
    }
    return this._instance;
  }

  constructor() {
  }

  displayItems(itemsTitle, titleLink, items) {
    this._setTitle(itemsTitle, titleLink);
    this._displayItems(items);
  }

  _setTitle(title, titleLink) {
    let titleHtml = FeedParser.parseItemsTitleToHtml(title, titleLink);
    BrowserManager.setInnerHtmlById('itemsTitle', titleHtml);
  }

  _displayItems(itemList) {
    let itemsHtml = FeedParser.parseItemListToHtml(itemList);
    BrowserManager.setInnerHtmlById('itemsPane', itemsHtml);
  }
}