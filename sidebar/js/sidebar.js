/*global browser, addEventListenerContextMenus, contextMenusOnClickedEvent, defaultStoredFolder, FeedStatusEnum, getFeedItemClassAsync, checkRootFolderAsync, buttonAddFeedEnable*/
/*global getFolderFromStorageObj, getStoredFeedAsync, makeIndent, prepareTopMenuAsync, storageLocalSetItemAsync, updateFeedStatusAsync, addingBookmarkListeners, replaceStyle*/
/*global openFeedAsync, sleep, getThemePageActionIcoAsync*/
//----------------------------------------------------------------------
'use strict';
let _html= [];
console.log('Drop feeds loading...');
mainSbr();
//----------------------------------------------------------------------
async function mainSbr() {
//await storageLocalSetItemAsync('rootBookmarkId', 'sdEbRZE4KwUa');  
  //addEventListener('testButton', 'click', testButtonOnClickedEvent);
  prepareTopMenuAsync();
  await loadPanelAsync();
  addingBookmarkListeners();
  window.onresize = windowOnResize;
  browser.tabs.onActivated.addListener(tabOnActivatedEvent);
  browser.tabs.onUpdated.addListener(tabOnUpdatedEvent);  
  let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
  tabOnChangedAsync(tabInfos[0]);
  browser.runtime.onMessage.addListener(runtimeOnMessageEvent);
}
//----------------------------------------------------------------------
async function testButtonOnClickedEvent() {
}
//----------------------------------------------------------------------
async function windowOnResize() {
  let height = window.innerHeight - 57;
  replaceStyle('.contentHeight', '  height:' + height + 'px;');
}
//----------------------------------------------------------------------
async function tabOnActivatedEvent(activeInfo) {
  let tabInfo = await browser.tabs.get(activeInfo.tabId);
  tabOnChangedAsync(tabInfo);  
}
//----------------------------------------------------------------------
function tabOnUpdatedEvent(tabId, changeInfo, tabInfo) {
  if (changeInfo.status == 'complete') {
    tabOnChangedAsync(tabInfo);
  }  
}
//----------------------------------------------------------------------
async function tabOnChangedAsync(tabInfo) {
  let isFeed = false;
  try {
    isFeed = await browser.tabs.sendMessage(tabInfo.id, {'req':'isFeed'});
  } catch(e) { }
  buttonAddFeedEnable(isFeed);
  if(isFeed) {
    browser.pageAction.show(tabInfo.id);
    let iconUrl = await getThemePageActionIcoAsync('subscribe.png');
    browser.pageAction.setIcon({tabId: tabInfo.id, path: iconUrl});
    browser.tabs.sendMessage(tabInfo.id, {'req':'addSubscribeButton'});
  }
  else {
    browser.pageAction.hide(tabInfo.id);
  }
}
//----------------------------------------------------------------------
function storageEventChanged(changes, area) {
  let changedItems = Object.keys(changes);
  if (changedItems.includes('lastModified')) {
    loadPanelAsync();
  }
  else if (changedItems.includes('lastModifiedForceReload')) {
    window.location.reload();
  }
}
//----------------------------------------------------------------------
async function loadPanelAsync() {
  let rootBookmarkId = await checkRootFolderAsync();
  let subTree = await browser.bookmarks.getSubTree(rootBookmarkId);  
  createItemsForSubTree(subTree);
  browser.storage.onChanged.addListener(storageEventChanged);
}
//----------------------------------------------------------------------
async function createItemsForSubTree(bookmarkItems) {
  let storageObj = await browser.storage.local.get();
  _html= [];
  await prepareItemsrecursivelyAsync(storageObj, bookmarkItems[0], 10);
  document.getElementById('content').innerHTML = '\n' + _html.join('');  
  addEventListenerOnFeedItems();
  addEventListenerOnFeedFolders();
  let height = window.innerHeight - 57;
  replaceStyle('.contentHeight', '  height:' + height + 'px;');
  addEventListenerContextMenus();
}
//----------------------------------------------------------------------
async function prepareItemsrecursivelyAsync(storageObj, bookmarkItem, indent) {
  //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
  let isFolder = (!bookmarkItem.url);
  if (isFolder) {
    await createFolderItemAsync(storageObj, bookmarkItem, indent);
    indent += 2;
  } else {
    await createFeedItemAsync(storageObj, bookmarkItem, indent);
  }
  indent -=2;
}
//----------------------------------------------------------------------
async function createFeedItemAsync (storageObj, bookmarkItem, indent) {
  let feedName = bookmarkItem.title;
  let className = await getFeedItemClassAsync(storageObj, bookmarkItem.id, bookmarkItem.title);
  let feedLine = makeIndent(indent) + 
    '<li role="feeditem" class="' + className + '" id="' + bookmarkItem.id + '">' + feedName + '</li>\n';
  _html.push(feedLine);
}
//----------------------------------------------------------------------
async function createFolderItemAsync (storageObj, bookmarkItem, indent) {
  let id = bookmarkItem.id;
  let folderName = bookmarkItem.title;
  let storedFolder = getFolderFromStorageObj(storageObj, 'cb-' + id);    
  let checked = storedFolder.checked ? 'checked' : '';
  let folderLine = '';
  folderLine += makeIndent(indent) + 
  '<div id="dv-' + id + '" class="folder">\n';
  indent += 2;    
  folderLine += makeIndent(indent) + 
    '<li>' + 
    '<input type="checkbox" id=cb-' + id + ' ' + checked + '/>' +
    '<label for="cb-' + id + '" class="folderClose"></label>' + 
    '<label for="cb-' + id + '" class="folderOpen"></label>' + 
    '<label for="cb-' + id + '" id="lbl-' + id + '">' + folderName + '</label>\n';
  folderLine += makeIndent(indent) + '<ul id="ul-' + id + '">\n';
  indent += 2;
  _html.push(folderLine);
  if (bookmarkItem.children) {
    for (let child of bookmarkItem.children) {
      await prepareItemsrecursivelyAsync(storageObj, child, indent);
    }
  }
  indent -= 2;
  _html.push(makeIndent(indent) + '</ul>\n');
  _html.push(makeIndent(indent) + '</li>\n');
  indent -= 2;
  _html.push(makeIndent(indent) + '</div>\n');
}
//----------------------------------------------------------------------
function addEventListenerOnFeedItems() {
  let feedItems = document.querySelectorAll('[role="feeditem"]');
  for (let i = 0; i < feedItems.length; i++) {
    feedItems[i].addEventListener('click', feedClickedEvent);
  }
}
//----------------------------------------------------------------------
function addEventListenerOnFeedFolders() {
  let checkboxItems = document.querySelectorAll('[type="checkbox"]');
  for (let i = 0; i < checkboxItems.length; i++) {
    checkboxItems[i].addEventListener('change', folderChangedEvent);
  }
  let divItems = document.querySelectorAll('.folder');
  for (let i = 0; i < divItems.length; i++) {
    divItems[i].addEventListener('contextmenu', contextMenusOnClickedEvent);
  }
}  
//----------------------------------------------------------------------
function feedClickedEvent(event) {
  let feedItem = event.currentTarget;
  let id = feedItem.getAttribute('id');
  let bookmarks = browser.bookmarks.get(id);
  bookmarks.then(openFeedItemAsync);
  event.stopPropagation();
  event.preventDefault();
}
//----------------------------------------------------------------------
function folderChangedEvent(event) {
  let folderItem = event.currentTarget;
  let folderId = folderItem.getAttribute('id');
  let storedFolder = defaultStoredFolder(folderId);
  storedFolder.checked = folderItem.checked;
  storageLocalSetItemAsync(folderId, storedFolder);
}
//----------------------------------------------------------------------
async function openFeedItemAsync(bookmarkItems){
  let itemUrl = bookmarkItems[0].url;
  openFeedAsync(itemUrl);
  let storedFeedObj = await getStoredFeedAsync(null, bookmarkItems[0].id, bookmarkItems[0].title);
  await updateFeedStatusAsync(null, bookmarkItems[0].id, FeedStatusEnum.OLD, new Date(), bookmarkItems[0].title);  
}
//---------------------------------------------------------------------- 
function runtimeOnMessageEvent(request) {
  let response = null;
  switch (request.req) {
  case 'openSubscribeDialog':
    openSubscribeDialogAsync();
    break;
  }
  return Promise.resolve(response);
}
//----------------------------------------------------------------------
async function openSubscribeDialogAsync() {
  let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
  let url = browser.extension.getURL('subscribe/subscribe.html');
  let createData = {url: url, type: 'popup', width: 778, height: 500, allowScriptsToClose: true, titlePreface: 'Subscribe with Drop feed'};
  storageLocalSetItemAsync('subscribeInfo', {feedTitle: tabInfos[0].title, feedUrl: tabInfos[0].url});
  let win = await browser.windows.create(createData);
  //workaround to force to display content
  await sleep(100);
  browser.windows.update(win.id, {width: 779});
  await sleep(100);
  browser.windows.update(win.id, {width: 780});
}
