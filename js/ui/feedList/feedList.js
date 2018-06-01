/*global browser BrowserManager LocalStorageManager Dialogs*/
'use strict';
class FeedList {
  static get instance() {
    if (!this._instance) {
      this._instance = new FeedList();
    }
    return this._instance;
  }

  constructor() {
    this._activeTabIsFeed = null;
  }

  async init_async() {
    let feedLinkList = [];
    this._activeTabIsFeed  = await BrowserManager.activeTabIsFeed_async();
    if (this._activeTabIsFeed) {
      let tabInfo = await BrowserManager.getActiveTab_async();
      feedLinkList.push({title: tabInfo.title, link:tabInfo.url});
    }
    else {
      feedLinkList = await BrowserManager.getActiveTabFeedLinkList_async();
      if(feedLinkList.length == 1) {
        await browser.tabs.create({url: feedLinkList[0].link, active: true});
        return;
      }
    }
    let html = this._feedLinkInfoListToHtm(feedLinkList);
    BrowserManager.setInnerHtmlById('tableContent', html);
    this._addTableRawClickEvents();
  }

  _feedLinkInfoListToHtm(feedList) {
    let html = '';
    let pos = 1;
    for (let feed of feedList) {
      html += '<tr pos="' + pos++ + '">';
      html += '<td>' + feed.title + '</td>';
      html += '<td style="display:none;">' + feed.link + '</td>';
      html += '</tr>\n';
    }
    return html;
  }

  _addTableRawClickEvents() {
    let elTrList = document.getElementById('tableContent').querySelectorAll('tr');
    for (let elTr of elTrList) {
      elTr.addEventListener('click', FeedList._tableRawOnClick_event);
    }
  }

  static async _tableRawOnClick_event(event) {
    let feedUrl = event.target.parentNode.cells[1].innerHTML;
    if (FeedList.instance._activeTabIsFeed) {
      let feedTitle = event.target.parentNode.cells[0].innerHTML;
      await LocalStorageManager.setValue_async('subscribeInfo', {feedTitle: feedTitle, feedUrl: feedUrl});
      await BrowserManager.openPopup_async(Dialogs.subscribeUrl, 778, 500, '');
    }
    else {
      await browser.tabs.create({url: feedUrl, active: true});
    }
  }
}

FeedList.instance.init_async();