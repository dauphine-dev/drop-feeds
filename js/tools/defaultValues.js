/*global feedStatus*/
'use strict';
class DefaultValues { /*exported DefaultValues*/

  /*
  */
  static get asynchronousFeedChecking()      { return true; }
  static get timeOut()                       { return 60; }
  static get displayRootFolder()             { return true; }
  static get alwaysOpenNewTab()              { return true; }
  static get openNewTabForeground()          { return true; }
  static get rootBookmarkId()                { return undefined; }
  static get themeFolderName()               { return 'dauphine'; }
  static get updatedFeedsVisible()           { return false; }
  static get foldersOpened()                 { return true; }
  static get maxItemsInUnifiedView()         { return 100; }
  static get feedItemList()                  { return false; }
  static get feedItemListToolbar()           { return false; }
  static get feedItemDescriptionTooltips()   { return false; }
  static get ifHttpsHasFailedRetryWithHttp() { return true; }
  static get currentOptionTabName()          { return 'generalTab'; }
  static get showFeedUpdatePopup()           { return true; }
  static get automaticFeedUpdates()          { return false; }
  static get automaticFeedUpdateMinutes()    { return 30; }
  static get showErrorsAsUnread()            { return false; }

  static getStoredFolder(folderId) {
    return {id: folderId, checked: true};
  }

  static getStoredFeed(id) {
    return { id: id, hash: null, pubDate: null, status: feedStatus.UPDATED, isFeedInfo: true, title: null };
  }

  static getDefaultItem(id) {
    return { id: id, number: 0, title: '', link: '', description: '', category : '', author: '', pubDate: '', pubDateText: '' };
  }

  static getDefaultFeedInfo() {
    return { tagItem: null, channel: null, itemList: [] };
  }

  static getDefaultChannelInfo() {
    return { encoding: '', title: '', link: '', description: '', category : '', pubDate: '' };
  }

}
