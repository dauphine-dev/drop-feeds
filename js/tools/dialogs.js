/* global BrowserManager LocalStorageManager*/
'use strict';
class Dialogs  { /*exported Dialogs*/
  static get subscribeUrl() { return '/html/subscribe.html'; }
  static get discoverFeedsUrl() { return '/html/discover-feeds.html'; }
  static get feedListUrl() { return '/html/feedList.html'; }
  static get subscribeButtonUrl() { return '/html/subscribeThisFeed.html'; }

  static async openSubscribeDialog_async(title, url) {
    await LocalStorageManager.setValue_async('subscribeInfo', {feedTitle: title, feedUrl: url});
    let win = await BrowserManager.openPopup_async(Dialogs.subscribeUrl, 1040, 700, '');
    await LocalStorageManager.setValue_async('subscribeInfoWinId', {winId: win.id});
  }
}
