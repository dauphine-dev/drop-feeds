/*global browser BrowserManager LocalStorageManager Feed*/
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
    this._feedList;
  }

  async init_async() {
    await this._getDiscoverInfo_async();
    await this._getActiveTabFeedLinkList_async();
    await this._getFeedList_async();
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

  async _getFeedList_async() {
    this._feedList = [];
    for (let feedLink of this._feedLinkList) {
      let feed = await Feed.newByUrl(feedLink);
      await feed.update_async();
      this._feedList.push(feed);
    }

  }

  _feedLinkInfoListToHtm() {
    let html = '';
    for (let feed of this._feedList) {
      let feedInfo = feed.info;
      html += '<tr>';
      html += '<td>' + (feedInfo.channel.title ? feedInfo.channel.title : 'N/A') + '</td>'; //title
      html += '<td>' + '' + '</td>'; //format
      html += '<td>' + (feed.lastUpdate ? feed.lastUpdate : 'N/A') + '</td>'; //last update
      html += '<td>' + (feedInfo.itemList ? feedInfo.itemList.length  : 0) + '</td>'; //items
      html += '<td>' + feed.url + '</td>';
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
