/*global BrowserManager*/
'use strict';
class FeedsPanel { /*exported FeedsPanel*/
  static get instance() {
    if (!this._instance) {
      this._instance = new FeedsPanel();
    }
    return this._instance;
  }

  constructor() {
  }

  displayFeed(feed) {
    this._setTitle(feed.info.channel);
    this._displayItems(feed);
  }

  _setTitle(channel) {
    let titleHtml = '<a href="' + channel.link + '">' + channel.title + '</a>';
    BrowserManager.setInnerHtmlById('itemsTitle', titleHtml);
  }

  _displayItems(feed) {
    let feedsHtml = feed.getFeedItemsHtml();
    BrowserManager.setInnerHtmlById('itemsPane', feedsHtml);
  }
}