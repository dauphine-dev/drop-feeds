/*global browser DefaultValues StatusBar LocalStorageManager DateTime Listener ListenerProviders bookmarkListeners*/
'use strict';
class BookmarkManager { /*exported BookmarkManager*/
  static get instance() {
    if (!this._instance) {
      this._instance = new BookmarkManager();
    }
    return this._instance;
  }

  constructor() {
    this.lastCreatedBookmarkId = null;
    this.importInProgress = false;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'importInProgress', BookmarkManager.setImportInProgress_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, bookmarkListeners.created, BookmarkManager._bookmarkOnCreated_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, bookmarkListeners.removed, BookmarkManager._bookmarkOnRemoved_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, bookmarkListeners.changed, BookmarkManager._bookmarkOnChanged_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, bookmarkListeners.moved, BookmarkManager._bookmarkOnMoved_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, bookmarkListeners.childrenReordered, BookmarkManager.bookmarkOnChildrenReordered_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, bookmarkListeners.importBegan, BookmarkManager.bookmarkImportBegan_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, bookmarkListeners.importEnded, BookmarkManager.bookmarkImportEnded_sbscrb, true);
  }

  async init_async() {
    this._rootBookmarkId = await LocalStorageManager.getValue_async('rootBookmarkId', DefaultValues.rootBookmarkId);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'rootBookmarkId', BookmarkManager.setRootBookmarkId_sbscrb, true);
  }

  static setImportInProgress_sbscrb(value) {
    BookmarkManager.instance._importInProgress = value;
  }

  static setRootBookmarkId_sbscrb(value) {
    BookmarkManager.instance._rootBookmarkId = value;
  }

  async getRootFolderId_async() {
    // is rootBookmarkId exist ?
    if (this._rootBookmarkId == undefined)  {
    //no -> create a root folder
      this._rootBookmarkId = await this._createRootFolder_async();
    }
    else {
    //yes -> try to get the root folder
      try {
        await browser.bookmarks.getSubTree(this._rootBookmarkId);
      }
      catch(e) {
      //has failed then create a root folder
        this._rootBookmarkId = await this._createRootFolder_async();
      }
    }
    return this._rootBookmarkId;
  }

  static async _bookmarkOnCreated_sbscrb(id, bookmarkInfo) {
    let self = BookmarkManager.instance;
    if (self._importInProgress) { return; }
    self._lastCreatedBookmarkId = id;
    let isChid =  await self._isDropfeedsChildBookmark_async(bookmarkInfo.parentId);
    if (!isChid) { return; }
    LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  static async _bookmarkOnRemoved_sbscrb(id, removeInfo) {
    let self = BookmarkManager.instance;
    if (self._importInProgress) { return; }
    let isChid =  await self._isDropfeedsChildBookmark_async(removeInfo.parentId);
    if (!isChid) { return; }
    LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  static async _bookmarkOnChanged_sbscrb(id) {
    let self = BookmarkManager.instance;
    if (self.instance._importInProgress) { return; }
    let isChid =  await self._isDropfeedsChildBookmark_async(id);
    if (!isChid) { return; }
    LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  static async _bookmarkOnMoved_sbscrb(id, moveInfo) {
    let self = BookmarkManager.instance;
    if (self._importInProgress) { return; }
    let isChid =  await self._isDropfeedsChildBookmark_async(moveInfo.parentId);
    if (!isChid) {
      isChid =  await self._isDropfeedsChildBookmark_async(moveInfo.oldParentId);
    }
    if (!isChid) { return; }
    if (id == self._lastCreatedBookmarkId) {
      StatusBar.instance.text = 'To add a Feed use the button above !';
      await DateTime.delay_async(1);
      StatusBar.instance.text = '';
    }
    LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  static async _bookmarkOnChildrenReordered_sbscrb(id) {
    let self = BookmarkManager.instance;
    if (self.instance._importInProgress) { return; }
    let isChid =  await self._isDropfeedsChildBookmark_async(id);
    if (!isChid) { return; }
    LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  static async _bookmarkImportBegan_sbscrb() {
    BookmarkManager.instance._importInProgress = true;
  }

  static async _bookmarkImportEnded_sbscrb() {
    BookmarkManager.instance._importInProgress = false;
    LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  async _createRootFolder_async() {
    let rootBookmarkId = null;

    let bookmarkItems = await browser.bookmarks.search({title: 'Drop Feeds'});
    if (bookmarkItems) {
      if (bookmarkItems[0]) {
        rootBookmarkId = bookmarkItems[0].id;
      }
    }

    if (!rootBookmarkId) {
      rootBookmarkId = await this._createDefaultBookmark_async();
    }

    await LocalStorageManager.setValue_async('rootBookmarkId', rootBookmarkId);
    return rootBookmarkId;
  }

  async _isDropfeedsChildBookmark_async(id) {
    let isChild = false;
    if (id == this._rootBookmarkId) { return true; }
    let subTree = null;
    try {
      subTree = await browser.bookmarks.getSubTree(this._rootBookmarkId);
    }
    catch(e) {}
    if (subTree) {
      let children = subTree[0].children;
      if (children) {
        isChild = this._isChildBookmark(children, id);
      }
    }
    return isChild;
  }

  _isChildBookmark(children, id) {
    for (let chid of children) {
      if (chid.id == id) {
        return true;
      }
      if(chid.children) {
        let isChild = this._isChildBookmark(chid.children, id);
        if (isChild) {
          return true;
        }
      }
    }
    return false;
  }

  async _createDefaultBookmark_async() {
    let rootBookmark = await browser.bookmarks.create({ title: 'Drop Feeds' });
    await browser.bookmarks.create({
      parentId: rootBookmark.id,
      title: 'The Mozilla Blog',
      url: 'https://blog.mozilla.org/feed/'
    });
    return rootBookmark.id;
  }
}
