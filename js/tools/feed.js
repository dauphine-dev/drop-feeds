/*global  browser DefaultValues TextTools, Transfer Compute DateTime FeedParser LocalStorageManager TreeView*/
'use strict';

const feedStatus = {
  UPDATED: 'updated',
  OLD: 'old',
  ERROR: 'error'
};

class Feed { /*exported Feed*/
  static async new(id) {
    let feedItem = new Feed(id);
    await feedItem._constructor_async();
    return feedItem;
  }

  static async newByUrl(url) {
    let feedItem = new Feed(null);
    feedItem._tempUrl = url;
    await feedItem._constructor_async();
    return feedItem;
  }

  static delete_async(feedId) {
    browser.bookmarks.remove(feedId);
  }

  constructor(id) {
    this._storedFeed = DefaultValues.getStoredFeed(id);
    this._bookmark = null;
    this._feedText = null;
    this._error = null;
    this._newUrl = null;
    this._feedItems = null;
    this._ifHttpsHAsFailedRetryWithHttp = DefaultValues.ifHttpsHasFailedRetryWithHttp;
    this._info = {hash: '', info: ''};
  }

  async _constructor_async() {
    if (this._storedFeed.id) {
      this._bookmark =  (await browser.bookmarks.get(this._storedFeed.id))[0];
      this._storedFeed.title =  this._bookmark.title;
      this._storedFeed = await LocalStorageManager.getValue_async(this._storedFeed.id, this._storedFeed);
      if (this._storedFeed.prevValues == undefined) {
        this._storedFeed.prevValues = {hash: null, pubDate: null};
      }
      this._ifHttpsHAsFailedRetryWithHttp = await LocalStorageManager.getValue_async('ifHttpsHasFailedRetryWithHttp', DefaultValues.ifHttpsHasFailedRetryWithHttp);
      if (this._storedFeed.pubDate) { this._storedFeed.pubDate = new Date(this._storedFeed.pubDate); }
      this._storedFeed.isFeedInfo = true;
      this._updateStoredFeedVersion();
    }
  }

  get title() {
    return this._storedFeed.title;
  }

  get status() {
    return this._storedFeed.status;
  }

  get error() {
    return this._error;
  }

  get docUrl() {
    let feedHtml = FeedParser.parseFeedToHtml(this._feedText, this._storedFeed.title);
    let feedBlob = new Blob([feedHtml]);
    let feedHtmlUrl = URL.createObjectURL(feedBlob);
    return feedHtmlUrl;
  }

  get info() {
    if (this._info.hash != this._storedFeed.hash) {
      this._info.hash = this._storedFeed.hash;
      this._info.info = FeedParser.getFeedInfo(this._feedText, this._storedFeed.title);
    }
    return this._info.info;
  }

  get url() {
    return (this._bookmark ? this._bookmark.url : this._tempUrl);
  }

  get lastUpdate() {
    return this._storedFeed.pubDate;
  }

  async update_async() {
    this._savePrevValues();
    let ignoreRedirection = false;
    await this._download_async(ignoreRedirection, false);
    this._runUserScript();
    this._parsePubdate();
    this._computeHashCode();
    this._updateStatus();
    await this.save_async();
  }

  async updateTitle_async() {
    let ignoreRedirection = false;
    await this._download_async(ignoreRedirection, false);
    this._parseTitle();
    await this.save_async();
    browser.bookmarks.update(this._storedFeed.id, {title: this._storedFeed.title});
  }


  async setStatus_async(status) {
    this._storedFeed.status = status;
    this.updateUiStatus_async();
    await this.save_async();
  }

  static getClassName(storedFeed) {
    let itemClass = null;
    switch(storedFeed.status) {
      case feedStatus.UPDATED:
        itemClass = 'feedUnread';
        break;
      case feedStatus.OLD:
        itemClass = 'feedRead';
        break;
      case feedStatus.ERROR:
        itemClass = 'feedError';
        break;
    }
    return itemClass;
  }

  async save_async() {
    if ( this._storedFeed.pubDate == null && this._storedFeed.hash == null) {
      this._storedFeed.pubDate = this._storedFeed.prevValues.pubDate;
      this._storedFeed.hash = this._storedFeed.prevValues.hash;
    }
    await LocalStorageManager.setValue_async(this._storedFeed.id, this._storedFeed);
  }

  async updateUiStatus_async() {
    let feedUiItem = document.getElementById(this._storedFeed.id);
    switch(this.status) {
      case feedStatus.UPDATED:
        feedUiItem.classList.remove('feedError');
        feedUiItem.classList.remove('feedRead');
        feedUiItem.classList.add('feedUnread');
        break;
      case feedStatus.OLD:
        feedUiItem.classList.remove('feedError');
        feedUiItem.classList.remove('feedUnread');
        feedUiItem.classList.add('feedRead');
        break;
      case feedStatus.ERROR:
        feedUiItem.classList.remove('feedRead');
        feedUiItem.classList.remove('feedUnread');
        feedUiItem.classList.add('feedError');
        break;
    }
    TreeView.instance.selectionBarRefresh();
    TreeView.instance.updateAllFolderCount();
  }

