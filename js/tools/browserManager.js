/*global browser, commonValues*/
'use strict';
//----------------------------------------------------------------------
let browserManager = {
  async isTabEmpty_async(tab) {
    let isEmpty = (tab.url == 'about:blank' || tab.url == 'about:newtab') && (tab.status == 'complete');
    return isEmpty;
  },
  //------------------------------
  async getActiveTab_async() {
    let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
    return tabInfos[0];
  },
  //------------------------------
  displayNotification(message) {
    browser.notifications.create({
      'type': 'basic',
      'iconUrl': browser.extension.getURL(commonValues.iconDF96Url),
      'title': 'Drop feeds',
      'message': message
    });
  },
  //------------------------------
  bookmarkHasChild(bookmarkItem) {
    //bookmarkItemHasChild
    let result = false;
    if (bookmarkItem.children) {
      result = (bookmarkItem.children.length > 0);
    }
    return result;
  }
};
//----------------------------------------------------------------------
