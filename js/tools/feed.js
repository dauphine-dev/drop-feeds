/*global browser textTools, tagList, transfer compute dateTime feedParser localStorageManager*/
'use strict';
const feedStatus = {
  UPDATED: 'updated',
  OLD: 'old',
  ERROR: 'error'
};

class feed { /*exported feed*/
  static async new(id) {
    let feedItem = new feed(id);
    await feedItem._constructor_async();
    return feedItem;
  }

  constructor(id) {
    this._storedFeed = { id: id, hash: null, pubDate: null, status: feedStatus.OLD, isFeedInfo: true, title: null };
    this._prevValues = {hash: null, pubDate: null};
    this._bookmark = null;
    this._feedText = null;
    this._error = null;
    this._newUrl = null;
  }

  async _constructor_async() {
    this._bookmark = (await browser.bookmarks.get(this._storedFeed.id))[0];
    this._storedFeed = await localStorageManager.getValue_async(this._storedFeed.id, this._storedFeed);
    this._storedFeed.isFeedInfo = true;
    this._storedFeed.title = this._bookmark.title;
    this._updateStoredFeedVersion();
  }

  async update_async() {
    this._savePrevValues();
    let ignoreRedirection = false;
    await this._download_async(ignoreRedirection);
    this._parsePubdate();
    this._computeHashCode();
    this._updateStatus();
    await this.save_async();
  }

  get title() {
    return this._storedFeed.title;
  }

  get status() {
    return this._storedFeed.status;
  }

  async setStatus_async(status) {
    this._storedFeed.status = status;
    this.updateUiStatus();
    await this.save_async();
  }

  get className() {
    let itemClass = null;
    switch(this._storedFeed.status) {
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
    await localStorageManager.setValue_async(this._storedFeed.id, this._storedFeed);
  }

  async getDocUrl_async() {
    let feedHtml = await feedParser.parseFeedToHtml_async(this._feedText);
    let feedBlob = new Blob([feedHtml]);
    let feedHtmlUrl = URL.createObjectURL(feedBlob);
    return feedHtmlUrl;
  }

  updateUiStatus() {
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
  }

  _savePrevValues() {
    this._prevValues.hash = this._storedFeed.hash;
    this._prevValues.pubDate = this._storedFeed.pubDate;
  }

  async _download_async(ignoreRedirection) {
    try {
      let urlNoCache = true;
      await this._downloadEx_async(urlNoCache);
    }
    catch(e) {
      let urlNoCache = false;
      await this._downloadEx_async(urlNoCache);
    }
    if (!ignoreRedirection) {
      await this._manageRedirection_async();
    }
  }

  async _manageRedirection_async() {
    if (this._feedText && this._feedText.includes('</redirect>') && this._feedText.includes('</newLocation>')) {
      let newUrl = textTools.getInnerText(this._feedText, '<newLocation>', '</newLocation>').trim();
      this._newUrl = newUrl;
      await this._download_async(true);
    }
  }

  async _downloadEx_async(urlNoCache) {
    let url = this._bookmark.url;
    if (this._newUrl) {
      url = this._newUrl;
    }
    try {
      this._feedText = await transfer.downloadTextFileEx_async(url, urlNoCache);
      if (this._feedText) {
        let tagRss = null;
        for (let tag of tagList.RSS) {
          if (this._feedText.includes('<' + tag)) {
            tagRss = tag; break;
          }
        }
        if (!tagRss) {
          this._error = 'invalid feed';
        }
        this._feedText = textTools.decodeHtml(this._feedText);
      }
      else {
        this._error = 'feed is empty';
      }
    }
    catch(e) {
      this._error = e;
    }
  }

  _parsePubdate() {
    this._storedFeed.pubDate =  feedParser.parsePubdate(this._feedText);
  }

  async _updateStatus() {
    if (this._error) {
      this._storedFeed.status = feedStatus.ERROR;
    }
    else {
      if (dateTime.isValid(this._storedFeed.pubDate)) {
        if ((this._storedFeed.pubDate > this._prevValues.pubDate) &&  (this._storedFeed.hash != this._prevValues.Hash)) {
          this._storedFeed.status = feedStatus.UPDATED;
        }
      } else if(this._storedFeed.hash != this._prevValues.Hash) {
        this._storedFeed.status = feedStatus.UPDATED;
      }
    }
    return status;
  }

  _computeHashCode() {
    let feedBody = feedParser.getFeedBody(this._feedText);
    this._storedFeed.hash = compute.hashCode(feedBody);
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

