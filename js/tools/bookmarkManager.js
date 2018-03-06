/*global browser, CommonValues, StatusBar, LocalStorageManager, DateTime*/
'use strict';
class BookmarksInfo {
  static get instance() {
    if (!this._instance) {
      this._instance = new BookmarksInfo();
    }
    return this._instance;
  }

  constructor() {
    this.lastCreatedBookmarkId = null;
    this.importInProgress = false;
  }
}
class BookmarkManager { /*exported BookmarkManager*/
  static addListeners() {
    browser.bookmarks.onCreated.addListener(BookmarkManager._bookmarkOnCreated_event);
    browser.bookmarks.onRemoved.addListener(BookmarkManager._bookmarkOnRemoved_event);
    browser.bookmarks.onChanged.addListener(BookmarkManager._bookmarkOnChanged_event);
    browser.bookmarks.onMoved.addListener(BookmarkManager._bookmarkOnMoved_event);
  //browser.bookmarks.onChildrenReordered.addListener(bookmarkOnChildrenReorderedEvent);
  //browser.bookmarks.onImportBegan.addListener(bookmarkImportBeganEvent);
  //browser.bookmarks.onImportEnded.addListener(bookmarkImportEndedEvent);
  }

  static async getRootFolderId_async() {
    let rootBookmarkId = await LocalStorageManager.getValue_async('rootBookmarkId', undefined);
    // is rootBookmarkId exist ?
    if (rootBookmarkId == undefined)  {
    //no -> create a root folder
      rootBookmarkId = await BookmarkManager._createRootFolder_async();
    }
    else {
    //yes -> try to get the root folder
      try {
        await browser.bookmarks.getSubTree(rootBookmarkId);
      }
      catch(e) {
      //has failed then create a root folder
        rootBookmarkId = await BookmarkManager._createRootFolder_async();
      }
    }
    return rootBookmarkId;
  }

  static getDefaultStoredFolder(folderId) {
    return {id: folderId, checked: true};
  }

  static async _bookmarkOnCreated_event(id, bookmarkInfo) {
    if (BookmarksInfo.instance.importInProgress) { return; }
    BookmarksInfo.instance.lastCreatedBookmarkId = id;
    let isChid =  await BookmarkManager._isDropfeedsChildBookmark_async(bookmarkInfo.parentId);
    if (!isChid) { return; }
    LocalStorageManager.setValue_async('reloadPanel', Date.now());
  }

  static async _bookmarkOnRemoved_event(id, removeInfo) {
    if (BookmarksInfo.instance.importInProgress) { return; }
    let isChid =  await BookmarkManager._isDropfeedsChildBookmark_async(removeInfo.parentId);
    if (!isChid) { return; }
    LocalStorageManager.setValue_async('reloadPanel', Date.now());
  }

  static async _bookmarkOnChanged_event(id) {
    if (BookmarksInfo.instance.importInProgress) { return; }
    let isChid =  await BookmarkManager._isDropfeedsChildBookmark_async(id);
    if (!isChid) { return; }
    LocalStorageManager.setValue_async('reloadPanel', Date.now());
  }

  static async _bookmarkOnMoved_event(id, moveInfo) {
    if (BookmarksInfo.instance.importInProgress) { return; }
    let isChid =  await BookmarkManager._isDropfeedsChildBookmark_async(moveInfo.parentId);
    if (!isChid) {
      isChid =  await BookmarkManager._isDropfeedsChildBookmark_async(moveInfo.oldParentId);
    }
    if (!isChid) { return; }
    if (id == BookmarksInfo.instance.lastCreatedBookmarkId) {
      StatusBar.instance.text = 'To add a Feed use the button above !';
      await DateTime.delay_async(1);
      StatusBar.instance.text = '';
    }
    LocalStorageManager.setValue_async('reloadPanel', Date.now());
  }

  static async _bookmarkOnChildrenReordered_event(id) {
    if (BookmarksInfo.instance.importInProgress) { return; }
    let isChid =  await BookmarkManager._isDropfeedsChildBookmark_async(id);
    if (!isChid) { return; }
    LocalStorageManager.setValue_async('reloadPanel', Date.now());
  }

  static async _bookmarkImportBegan_event() {
    BookmarksInfo.instance.importInProgress = true;
  }

  static async _bookmarkImportEnded_event() {
    BookmarksInfo.instance.importInProgress = false;
    LocalStorageManager.setValue_async('reloadPanel', Date.now());
  }

  static async _createRootFolder_async() {
    let rootBookmarkId = null;

    let bookmarkItems = await browser.bookmarks.search({title: 'Drop feeds'});
    if (bookmarkItems) {
      if (bookmarkItems[0]) {
        rootBookmarkId = bookmarkItems[0].id;
      }
    }

    if (!rootBookmarkId) {
      rootBookmarkId = await BookmarkManager._createDefaultBookmark_async();
    }

    await LocalStorageManager.setValue_async('rootBookmarkId', rootBookmarkId);
    return rootBookmarkId;
  }

  static async _isDropfeedsChildBookmark_async(id) {
    let isChild = false;
    if (id == CommonValues.instance.rootBookmarkId) { return true; }
    let subTree = await browser.bookmarks.getSubTree(CommonValues.instance.rootBookmarkId);
    let children = subTree[0].children;
    if (children) {
      isChild = BookmarkManager._isChildBookmark(children, id);
    }
    return isChild;
  }

  static _isChildBookmark(children, id) {
    for (let chid of children) {
      if (chid.id == id) {
        return true;
      }
      if(chid.children) {
        let isChild = BookmarkManager._isChildBookmark(chid.children, id);
        if (isChild) {
          return true;
        }
      }
    }
    return false;
  }

  static async _createDefaultBookmark_async() {
    let rootBookmark = await browser.bookmarks.create({ title: 'Drop feeds' });
    await browser.bookmarks.create({
      parentId: rootBookmark.id,
      title: 'The Mozilla Blog',
      url: 'https://blog.mozilla.org/Feed/'
    });
    return rootBookmark.id;
  }
}