  updateUiTitle() {
    let feedUiItem = document.getElementById(this._storedFeed.id);
    if (this._storedFeed.title) {
      feedUiItem.textContent = this._storedFeed.title;
    }
  }

  //private stuff

  _savePrevValues() {
    this._storedFeed.prevValues.hash = this._storedFeed.hash;
    this._storedFeed.prevValues.pubDate = this._storedFeed.pubDate;
    this._storedFeed.hash = null;
    this._storedFeed.pubDate = null;
  }

  async _download_async(ignoreRedirection, forceHttp) {
    this._error = null;
    try {
      let urlNoCache = true;
      await this._downloadEx_async(urlNoCache, forceHttp);
    }
    catch(e1) {
      try {
        let urlNoCache = false;
        await this._downloadEx_async(urlNoCache, forceHttp);
      }
      catch(e2) {
        let retry = null;
        if (e2 === 0) {
          if (!forceHttp) {
            if (this._ifHttpsHAsFailedRetryWithHttp && this.url.startsWith('https:')) {
              try {
                retry = true;
                this._download_async(ignoreRedirection, true);
              }
              catch(e3) {
                /*eslint-disable no-console*/
                //console.log(this.url);
                //console.log(this._storedFeed.title + ': ' + e3);
                /*eslint-enable no-console*/
                this._error = e3;
              }
            }
          }
        }
        if (!retry) {
          /*eslint-disable no-console*/
          //console.log(this.url);
          //console.log(this._storedFeed.title + ': ' + e2);
          /*eslint-enable no-console*/
          this._error = e2;
        }
      }
    }
    if (!ignoreRedirection) {
      await this._manageRedirection_async();
    }
  }

  async _manageRedirection_async(forceHttp) {
    if (this._feedText && this._feedText.includes('</redirect>') && this._feedText.includes('</newLocation>')) {
      let newUrl = TextTools.getInnerText(this._feedText, '<newLocation>', '</newLocation>').trim();
      this._newUrl = newUrl;
      await this._download_async(true, forceHttp);
    }
  }

  async _downloadEx_async(urlNoCache, forceHttp) {
    let url = this.url;
    if (this._newUrl) {
      url = this._newUrl;
    }
    if (forceHttp) {
      url = url.replace('https://', 'http://');
    }
    this._feedText = await Transfer.downloadTextFileEx_async(url, urlNoCache);
    //console.log('this._feedText:', this._feedText);
    this._validFeedText();
  }

  _validFeedText() {
    let error = FeedParser.isValidFeedText(this._feedText);
    if (error) {
      throw error;
    }
    this._feedText = TextTools.decodeHtml(this._feedText);
  }

  _parsePubdate() {
    if (this._error != null)  { return; }
    this._storedFeed.pubDate =  FeedParser.parsePubdate(this._feedText);
  }

  _runUserScript() {
    //this._feedText;
  }

  _parseTitle() {
    if (this._error != null)  { return; }
    this._storedFeed.title =  FeedParser.parseTitle(this._feedText);
  }

  async _updateStatus() {
    if (this._error != null) {
      this._storedFeed.status = feedStatus.ERROR;
    }
    else {
      this._storedFeed.status = feedStatus.OLD;
      if (DateTime.isValid(this._storedFeed.pubDate)) {
        if (!this._storedFeed.prevValues.pubDate || (this._storedFeed.pubDate.valueOf() > this._storedFeed.prevValues.pubDate.valueOf() &&  this._storedFeed.hash.valueOf() != this._storedFeed.prevValues.hash.valueOf())) {
          this._storedFeed.status = feedStatus.UPDATED;
        }
      } else if ((this._storedFeed.hash && !this._storedFeed.prevValues.hash) || (this._storedFeed.hash.valueOf() != this._storedFeed.prevValues.hash.valueOf())) {
        this._storedFeed.status = feedStatus.UPDATED;
      }
    }
  }

  _computeHashCode() {
    if (this._error) { return; }
    let feedBody = FeedParser.getFeedBody(this._feedText);
    this._storedFeed.hash = Compute.hashCode(feedBody);
  }

  _updateStoredFeedVersion() {
    if (this._storedFeed.hasOwnProperty('name')) {
      Object.defineProperty(this._storedFeed, 'title', Object.getOwnPropertyDescriptor(this._storedFeed, 'name'));
      delete this._storedFeed['name'];
    }
    if (this._storedFeed.hasOwnProperty('bkmrkId')) {
      delete this._storedFeed['bkmrkId'];
    }
    if (this._storedFeed.hasOwnProperty('isBkmrk')) {
      delete this._storedFeed['isBkmrk'];
    }
  }
}

