/*global  browser*/
'use strict';
class ContentManager {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._youtubeFeedLinkList = null;
  }

  static async runtimeOnMessage_event(request) {
    let response = null;
    switch (request.key) {
      case 'isFeed':
        response = ContentManager.instance._isFeed();
        break;
      case 'discoverFeedLinkInfoList':
        response = ContentManager.instance._discoverFeedLinkInfoList();
        break;
      case 'getFeedLinkInfoList':
        response = await ContentManager.instance._getFeedLinkInfoList_async();
        break;
    }
    return Promise.resolve(response);
  }

  _isFeed() {
    let feedHandler = null;
    try {
      feedHandler = document.getElementById('feedHandler').innerHTML;
    }
    catch (e) { }
    let isFeed = (feedHandler ? true : false);
    if (!isFeed) {
      isFeed = window.location.href.match(/rss|feed|atom|syndicate/i);
    }
    if (isFeed) { this._addSubscribeButton(); }
    return isFeed;
  }

  _addSubscribeButton() {
    if (!document.getElementById('subscribeWithDropFeedsButton')) {
      let feedSubscribeLine = document.getElementById('feedSubscribeLine');
      let subscribeButton = document.createElement('button');
      subscribeButton.id = 'subscribeWithDropFeedsButton';
      subscribeButton.innerText = browser.i18n.getMessage('csSubscribeWithDropFeeds');
      subscribeButton.style.display = 'block';
      subscribeButton.style.marginInlineStart = 'auto';
      subscribeButton.style.marginTop = '0.5em';
      subscribeButton.addEventListener('click', (e) => { this._addSubscribeButtonOnClick_event(e); });
      feedSubscribeLine.appendChild(subscribeButton);
    }
  }

  _addSubscribeButtonOnClick_event(event) {
    event.stopPropagation();
    event.preventDefault();
    browser.runtime.sendMessage({ key: 'openSubscribeDialog' });
  }

  _discoverFeedLinkInfoList() {
    let feedLinkList = [];
    let elLinkList = Array.from(document.getElementsByTagName('link'));
    elLinkList.push(...Array.from(document.getElementsByTagName('a')));
    for (let elLink of elLinkList) {
      if (elLink.href.match(/rss|feed|atom|syndicate/i)) {
        feedLinkList.push(elLink.href);
      }
    }
    //remove duplicates
    feedLinkList = feedLinkList.filter((item, pos) => {
      return feedLinkList.indexOf(item) == pos;
    });
    return feedLinkList;
  }

  async _getFeedLinkInfoList_async() {
    let feedLinkList = [];
    if (this._isYoutubeTab()) {
      return await this._getYoutubeFeeds();
    }
    let elLinkList = Array.from(document.getElementsByTagName('link'));
    let count = 1;
    for (let elLink of elLinkList) {
      if (elLink.href.match(/rss|feed|atom|syndicate/i)) {
        feedLinkList.push({ title: (elLink.title || 'Feed ' + count++), link: elLink.href });
      }
    }
    //remove duplicates
    feedLinkList = feedLinkList.filter((item, pos) => {
      return feedLinkList.indexOf(item) == pos;
    });
    return feedLinkList;
  }

  _isYoutubeTab() {
    /*eslint-disable no-useless-escape*/
    let isYoutubeTab = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/g.test(window.location.href);
    /*eslint-enable no-useless-escape*/
    return isYoutubeTab;
  }

  async _getYoutubeFeeds() {
    if (!this._youtubeFeedLinkList) {
      let feedLinkList = [];
      let pageSource = await (await fetch(document.location.href)).text();
      /*eslint-disable no-useless-escape*/
      let channelId = (pageSource.match(/(\/|\\\/)channel(\/|\\\/){1}(\w|-)+/)[0]).match(/[^\/channel\/](\w|-)+/)[0];
      /*eslint-enable no-useless-escape*/
      feedLinkList.push({ title: '', link: 'https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId });
      this._youtubeFeedLinkList = feedLinkList;
    }
    return this._youtubeFeedLinkList;
  }
}
browser.runtime.onMessage.addListener(ContentManager.runtimeOnMessage_event);
