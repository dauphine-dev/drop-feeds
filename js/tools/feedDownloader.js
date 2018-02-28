/*global tagList, getInnerText1, downloadFileAsync*/
'use strict';
//----------------------------------------------------------------------
class feed {
  constructor(index, id, title, bookmark, pubDate) {
    this.index = index;
    this.id = id;
    this.title = title;
    this.bookmark = bookmark;
    this.pubDate = pubDate;
    this.feedText = null;
    this.error = null;
    this.newUrl = null;
  }

  async download_async() {
    let feedOj = await this._download_async();
    if (feedOj.feedText.includes('</redirect>') && feedOj.feedText.includes('</newLocation>')) {
      let newUrl = getInnerText1(feedOj.feedText, '<newLocation>', '</newLocation>').trim();
      feedOj.newUrl = newUrl;
      try {
        feedOj = this._download_async(true);
      }
      catch(e) {
        feedOj = this._download_async(false);
      }
    }
    return feedOj;

  }

  async _download_async(urlNoCache) {
    let url = this.bookmark.url;
    if (this.newUrl) {
      url = this.newUrl;
    }
    try {
      let responseText = await downloadFileAsync(url, urlNoCache);
      let tagRss = null;
      for (let tag of tagList.RSS) {
        if (responseText.includes('<' + tag)) { tagRss = tag; break; }
      }
      if (tagRss) {
        this.feedText = responseText;
      }
      else {
        this.error = 'it is not a rss file';
      }
    }
    catch(e) {
      this.error = e;
    }
  }

}
