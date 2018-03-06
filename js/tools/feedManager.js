/*global browser topMenu statusBar feedStatus browserManager commonValues feed*/
'use strict';
class feedManager { /*exported feedManager*/
  static get instance() {
    if (!this._instance) {
      this._instance = new feedManager();
    }
    return this._instance;
  }

  constructor() {
    this._feedCheckingInProgress = false;
    this._updatedFeeds = 0;
    this._feedsToCheckList = null;
  }

  async checkFeeds_async(rootElement) {
    if (this._feedCheckingInProgress) { return; }
    this._feedCheckingInProgress = true;
    try {
      this._updatedFeeds = 0;
      topMenu.instance.animateCheckFeedButton(true);
      this._feedsToCheckList = [];
      let feedReadElementList = rootElement.querySelectorAll('.feedRead, .feedError');
      for (let i = 0; i < feedReadElementList.length; i++) {
        let oFeed = null;
        try {
          let feedId = feedReadElementList[i].getAttribute('id');
          oFeed = await feed.new(feedId);
          statusBar.instance.text = 'preparing: ' + oFeed.title;
          this._feedsToCheckList.push(oFeed);
        }
        catch(e) {
          /*eslint-disable no-console*/
          console.log(e);
          /*eslint-enable no-console*/
        }
      }
      await this._checkFeedsInner_async();
    }
    finally {
      statusBar.instance.text = '';
      topMenu.instance.animateCheckFeedButton(false);
      this._displayNotification();
      this._updatedFeeds = 0;
      this._feedCheckingInProgress = false;
    }
  }

  async openOneFeedToTab_async(feedId) {
    let oFeed = await feed.new(feedId);
    statusBar.instance.text = 'Loading ' + oFeed.title;
    await oFeed.update_async();
    let feedHtmlUrl = await oFeed.getDocUrl_async();
    let activeTab = await browserManager.getActiveTab_async();
    let isEmptyActiveTab = await browserManager.isTabEmpty_async(activeTab);
    if(commonValues.instance.alwaysOpenNewTab && !isEmptyActiveTab) {
      await browser.tabs.create({url:feedHtmlUrl, active: commonValues.instance.openNewTabForeground});
    } else {
      await browser.tabs.update(activeTab.id, {url: feedHtmlUrl});
    }
    await oFeed.setStatus_async(feedStatus.OLD);
  }

  async openAllUpdatedFeeds_async(folderId) {
    try {
      topMenu.instance.animateCheckFeedButton(true);
      let feedUpdatedList = document.getElementById(folderId).querySelectorAll('.feedUnread');
      for (let i = 0; i < feedUpdatedList.length; i++) {
        try {
          let feedId = feedUpdatedList[i].getAttribute('id');
          await feedManager.instance.openOneFeedToTab_async(feedId);
        }
        catch(e) {
          /* eslint-disable no-console */
          console.log(e);
          /* eslint-enable no-console */
        }
      }
    }
    finally {
      statusBar.instance.text = '';
      topMenu.instance.animateCheckFeedButton(false);
    }
  }

  async markAllFeedsAsRead_async(folderId) {
    let feedElementList = document.getElementById(folderId).querySelectorAll('.feedUnread, .feedError');
    for (let i = 0; i < feedElementList.length; i++) {
      let feedId = feedElementList[i].getAttribute('id');
      feedElementList[i].classList.remove('feedError');
      feedElementList[i].classList.remove('feedUnread');
      feedElementList[i].classList.add('feedRead');
      let oFeed = await feed.new(feedId);
      await oFeed.setStatus_async(feedStatus.OLD);
    }
  }

  async markAllFeedsAsUpdated_async(folderId) {
    let feedElementList = document.getElementById(folderId).querySelectorAll('.feedRead, .feedError');
    for (let i = 0; i < feedElementList.length; i++) {
      let feedId = feedElementList[i].getAttribute('id');
      feedElementList[i].classList.remove('feedError');
      feedElementList[i].classList.remove('feedUnread');
      feedElementList[i].classList.add('feedRead');
      let oFeed = await feed.new(feedId);
      oFeed.setStatus_async(feedStatus.UPDATED);
    }
  }

  async _checkFeedsInner_async() {
    while (this._feedsToCheckList.length >0) {
      let oFeed = this._feedsToCheckList.shift();
      statusBar.instance.text = 'checking: ' + oFeed.title;
      await oFeed.update_async();
      await oFeed.updateUiStatus();
      if (oFeed.status == feedStatus.UPDATED) {
        this._updatedFeeds++;
      }
    }
  }

  _displayNotification() {
    if (this._updatedFeeds > 1) {
      browserManager.displayNotification(this._updatedFeeds + ' feeds updated');
    }
    if (this._updatedFeeds == 1) {
      browserManager.displayNotification('1 feed updated');
    }
    if (this._updatedFeeds == 0) {
      browserManager.displayNotification('No feed has been updated');
    }
  }

}