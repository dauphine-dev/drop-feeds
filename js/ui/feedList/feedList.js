/*global BrowserManager Dialogs*/
'use strict';
class FeedList {
  static get instance() { return (this._instance = this._instance || new this()); }

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
        await Dialogs.openSubscribeDialog_async(feedLinkList[0].title, feedLinkList[0].link);
        return;
      }
    }
    let html = this._feedLinkInfoListToHtm(feedLinkList);
    BrowserManager.setInnerHtmlById('main', html);
    this._addTableRawClickEvents();
  }

  _feedLinkInfoListToHtm(feedList) {
    let html = `
      <table>
      <tbody id="tableContent">`;
    let pos = 1;
    for (let feed of feedList) {
      html += '<tr pos="' + pos++ + '">';
      html += '<td>' + feed.title + '</td>';
      html += '<td style="display:none;">' + feed.link + '</td>';
      html += '</tr>\n';
    }
    html +=`
      </tbody>
      </table>`;
    return html;
  }

  _addTableRawClickEvents() {
    let elTrList = document.getElementById('tableContent').querySelectorAll('tr');
    for (let elTr of elTrList) {
      elTr.addEventListener('click', (e) => { this._tableRawOnClick_event(e); });
    }
  }

  async _tableRawOnClick_event(event) {
    let feedUrl = event.target.parentNode.cells[1].innerHTML;
    let feedTitle = event.target.parentNode.cells[0].innerHTML;
    await Dialogs.openSubscribeDialog_async(feedTitle, feedUrl);
  }
}

FeedList.instance.init_async();