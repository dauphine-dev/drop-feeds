/*global browser, storageLocalGetItemAsync, storageLocalSetItemAsync, printToStatusBar, sleep*/
//----------------------------------------------------------------------
'use strict';
let _lastCreatedBookmarkId = '';
let _importInProgress = false;
browser.storage.onChanged.addListener(storageEventChanged);
//----------------------------------------------------------------------
async function storageEventChanged(changes, area) {
  let changedItems = Object.keys(changes);
  if (changedItems.includes('importInProgress')) {
    _importInProgress = changes.importInProgress.newValue;
  }
}
//----------------------------------------------------------------------
function addingBookmarkListeners() {
  browser.bookmarks.onCreated.addListener(bookmarkOnCreatedEvent);
  browser.bookmarks.onRemoved.addListener(bookmarkOnRemovedEvent);
  browser.bookmarks.onChanged.addListener(bookmarkOnChangedEvent);
  browser.bookmarks.onMoved.addListener(bookmarkOnMovedEvent);
  //browser.bookmarks.onChildrenReordered.addListener(bookmarkOnChildrenReorderedEvent);
  //browser.bookmarks.onImportBegan.addListener(bookmarkEventImportBegan);
  //browser.bookmarks.onImportEnded.addListener(bookmarkEventImportEnded);  
}
//----------------------------------------------------------------------
async function bookmarkOnCreatedEvent(id, bookmarkInfo) {
  if (_importInProgress) { return; }
  _lastCreatedBookmarkId = id;
  let isChid =  await isDropfeedsChildBookmarkAsync(bookmarkInfo.parentId);  
  if (!isChid) { return; }
  storageLocalSetItemAsync('lastModified', Date.now());
}
//----------------------------------------------------------------------
async function bookmarkOnRemovedEvent(id, removeInfo) {
  if (_importInProgress) { return; }
  let isChid =  await isDropfeedsChildBookmarkAsync(removeInfo.parentId);
  if (!isChid) { return; }
  storageLocalSetItemAsync('lastModified', Date.now());
}
//----------------------------------------------------------------------
async function bookmarkOnChangedEvent(id, changeInfo) {
  if (_importInProgress) { return; }
  let isChid =  await isDropfeedsChildBookmarkAsync(id);  
  if (!isChid) { return; }
  storageLocalSetItemAsync('lastModified', Date.now());
}
//----------------------------------------------------------------------
async function bookmarkOnMovedEvent(id, moveInfo) {
  if (_importInProgress) { return; }
  let isChid =  await isDropfeedsChildBookmarkAsync(moveInfo.parentId);
  if (!isChid) {
    isChid =  await isDropfeedsChildBookmarkAsync(moveInfo.oldParentId);
  }
  if (!isChid) { return; }
  if (id == _lastCreatedBookmarkId) {
    printToStatusBar('To add a feed use the button above !');
    await sleep(1);
    printToStatusBar('');
  } 
  storageLocalSetItemAsync('lastModified', Date.now());
}
//----------------------------------------------------------------------
async function bookmarkOnChildrenReorderedEvent(id, reorderInfo) {
  if (_importInProgress) { return; }
  let isChid =  await isDropfeedsChildBookmarkAsync(id);  
  if (!isChid) { return; }
  storageLocalSetItemAsync('lastModified', Date.now());
}
//----------------------------------------------------------------------
function bookmarkEventImportBegan() {
  _importInProgress = true;
}
//----------------------------------------------------------------------
function bookmarkEventImportEnded() {
  _importInProgress = false;
  storageLocalSetItemAsync('lastModified', Date.now());
}
//----------------------------------------------------------------------
async function checkRootFolderAsync() {
  let hasToCreateRootfolder = false;
  let rootBookmarkId = await storageLocalGetItemAsync('rootBookmarkId');
  // is rootBookmarkId exist ?
  if (rootBookmarkId == undefined)  {
    //no -> create a root folder
    rootBookmarkId = await createRootfolderAsync();
  }
  else {
    //yes -> try to get the root folder
    try {
      let subTree = await browser.bookmarks.getSubTree(rootBookmarkId);
    }
    catch(e) {
      //has failed then create a root folder
      rootBookmarkId = await createRootfolderAsync();
    }
  }
  return rootBookmarkId;
}
//----------------------------------------------------------------------
async function createRootfolderAsync() {
  let rootBookmarkId = null;
  
  let bookmarkItems = await browser.bookmarks.search({title: 'Drop feeds'});
  if (bookmarkItems) {
    if (bookmarkItems[0]) {
      rootBookmarkId = bookmarkItems[0].id;
    }
  }
  
  if (!rootBookmarkId) {
    let rootBookmark = await browser.bookmarks.create({
      title: 'Drop feeds'
    });
    rootBookmarkId = rootBookmark.id;
    await browser.bookmarks.create({
      parentId: rootBookmark.id,
      title: 'The Mozilla Blog',
      url: 'https://blog.mozilla.org/feed/'
    });
  }  
  
  await storageLocalSetItemAsync('rootBookmarkId', rootBookmarkId);
  return rootBookmarkId;
}
//----------------------------------------------------------------------
async function isDropfeedsChildBookmarkAsync(id) {
  let isChild = false;
  let rootBookmarkId = await storageLocalGetItemAsync('rootBookmarkId');
  if (rootBookmarkId == id) { 
    return true; 
  }
  let subTree = await browser.bookmarks.getSubTree(rootBookmarkId);
  let children = subTree[0].children;
  if (children) {  
    isChild = isChildBookmark(children, id);
  }
  return isChild;
}
//----------------------------------------------------------------------
function isChildBookmark(children, id) {
  for (let chid of children) {
    if (chid.id == id) { 
      return true; 
    }
    if(chid.children) {
      let isChild = isChildBookmark(chid.children, id);
      if (isChild) { 
        return true; 
      }
    }
  }
  return false;
}
//----------------------------------------------------------------------
