/*global textTools, tagList, transfer*/
'use strict';
//----------------------------------------------------------------------
class feed { /*exported feed*/
  constructor(index, id, bookmark) {
    this.index = index;
    this.id = id;
    this.title = bookmark.title;
    this.bookmark = bookmark;
    this.pubDate = null;
    this.feedText = null;
    this.error = null;
    this.newUrl = null;
  }

  async download_async(ignoreRedirection) {
    try {
      await this._download_async(true);
    }
    catch(e) {
      await this._download_async(false);
    }
    if (!ignoreRedirection) {
      await this._manageRedirection_async();
    }
  }

  async _manageRedirection_async() {
    if (this.feedText && this.feedText.includes('</redirect>') && this.feedText.includes('</newLocation>')) {
      let newUrl = textTools.getInnerText(this.feedText, '<newLocation>', '</newLocation>').trim();
      this.newUrl = newUrl;
      await this.download_async(true);
    }
  }

  async _download_async(urlNoCache) {
    let url = this.bookmark.url;
    if (this.newUrl) {
      url = this.newUrl;
    }
    try {
      this.feedText = await transfer.downloadTextFileEx_async(url, urlNoCache);
      let tagRss = null;
      for (let tag of tagList.RSS) {
        if (this.feedText.includes('<' + tag)) { tagRss = tag; break; }
      }
      if (!tagRss) {
        this.error = 'it is not a rss file';
      }
    }
    catch(e) {
      this.error = e;
    }
  }
}
