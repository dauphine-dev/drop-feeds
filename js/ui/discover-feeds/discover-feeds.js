/*global browser BrowserManager LocalStorageManager Feed ProgressBar SelectionRaw Dialogs*/
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
    this._addFeedButtonEnabled = false;
  }

  async init_async() {
    this._progressBar = new ProgressBar('progressBar', true);
    this._progressBar.show();
    this._progressBar.value = 1;
    await this._getDiscoverInfo_async();
    await this._getActiveTabFeedLinkList_async();
    await this._getFeedList_async();
    await this._updateFeedList();
    document.getElementById('addFeedButton').addEventListener('click', DiscoverFeeds._addFeedButtonOnClicked_event);
    document.getElementById('closeButton').addEventListener('click', DiscoverFeeds._closeButtonOnClicked_event);
    this.addFeedButtonEnabled = this._addFeedButtonEnabled;
  }

  get selectedFeed() {
    let selectedFeed = null;
    if (SelectionRaw.instance.selectedRaw) {
      selectedFeed = this._feedList[SelectionRaw.instance.selectedRaw-1];
    }
    return selectedFeed;
  }

  set addFeedButtonEnabled(value) {
    this._addFeedButtonEnabled = value;
    document.getElementById('addFeedButton').style.opacity = (value ? '1' : '0.2');
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
    let pos = 1;
    for (let feed of this._feedList) {
      let feedInfo = feed.info;
      let lastUpdate = feed.lastUpdate ? feed.lastUpdate.toLocaleDateString()  + ' ' + feed.lastUpdate.toLocaleTimeString() : 'N/A';
      html += '<tr pos="' + pos++ + '">';
      html += '<td>' + (feedInfo.channel.title ? feedInfo.channel.title : 'N/A') + '</td>';
      html += '<td>' + (feedInfo.format ? feedInfo.format : 'N/A') + '</td>';
      html += '<td>' + lastUpdate + '</td>';
      html += '<td>' + (feedInfo.itemList ? feedInfo.itemList.length  : 0) + '</td>';
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
    let fstLine = document.getElementById('tableContent').getElementsByTagName('tr')[0];
    this._selectRaw(fstLine);
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
  }

  _feedsUpdateDone() {
    this._progressBar.value = 100;
    this._progressBar.hide();
    this._displayFeedList();
    this._addTableRawClickEvents();
  }

  static _addFeedButtonOnClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    DiscoverFeeds.instance._openSubscribeDialog();
    window.close();
  }

  static _closeButtonOnClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    window.close();
  }

  _addTableRawClickEvents() {
    let elTrList = document.getElementById('tableContent').querySelectorAll('tr');
    for (let elTr of elTrList) {
      elTr.addEventListener('click', DiscoverFeeds._tableRawOnClick_event);
    }
  }

  static async _tableRawOnClick_event(event) {
    DiscoverFeeds.instance._selectRaw(event.target.parentNode);
  }

  _selectRaw(trElement) {
    SelectionRaw.instance.put(trElement);
    this.addFeedButtonEnabled = (this.selectedFeed.info.format != null);
  }

  async _openSubscribeDialog() {
    LocalStorageManager.setValue_async('subscribeInfo', {feedTitle: this.selectedFeed.info.channel.title, feedUrl: this.selectedFeed.url});
    BrowserManager.openPopup_async(Dialogs.subscribeUrl, 778, 500, '');
  }

}
DiscoverFeeds.instance.init_async();
