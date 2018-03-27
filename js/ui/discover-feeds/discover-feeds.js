/*global browser BrowserManager LocalStorageManager Feed ProgressBar*/
'use strict';
class DiscoverFeeds {
  static get instance() {
    if (!this._instance) {
      this._instance = new DiscoverFeeds();
    }
    return this._instance;
  }

  constructor() {
    this._tabInfos = null;
    this._feedLinkList = [];
    this._feedList = [];
    this._feedsToProcessList = [];
    this._feedsToProcessCounter = 0;
    this._feedsToProcessTotal = 0;
  }

  async init_async() {
    this._progressBar = new ProgressBar('progressBar', true);
    this._progressBar.show();
    this._progressBar.value = 1;
    console.log(1);
    await this._getDiscoverInfo_async();
    console.log(2);
    await this._getActiveTabFeedLinkList_async();
    console.log(3);
    await this._getFeedList_async();
    console.log(4);
    await this._updateFeedList();
    console.log(5);
  }

  async _getDiscoverInfo_async() {
    let discoverInfo = await LocalStorageManager.getValue_async('discoverInfo');
    if (discoverInfo) {
      this._tabInfos = discoverInfo.tabInfos;
    }
  }

  async _getActiveTabFeedLinkList_async() {
    try {
      this._feedLinkList = await browser.tabs.sendMessage(this._tabInfos.id, {key:'getFeedLinkInfoList'});
    }
    catch(e) {}
  }

  async _getFeedList_async() {
    this._feedList = [];
    for (let feedLink of this._feedLinkList) {
      let feed = await Feed.newByUrl(feedLink);
      this._feedsToProcessList.push(feed);
    }

  }

  _feedLinkInfoListToHtm() {
    let html = '';
    for (let feed of this._feedList) {
      let feedInfo = feed.info;
      let lastUpdate = feed.lastUpdate ? feed.lastUpdate.toLocaleDateString()  + ' ' + feed.lastUpdate.toLocaleTimeString() : 'N/A';
      html += '<tr>';
      html += '<td>' + (feedInfo.channel.title ? feedInfo.channel.title : 'N/A') + '</td>'; //title
      html += '<td>' + '' + '</td>'; //format
      html += '<td>' + lastUpdate + '</td>';
      html += '<td>' + (feedInfo.itemList ? feedInfo.itemList.length  : 0) + '</td>'; //items
      html += '<td>' + feed.url + '</td>';
      html += '</tr>\n';
    }
    return html;
  }

  _displayFeedList() {
    let discoveredFeeds = 'No feeds have been discovered';
    if (this._feedList.length > 0) {
      discoveredFeeds = 'Discovered: ' + this._feedList.length + ' feeds';
    }
    BrowserManager.setInnerHtmlById('discoveredFeeds', discoveredFeeds);
    let html = this._feedLinkInfoListToHtm();
    BrowserManager.setInnerHtmlById('tableContent', html);
  }

  _updateFeedList() {
    this._feedsToProcessTotal = this._feedsToProcessList.length;
    this._feedsToProcessCounter = this._feedsToProcessTotal;
    if (this._feedsToProcessList.length > 0) {
      while (this._feedsToProcessList.length > 0) {
        let feed = this._feedsToProcessList.shift();
        DiscoverFeeds._updateFeed_async(feed);
      }
    }
    else {
      this._feedsUpdateDone();
    }
  }

  static async _updateFeed_async(feed) {
    let self = DiscoverFeeds.instance;
    try {
      await feed.update_async();
    }
    finally {
      self._feedReceived(feed);
      if (--self._feedsToProcessCounter == 0) {
        self._feedsUpdateDone();
      }
    }
  }

  _feedReceived(feed) {
    this._feedList.push(feed);
    let progressValue = Math.round(100 * this._feedList.length / this._feedsToProcessTotal);
    this._progressBar.value = progressValue;
    console.log('progressValue:', progressValue);
  }

  _feedsUpdateDone() {
    this._progressBar.value = 100;
    this._progressBar.hide();
    this._displayFeedList();
  }
}
DiscoverFeeds.instance.init_async();
