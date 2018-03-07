/*global feedStatus*/
'use strict';
class DefaultValues { /*exported DefaultValues*/
  static get timeOut() {
    return 10;
  }

  static get displayRootFolder() {
    return true;
  }

  static get alwaysOpenNewTab() {
    return true;
  }

  static get openNewTabForeground() {
    return true;
  }

  static get rootBookmarkId() {
    return undefined;
  }

  static get themeFolderName() {
    return 'dauphine';
  }

  static get updatedFeedsVisible() {
    return false;
  }

  static get foldersOpened() {
    return true;
  }

  static getStoredFolder(folderId) {
    return {id: folderId, checked: true};
  }

  static getStoredFeed(id) {
    return { id: id, hash: null, pubDate: null, status: feedStatus.OLD, isFeedInfo: true, title: null };
  }
}
