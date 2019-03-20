/*global browser DefaultValues FeedsStatusBar LocalStorageManager DateTime Listener ListenerProviders bookmarkListeners FeedsTreeView*/
'use strict';
class BookmarkManager { /*exported BookmarkManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._lastCreatedBookmarkId = null;
    this._importInProgress = false;
    this._importInProgressCount = 0;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'importInProgress', (v) => { this.setImportInProgress_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.bookmarks, bookmarkListeners.created, (id, info) => { this._bookmarkOnCreated_sbscrb(id, info); }, true);
    Listener.instance.subscribe(ListenerProviders.bookmarks, bookmarkListeners.removed, (id, info) => { this._bookmarkOnRemoved_sbscrb(id, info); }, true);
    Listener.instance.subscribe(ListenerProviders.bookmarks, bookmarkListeners.changed, (v) => { this._bookmarkOnChanged_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.bookmarks, bookmarkListeners.moved, (id, info) => { this._bookmarkOnMoved_sbscrb(id, info); }, true);
    Listener.instance.subscribe(ListenerProviders.bookmarks, bookmarkListeners.childrenReordered, (v) => { this.bookmarkOnChildrenReordered_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.bookmarks, bookmarkListeners.importBegan, (v) => { this.bookmarkImportBegan_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.bookmarks, bookmarkListeners.importEnded, (v) => { this.bookmarkImportEnded_sbscrb(v); }, true);
  }

  async init_async() {
    this._rootBookmarkId = await LocalStorageManager.getValue_async('rootBookmarkId', DefaultValues.rootBookmarkId);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'rootBookmarkId', (v) => { this.setRootBookmarkId_sbscrb(v); }, true);
  }

  setImportInProgress_sbscrb(value) {
    this._importInProgress = value;
  }

  setRootBookmarkId_sbscrb(value) {
    this._rootBookmarkId = value;
  }

  async getRootFolderId_async() {
    // is rootBookmarkId exist ?
    if (this._rootBookmarkId == undefined) {
      //no -> create a root folder
      this._rootBookmarkId = await this._createRootFolder_async();
    }
    else {
      //yes -> try to get the root folder
      try {
        await browser.bookmarks.getSubTree(this._rootBookmarkId);
      }
      catch (e) {
        //has failed then create a root folder
        this._rootBookmarkId = await this._createRootFolder_async();
      }
    }
    return this._rootBookmarkId;
  }

  async sortBookmarks_async(bookmarkId) {
    try {
      await LocalStorageManager.setValue_async('importInProgress', true);
      FeedsStatusBar.instance.workInProgress = true;
      await this._sortBookmarksCore_async(bookmarkId);
    }
    finally {
      await LocalStorageManager.setValue_async('importInProgress', false);
      await FeedsTreeView.instance.reload_async();
      FeedsStatusBar.instance.workInProgress = false;
    }
  }

  async changeParentFolder(parentFolderId, bookmarkId, first) {
    let bookmark = await browser.bookmarks.get(bookmarkId);
    if (bookmark.parentId != parentFolderId) {
      let destination = (first ? { parentId: parentFolderId, index: 0 } : { parentId: parentFolderId });
      await browser.bookmarks.move(bookmarkId, destination);
    }
  }

  async moveAfterBookmark_async(idToMove, idToMoveAfter) {
    let bookmarkToMove = (await browser.bookmarks.get(idToMove))[0];
    let bookmarkToMoveAfter = (await browser.bookmarks.get(idToMoveAfter))[0];
    if (bookmarkToMove.parentId != bookmarkToMoveAfter.parentId) {
      await browser.bookmarks.move(idToMove, { parentId: bookmarkToMoveAfter.parentId, index: bookmarkToMoveAfter.index + 1 });
    }
    else {
      await browser.bookmarks.move(idToMove, { index: bookmarkToMoveAfter.index + 1 });
    }
  }

  async moveBeforeBookmark_async(idToMove, idToMoveBefore) {
    let bookmarkToMove = (await browser.bookmarks.get(idToMove))[0];
    let bookmarkToMoveBefore = (await browser.bookmarks.get(idToMoveBefore))[0];
    if (bookmarkToMove.parentId != bookmarkToMoveBefore.parentId) {
      await browser.bookmarks.move(idToMove, { parentId: bookmarkToMoveBefore.parentId, index: Math.max(bookmarkToMoveBefore.index - 1, 0) });
    }
    else {
      await browser.bookmarks.move(idToMove, { index: Math.max(bookmarkToMoveBefore.index - 1, 0) });
    }
  }

  async _sortBookmarksCore_async(bookmarkId) {
    try {
      let bookmarkList = (await browser.bookmarks.getSubTree(bookmarkId))[0].children;
      if (bookmarkList.length > 0) {

        bookmarkList.sort((bk1, bk2) => {
          if (bk1.url && !bk2.url) return 1;
          if (!bk1.url && bk2.url) return -1;
          if (bk1.title.toLowerCase() > bk2.title.toLowerCase()) return 1;
          if (bk1.title.toLowerCase() < bk2.title.toLowerCase()) return -1;
          if (bk1.title > bk2.title) return 1;
          if (bk1.title < bk2.title) return -1;
          return 0;
        });
      }

      for (let bk of bookmarkList) {
        await browser.bookmarks.move(bk.id, { parentId: bookmarkId });
        if (bk.children) {
          await this._sortBookmarksCore_async(bk.id, true);
          this._importInProgress = true;
        }
      }
    }
    finally { }
  }

  async _bookmarkOnCreated_sbscrb(id, bookmarkInfo) {
    if (this._importInProgress) { return; }
    this._lastCreatedBookmarkId = id;
    let isChid = await this._isDropfeedsChildBookmark_async(bookmarkInfo.parentId);
    if (!isChid) { return; }
    await LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  async _bookmarkOnRemoved_sbscrb(id, removeInfo) {
    if (this._importInProgress) { return; }
    let isChid = await this._isDropfeedsChildBookmark_async(removeInfo.parentId);
    if (!isChid) { return; }
    await LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  async _bookmarkOnChanged_sbscrb(id) {
    if (this._importInProgress) { return; }
    let isChid = await this._isDropfeedsChildBookmark_async(id);
    if (!isChid) { return; }
    await LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  async _bookmarkOnMoved_sbscrb(id, moveInfo) {
    if (this._importInProgress) { return; }
    let isChid = await this._isDropfeedsChildBookmark_async(moveInfo.parentId);
    if (!isChid) {
      isChid = await this._isDropfeedsChildBookmark_async(moveInfo.oldParentId);
    }
    if (!isChid) { return; }
    if (id == this._lastCreatedBookmarkId) {
      FeedsStatusBar.instance.setText(browser.i18n.getMessage('sbUseButtonAbove'));
      await DateTime.delay_async(1);
      FeedsStatusBar.instance.setText('');
    }
    await LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  async _bookmarkOnChildrenReordered_sbscrb(id) {
    if (this._importInProgress) { return; }
    let isChid = await this._isDropfeedsChildBookmark_async(id);
    if (!isChid) { return; }
    await LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  async _bookmarkImportBegan_sbscrb() {
    this._importInProgress = true;
  }

  async _bookmarkImportEnded_sbscrb() {
    this._importInProgress = false;
    await LocalStorageManager.setValue_async('reloadTreeView', Date.now());
  }

  async _createRootFolder_async() {
    let rootBookmarkId = null;

    let bookmarkItems = await browser.bookmarks.search({ title: 'Drop Feeds' });
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
    catch (e) { }
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
      if (chid.children) {
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
      title: 'Drop Feeds releases',
      url: 'https://github.com/dauphine-dev/drop-feeds/releases.atom'
    });
    return rootBookmark.id;
  }
}
