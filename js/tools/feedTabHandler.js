/*global browser Feed Listener ListenerProviders DefaultValues*/
'use strict';
class FeedTabHandler { /*exported FeedTabHandler*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._errorList = [];
    this._last = { timeStamp: 0 };
    this._lastNoTime = { timeStamp: 0 };
    this._isFeedRegex = /rss|feed|atom|syndicate|xml|json/i;
    this._handlesFeedTab = DefaultValues.handlesFeedTab;
    this._preventOpenWith = DefaultValues.preventOpenWith;    
    let filter = { url: [{ urlMatches: this._isFeedRegex.source }] };
    browser.webNavigation.onBeforeNavigate.addListener((details) => { this._webNavigationOnBeforeNavigate_event(details); }, filter);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'handlesFeedTab', (v) => { this._setHandlesFeedTab_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'preventOpenWith', (v) => { this._setPreventOpenWith_sbscrb(v); }, true);
  }

  async _webNavigationOnBeforeNavigate_event(details) {
    if (!this._handlesFeedTab) { return; }
    await this._interceptFeedDocuments_async(details);
  }

  async _interceptFeedDocuments_async(details) {
    let detailsNoTime = details;
    detailsNoTime.timeStamp = 0;
    if (details.frameId != 0) { return; } //we check only the main frame
    let isFeed = details.url.match(this._isFeedRegex);
    if (isFeed) {
      if (this._isInErrorList(detailsNoTime)) { return; }
      try {
        if (this._isInProgress(details, detailsNoTime)) { return; }
        this._last = details;
        this._lastNoTime = detailsNoTime;
        let feed = await Feed.newByUrl(details.url);
        if (this._preventOpenWith) {
          browser.tabs.update(details.tabId, { url: 'about:blank' }); // avoid dialog box "Opening"
        }
        await feed.update_async();
        if (feed.error) {
          this._errorList.push(detailsNoTime);
          this._errorList = this._errorList.slice(-1024); // limit array size to last 1024 entries
          if (this._preventOpenWith) {
            browser.tabs.update(details.tabId, { url: details.url }); // load original page
          }
          return;
        }
        let feedHtmlUrl = await feed.getDocUrl_async(details.url);
        browser.tabs.update(details.tabId, { url: feedHtmlUrl }); // load feed preview
      }
      catch (e) { }
    }
  }

  _isInErrorList(detailsNoTime) {
    //let isInErrorList = this._errorList.includes(detailsNoTime);
    let isInErrorList = this._errorList.some(d =>
      d.url == detailsNoTime.url &&
      d.timeStamp == detailsNoTime.timeStamp &&
      d.frameId == detailsNoTime.frameId &&
      d.parentFrameId == detailsNoTime.parentFrameId &&
      d.tabId == detailsNoTime.tabId &&
      d.windowId == detailsNoTime.windowId
    );
    return isInErrorList;
  }

  _isInProgress(details, detailsNoTime) {
    let isExpired = (details.timeStamp - this._last.timeStamp > 2000);
    let sameAsPrev = (detailsNoTime == this._lastNoTime);
    let inProgress = !isExpired && sameAsPrev;
    return inProgress;
  }

  async _setHandlesFeedTab_sbscrb(value) {
    this._handlesFeedTab = value;
  }

  async _setPreventOpenWith_sbscrb(value) {
    this._preventOpenWith = value;
  }
  
}