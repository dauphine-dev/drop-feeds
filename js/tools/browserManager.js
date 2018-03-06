/*global browser ThemeManager*/
'use strict';
class BrowserManager { /* exported BrowserManager*/
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
      'iconUrl': browser.extension.getURL(ThemeManager.instance.iconDF96Url),
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

  static setInnerHtmlByElement(element, innerHTML) {
    element.innerHTML = innerHTML;
  }

  static setInnerHtmlById(id, innerHTML) {
    document.getElementById(id).innerHTML = innerHTML;
  }

  static loadScript(url, callback){
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function(){ callback(); };
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  }
}
