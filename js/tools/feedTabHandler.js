/*global browser Feed Listener ListenerProviders DefaultValues*/
'use strict';
class FeedTabHandler { /*exported FeedTabHandler*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._last = { details: null, date: new Date() };
    this._isFeedRegex = /rss|feed|atom|syndicate/i;
    this._handlesFeedTab = DefaultValues.handlesFeedTab;
    let filter = { url: [{ urlMatches: this._isFeedRegex.source }] };
    browser.webNavigation.onBeforeNavigate.addListener((details) => { this._webNavigationOnBeforeNavigate_event(details); }, filter);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'handlesFeedTab', (v) => { this._setHandlesFeedTab_sbscrb(v); }, true);
  }

  _webNavigationOnBeforeNavigate_event(details) {
    if (!this._handlesFeedTab) { return; }
    this._interceptFeedDocuments_async(details);
  }

  async _interceptFeedDocuments_async(details) {
    if (details.frameId != 0) { return; } //we check only the main frame
    let isFeed = details.url.match(this._isFeedRegex);
    if (isFeed) {
      try {
        let now = new Date();
        if (this._isInProgress(details, now)) { return; }
        this._last = { details: details, date: now };
        let feed = await Feed.newByUrl(details.url);
        let tabUrl = details.url;
        browser.tabs.update(details.tabId, { url: 'about:blank' }); // avoid dialog box "Opening"
        await feed.update_async();
        if (feed.error) {
          browser.tabs.update(details.tabId, { url: tabUrl }); // load original page
          return;
        }
        let feedHtmlUrl = await feed.getDocUrl_async(tabUrl);
        browser.tabs.update(details.tabId, { url: feedHtmlUrl }); // load feed preview
      }
      catch (e) { }
    }
  }

  _isInProgress(details, now) {
    let sameAsPrev = (this._last.details && this._last.details.tabId == details.tabId && this._last.details.url == details.url);
    let expirationDate = new Date(this._last.date.getTime() + 2000);
    let isExpired = (now > expirationDate);
    let inProgress = !isExpired && sameAsPrev;
    return inProgress;
  }

  async _setHandlesFeedTab_sbscrb(value) {
    this._handlesFeedTab = value;
  }
}