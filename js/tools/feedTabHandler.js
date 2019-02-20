/*global browser Feed*/
'use strict';
class FeedTabHandler { /*exported FeedTabHandler*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._isFeedRegex = /rss|feed|atom|syndicate/i;
    this._last = { details: null, date: null, isFeedOk: null };
    let filter = { url: [{ urlMatches: this._isFeedRegex.source }] };
    browser.webNavigation.onBeforeNavigate.addListener((details) => { this._webNavigationOnBeforeNavigate_event(details); }, filter);
  }

  _webNavigationOnBeforeNavigate_event(details) {
    this._interceptFeedDocuments_async(details);
  }

  async _interceptFeedDocuments_async(details) {
    if (details.frameId != 0) { return; } //we check only the main frame

    let isFeed = details.url.match(this._isFeedRegex);
    if (isFeed) {
      try {
        let feedHtmlUrl = await this._getFeedDocument_async(details);
        if (feedHtmlUrl) {
          browser.tabs.update(details.tabId, { url: feedHtmlUrl });
        }
      }
      catch (e) { }
    }
  }

  _preventDialogOpening(details) {
    //preventDialogOpening must be called before feed.update_async otherwise it doesn't work
    // but we need to prevent looping tab loading, then if the call is too recent then we do nothing
    // (if fact we update the tab url with about:blank in the call if the feed is valid)
    let now = new Date();
    let tooRecent = false;
    if (this._last.date) {
      tooRecent = (now < new Date(this._last.date.getTime() + 2000));
      tooRecent = (tooRecent && this._last.details.tabId == details.tabId && this._last.details.url == details.url);
    }
    if (tooRecent) { return true; }
    this._last.details = details;
    this._last.date = now;
    // Prevent dialog "Opening..." by updating the tab with same url
    //  then if it is not a valid feed the initial document target will be displayed
    browser.tabs.update(details.tabId, { url: details.url }); 
    return false;
  }

  async _getFeedDocument_async(details) {
    let feed = await Feed.newByUrl(details.url);
    //preventDialogOpening must be called before feed.update_async otherwise it doesn't work
    let tooRecent = this._preventDialogOpening(details);
    if (tooRecent) {
    //prevent dialog "opening" must be called before feed.update_async otherwise it doesn't work
    // if we are here it the second call and it time we know it feed is ok then we can finally 
    //  prevent dialog "opening" by using about:blank url
      browser.tabs.update(details.tabId, { url: 'about:blank' });
      return; 
    }
    await feed.update_async();
    if (feed.error) { return; }
    this._last.isFeedOk = true;
    let addSubscribeButton = true;
    let feedHtmlUrl = await feed.getDocUrl_async(addSubscribeButton);
    return feedHtmlUrl;
  }

  _addSubscribeButton() {

  }
}