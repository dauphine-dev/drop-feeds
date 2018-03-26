/*global browser BrowserManager LocalStorageManager*/
'use strict';
class FeedList {
  static get instance() {
    if (!this._instance) {
      this._instance = new FeedList();
    }
    return this._instance;
  }

  constructor() {
    this._tabInfos = null;
    this._feedLinkList = [];
  }

  async init_async() {
    await this._getDiscoverInfo_async();
    await this._getActiveTabFeedLinkList_async();
    this._displayFeedList();
  }

  async _getDiscoverInfo_async() {
    let discoverInfo = await LocalStorageManager.getValue_async('discoverInfo');
    if (discoverInfo) {
      this._tabInfos = discoverInfo.tabInfos;
    }
  }

  async _getActiveTabFeedLinkList_async() {
    this._feedLinkList = await browser.tabs.sendMessage(this._tabInfos.id, {key:'getFeedLinkInfoList'});
  }

  _feedLinkInfoListToHtm() {
    let html = '';
    for (let feedLink of this._feedLinkList) {
      html += '<tr>';
      html += '<td>' + '' + '</td>'; //title
      html += '<td>' + '' + '</td>'; //format
      html += '<td>' + '' + '</td>'; //last update
      html += '<td>' + '' + '</td>'; //items
      html += '<td>' + feedLink + '</td>';
      html += '</tr>\n';
    }
    return html;
  }

  _displayFeedList() {
    let discoveredFeeds = 'No feeds have been discovered';
    if (this._feedLinkList.length > 0) {
      discoveredFeeds = 'Discovered: ' + this._feedLinkList.length + ' feeds';
    }
    BrowserManager.setInnerHtmlById('discoveredFeeds', discoveredFeeds);
    let html = this._feedLinkInfoListToHtm();
    BrowserManager.setInnerHtmlById('tableContent', html);
  }
}
FeedList.instance.init_async();
