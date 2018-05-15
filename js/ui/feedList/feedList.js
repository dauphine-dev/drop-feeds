/*global BrowserManager LocalStorageManager Dialogs*/
'use strict';
class FeedList {
  static get instance() {
    if (!this._instance) {
      this._instance = new FeedList();
    }
    return this._instance;
  }

  async init_async() {
    let feedLinkList = await BrowserManager.getActiveTabFeedLinkList_async();
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
    let feedTitle = event.target.parentNode.cells[0].innerHTML;
    let feedUrl = event.target.parentNode.cells[1].innerHTML;
    await LocalStorageManager.setValue_async('subscribeInfo', {feedTitle: feedTitle, feedUrl: feedUrl});
    await BrowserManager.openPopup_async(Dialogs.subscribeUrl, 778, 500, '');
  }
}

FeedList.instance.init_async();