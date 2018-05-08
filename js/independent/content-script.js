/*global  browser*/
'use strict';
class ContentManager {
  static async runtimeOnMessageEvent(request) {
    let response = null;
    switch (request.key) {
      case 'isFeed':
        response = ContentManager._isFeed();
        break;
      case 'discoverFeedLinkInfoList':
        response = ContentManager._discoverFeedLinkInfoList();
        break;
      case 'getFeedLinkInfoList':
        response = ContentManager._getFeedLinkInfoList();
        break;
    }
    return Promise.resolve(response);
  }

  static _isFeed() {
    let feedHandler = null;
    try {
      feedHandler = document.getElementById('feedHandler').innerHTML;
    }
    catch(e) {}
    let isFeed = (feedHandler ? true : false);
    if (isFeed) { ContentManager._addSubscribeButton(); }
    return isFeed;
  }

  static _addSubscribeButton() {
    if (!document.getElementById('subscribeWithDropFeedsButton')) {
      let feedSubscribeLine = document.getElementById('feedSubscribeLine');
      let subscribeButton = document.createElement('button');
      subscribeButton.id = 'subscribeWithDropFeedsButton';
      subscribeButton.innerText = browser.i18n.getMessage('csSubscribeWithDropFeeds');
      subscribeButton.style.display = 'block';
      subscribeButton.style.marginInlineStart = 'auto';
      subscribeButton.style.marginTop = '0.5em';
      subscribeButton.addEventListener('click', ContentManager._addSubscribeButtonOnClick_event);
      feedSubscribeLine.appendChild(subscribeButton);
    }
  }

  static async _addSubscribeButtonOnClick_event(event) {
    event.stopPropagation();
    event.preventDefault();
    browser.runtime.sendMessage({key:'openSubscribeDialog'});
  }

  static _discoverFeedLinkInfoList() {
    let feedLinkList = [];
    let elLinkList = Array.from(document.getElementsByTagName('link'));
    elLinkList.push(... Array.from(document.getElementsByTagName('a')));
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

  static _getFeedLinkInfoList() {
    let feedLinkList = [];
    let elLinkList = Array.from(document.getElementsByTagName('link'));
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

}
browser.runtime.onMessage.addListener(ContentManager.runtimeOnMessageEvent);
