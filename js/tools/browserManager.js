/*global browser, themeManager*/
'use strict';
//----------------------------------------------------------------------
class browserManager { /* exported browserManager*/
  static async isTabEmpty_async(tab) {
    let isEmpty = (tab.url == 'about:blank' || tab.url == 'about:newtab') && (tab.status == 'complete');
    return isEmpty;
  }

  static async getActiveTab_async() {
    let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
    return tabInfos[0];
  }

  static displayNotification(message) {
    browser.notifications.create({
      'type': 'basic',
      'iconUrl': browser.extension.getURL(themeManager.instance.iconDF96Url),
      'title': 'Drop feeds',
      'message': message
    });
  }

  static bookmarkHasChild(bookmarkItem) {
    let result = false;
    if (bookmarkItem.children) {
      result = (bookmarkItem.children.length > 0);
    }
    return result;
  }
}
//----------------------------------------------------------------------
