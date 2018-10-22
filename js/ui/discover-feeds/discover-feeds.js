/*global browser BrowserManager LocalStorageManager Feed ProgressBar SelectionRaw Dialogs CssManager*/
'use strict';
class DiscoverFeeds {
  static get instance() { return (this._instance = this._instance || new this()); }

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
    this._updateLocalizedStrings();
    this._progressBar = new ProgressBar('progressBar', true);
    this._progressBar.show();
    this._progressBar.value = 1;
    await this._getDiscoverInfo_async();
    await this._getActiveTabFeedLinkList_async();
    await this._getFeedList_async();
    await this._updateFeedList();
    document.getElementById('addFeedButton').addEventListener('click', (e) => { this._addFeedButtonOnClicked_event(e); });
    document.getElementById('closeButton').addEventListener('click', (e) => { this._closeButtonOnClicked_event(e); });
    this.addFeedButtonEnabled = this._addFeedButtonEnabled;
    try {
      this._discoverInfoWinId = (await LocalStorageManager.getValue_async('discoverInfoWinId')).winId;
    }
    catch(e) {}
    LocalStorageManager.setValue_async('discoverInfoWinId', null);
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
    CssManager.setElementEnableById('addFeedButton', value);
  }

  _updateLocalizedStrings() {
    document.title = browser.i18n.getMessage('disDiscoverFeeds');
    document.getElementById('progressBar').textContent = browser.i18n.getMessage('disDiscoveringFeeds');
    document.getElementById('thTitle').textContent = browser.i18n.getMessage('disTitle');
    document.getElementById('thFormat').textContent = browser.i18n.getMessage('disFormat');
    document.getElementById('thLastUpdate').textContent = browser.i18n.getMessage('disLastUpdate');
    document.getElementById('thItems').textContent = browser.i18n.getMessage('disItems');
    document.getElementById('thUrl').textContent = browser.i18n.getMessage('disUrl');
    document.getElementById('addFeedButton').textContent = browser.i18n.getMessage('disAddFeed');
    document.getElementById('closeButton').textContent = browser.i18n.getMessage('disClose');
  }

  async _getDiscoverInfo_async() {
    let discoverInfo = await LocalStorageManager.getValue_async('discoverInfo');
    if (discoverInfo) {
      this._tabInfos = discoverInfo.tabInfos;
    }
  }

  async _getActiveTabFeedLinkList_async() {
    try {
      this._feedLinkList = await browser.tabs.sendMessage(this._tabInfos.id, {key:'discoverFeedLinkInfoList'});
    }
    catch(e) {}
    if (!this._feedLinkList) { this._feedLinkList= []; }
  }

  async _getFeedList_async() {
    this._feedList = [];
    for (let feedLink of this._feedLinkList) {
      let feed = await Feed.newByUrl(feedLink);
      this._feedsToProcessList.push(feed);
    }

  }

  async _sortFeedList()  {
    for (let feed of this._feedList) {
      // feed.info is not evaluated during sort (but with a delay), then compute it and then store it in the feed object
      feed.tmpInfo = feed.info;
    }
    this._feedList.sort((feed1, feed2) => {
      let feed1Num = 0;
      let feed2Num = 0;
      let feedInfo1 = feed1.tmpInfo;
      let feedInfo2 = feed2.tmpInfo;
      //Sort 1st on have info
      if (feedInfo1) { feed1Num += 32; }
      if (feedInfo2) { feed2Num += 32; }
      if (feedInfo1 && feedInfo1.format) { feed1Num += 16; }
      if (feedInfo2 && feedInfo2.format) { feed2Num += 16; }
      //Sort 2nd on have lastUpdate
      if (feed1.lastUpdate > feed2.lastUpdate) { feed1Num += 8; }
      if (feed1.lastUpdate < feed2.lastUpdate) { feed2Num +=8; }
      //Sort 3rt on items number
      let feed1ItemListLength = feedInfo1 && feedInfo1.itemList ? feedInfo1.itemList.length : -1;
      let feed2ItemListLength = feedInfo2 && feedInfo2.itemList ? feedInfo2.itemList.length : -1;
      if (feed1ItemListLength > feed2ItemListLength) { feed1Num += 4; }
      if (feed1ItemListLength < feed2ItemListLength) { feed2Num += 4; }
      //Sort 4th on title
      let feed1Title = feedInfo1 && feedInfo1.channel ? feedInfo1.channel.title : null;
      let feed2Title = feedInfo2 && feedInfo2.channel ? feedInfo2.channel.title : null;
      feed1Title = feed1Title == '' ? null : feed1Title;
      feed2Title = feed2Title == '' ? null : feed2Title;
      if (feed1Title && feed2Title) {
        if (feed1Title < feed2Title) { feed1Num += 2; }
        if (feed1Title > feed2Title) { feed2Num += 2; }
      }
      else {
        if (feed1Title && !feed2Title) { feed1Num += 2; }
        if (!feed1Title && feed2Title) { feed2Num += 2; }
      }
      //Sort 5th on url
      if (feed1.url > feed2.url) { feed1Num += 1; }
      if (feed1.url < feed2.url) { feed1Num += 1; }
      if (feed1Num > feed2Num) { return -1; }
      if (feed1Num < feed2Num) { return 1; }
      return 0;
    });
  }

  _displayFeedList() {
    let discoveredFeeds = browser.i18n.getMessage('disNoFeedsHaveBeenDiscovered');
    if (this._feedList.length > 0) {

      discoveredFeeds = browser.i18n.getMessage('disDiscovered') + ': ' + this._feedList.length + ' ' + browser.i18n.getMessage('disFeeds');
    }
    BrowserManager.setInnerHtmlById('discoveredFeeds', discoveredFeeds);
    let html = this._feedLinkInfoListToHtm();
    BrowserManager.setInnerHtmlById('tableContent', html);
    let fstLine = document.getElementById('tableContent').getElementsByTagName('tr')[0];
    this._selectRaw(fstLine);
  }

  _feedLinkInfoListToHtm() {
    let html = `
      <table>
      <thead>
        <tr>
          <th id="thTitle" >Title</th>
          <th id="thFormat">Format</th>
          <th id="thLastUpdate">Last update</th>
          <th id="thItems">Items</th>
          <th id="thUrl">Url</th>
        </tr>
      </thead>
      <tbody id="tableContent">`;
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
    html += `
      </tbody>
      </table>`;
    return html;
  }

  _updateFeedList() {
    this._feedsToProcessTotal = this._feedsToProcessList.length;
    this._feedsToProcessCounter = this._feedsToProcessTotal;
    if (this._feedsToProcessList.length > 0) {
      while (this._feedsToProcessList.length > 0) {
        let feed = this._feedsToProcessList.shift();
        this._updateFeed_async(feed);
      }
    }
    else {
      this._feedsUpdateDone();
    }
  }

  async _updateFeed_async(feed) {
    try {
      await feed.update_async();
    }
    finally {
      this._feedReceived(feed);
      if (--this._feedsToProcessCounter == 0) {
        this._feedsUpdateDone();
      }
    }
  }

  _feedReceived(feed) {
    this._feedList.push(feed);
    let progressValue = Math.round(100 * this._feedList.length / this._feedsToProcessTotal);
    this._progressBar.value = progressValue;
  }

  _feedsUpdateDone() {
    this._progressBar.value = 99;
    this._sortFeedList();
    this._displayFeedList();
    this._addTableRawClickEvents();
    this._progressBar.value = 100;
    this._progressBar.hide();
  }

  async _addFeedButtonOnClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    await this._openSubscribeDialog_async();
    browser.windows.remove(this._discoverInfoWinId);
  }

  async _closeButtonOnClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    browser.windows.remove(this._discoverInfoWinId);
  }

  _addTableRawClickEvents() {
    let elTrList = document.getElementById('tableContent').querySelectorAll('tr');
    for (let elTr of elTrList) {
      elTr.addEventListener('click', (e) => { this._tableRawOnClick_event(e); });
    }
  }

  async _tableRawOnClick_event(event) {
    this._selectRaw(event.target.parentNode);
  }

  _selectRaw(trElement) {
    SelectionRaw.instance.put(trElement);
    this.addFeedButtonEnabled = (this.selectedFeed && this.selectedFeed.info.format != null);
  }

  async _openSubscribeDialog_async() {
    await LocalStorageManager.setValue_async('subscribeInfo', {feedTitle: this.selectedFeed.info.channel.title, feedUrl: this.selectedFeed.url});
    await BrowserManager.openPopup_async(Dialogs.subscribeUrl, 778, 500, '');
  }

}
DiscoverFeeds.instance.init_async();
