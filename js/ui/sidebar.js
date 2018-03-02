/*global browser, commonValues, themeManager, selectionBar, topMenu, statusBar, localStorageManager, textTools, cssManager, dateTime, contextMenu*/
/*global addingBookmarkListeners, checkRootFolderAsync, getFeedItemClassAsync, getFolderFromStorageObj, defaultStoredFolder,
openFeedAsync, updateFeedStatusAsync, FeedStatusEnum, getStoredFeedAsync*/
//----------------------------------------------------------------------
'use strict';
let _html= [];
let _contentTop = null;
let _is1stElement = true;
let _is1stFeedItem = true;
/*eslint-disable no-console*/
console.log('Drop feeds loading...');
/*eslint-enable no-console*/
mainSbr();
reloadOnce();
//----------------------------------------------------------------------
async function mainSbr() {
  await themeManager.instance.init_async();
  await commonValues.instance.init_async();
  topMenu.instance.init_async();
  await loadPanelAsync();
  addListeners();
  selectionBar.instance.refresh();
  computeContentTop();
  await feedInCurrentTab_async();
}
//----------------------------------------------------------------------
function reloadOnce() {
  //Workaround to have a clean display on 1st start.
  let doReload = ! sessionStorage.getItem('hasAlreadyReloaded');
  if (doReload) {
    sessionStorage.setItem('hasAlreadyReloaded', true);
    window.location.reload();
  }
}
//----------------------------------------------------------------------
async function storageChanged_event(changes) {
  let changedItems = Object.keys(changes);
  if (changedItems.includes('reloadPanel')) {
    await commonValues.instance.reload_async();
    loadPanelAsync();
  }
  else if (changedItems.includes('reloadPanelWindow')) {
    window.location.reload();
  }
}
//----------------------------------------------------------------------
function addListeners() {
  addingBookmarkListeners();
  window.onresize = windowOnResize;
  browser.tabs.onActivated.addListener(tabOnActivatedEvent);
  browser.tabs.onUpdated.addListener(tabOnUpdatedEvent);
  browser.runtime.onMessage.addListener(runtimeOnMessageEvent);
  document.getElementById('content').addEventListener('scroll', contentOnScrollEvent);
}
//----------------------------------------------------------------------
function contentOnScrollEvent(){
  selectionBar.instance.refresh();
}
//----------------------------------------------------------------------
async function feedInCurrentTab_async() {
  let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
  tabOnChangedAsync(tabInfos[0]);
}
//----------------------------------------------------------------------
async function windowOnResize() {
  setContentHeight();
}
//----------------------------------------------------------------------
function computeContentTop() {
  let elStatusBar = document.getElementById('statusBar');
  let rect = elStatusBar.getBoundingClientRect();
  _contentTop = rect.bottom + 1;
}
//----------------------------------------------------------------------
function setContentHeight() {
  let height = Math.max(window.innerHeight - _contentTop, 0);
  cssManager.replaceStyle('.contentHeight', '  height:' + height + 'px;');
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
  topMenu.instance.enableAddFeedButton(isFeed);
  if(isFeed) {
    browser.pageAction.show(tabInfo.id);
    let iconUrl = themeManager.instance.getImgUrl('subscribe.png');
    browser.pageAction.setIcon({tabId: tabInfo.id, path: iconUrl});
    browser.tabs.sendMessage(tabInfo.id, {'req':'addSubscribeButton'});
  }
  else {
    browser.pageAction.hide(tabInfo.id);
  }
}
//----------------------------------------------------------------------
async function loadPanelAsync() {
  let rootBookmarkId = await checkRootFolderAsync();
  let subTree = await browser.bookmarks.getSubTree(rootBookmarkId);
  createItemsForSubTree(subTree);
  browser.storage.onChanged.addListener(storageChanged_event);
  setContentHeight();
}
//----------------------------------------------------------------------
async function createItemsForSubTree(bookmarkItems) {
  let displayRootFolder = commonValues.instance.displayRootFolder;
  let storageObj = await browser.storage.local.get();
  _html= [];
  resetAll1stInfo();
  await prepareItemsRecursivelyAsync(storageObj, bookmarkItems[0], 10, displayRootFolder);
  document.getElementById('content').innerHTML = '\n' + _html.join('');
  addEventListenerOnFeedItems();
  addEventListenerOnFeedFolders();
  document.getElementById('main').addEventListener('click', contextMenu.instance.hide);
}
//----------------------------------------------------------------------
function resetAll1stInfo() {
  _is1stElement = true;
  _is1stFeedItem = true;
  _is1stFolder = true;
  _1stFolderDivId = null;
}
//----------------------------------------------------------------------
async function prepareItemsRecursivelyAsync(storageObj, bookmarkItem, indent, displayThisFolder) {
  //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
  let isFolder = (!bookmarkItem.url);
  if (isFolder) {
    await createFolderItemAsync(storageObj, bookmarkItem, indent, displayThisFolder);
    indent += 2;
  } else {
    await createFeedItemAsync(storageObj, bookmarkItem, indent);
  }
  indent -=2;
}
//----------------------------------------------------------------------
//----------------------------------------------------------------------
let _is1stFolder = true;
let _1stFolderDivId = null;
function setAs1stFolder(id)  {
  _is1stFolder = false;
  _1stFolderDivId = 'dv-' + id;
  selectionBar.instance.setRootElement(_1stFolderDivId);
  if (_is1stElement) {
    _is1stElement = false;
  }
}
//----------------------------------------------------------------------
async function createFeedItemAsync (storageObj, bookmarkItem, indent) {
  if (_is1stFeedItem) {
    _is1stFeedItem = false;
    if (_is1stElement) {
      _is1stElement = false;
    }
  }
  let feedName = bookmarkItem.title;
  let className = await getFeedItemClassAsync(storageObj, bookmarkItem.id, bookmarkItem.title);
  let feedLine = textTools.makeIndent(indent) +
  '<li role="feedItem" class="' + className + '" id="' + bookmarkItem.id + '">' + feedName + '</li>\n';
  _html.push(feedLine);
}
//----------------------------------------------------------------------
async function createFolderItemAsync (storageObj, bookmarkItem, indent, displayThisFolder) {
  let id = bookmarkItem.id;
  let folderName = bookmarkItem.title;
  let storedFolder = getFolderFromStorageObj(storageObj, 'cb-' + id);
  let checked = storedFolder.checked ? 'checked' : '';
  let folderLine = '';
  if (displayThisFolder) {
    if (_is1stFolder) {
      setAs1stFolder(id);
    }
    folderLine += textTools.makeIndent(indent) +
    '<div id="dv-' + id + '" class="folder">\n';
    indent += 2;
    folderLine += textTools.makeIndent(indent) +
    '<li>' +
    '<input type="checkbox" id=cb-' + id + ' ' + checked + '/>' +
    '<label for="cb-' + id + '" class="folderClose"></label>' +
    '<label for="cb-' + id + '" class="folderOpen"></label>' +
    '<label for="cb-' + id + '" id="lbl-' + id + '">' + folderName + '</label>\n';
    folderLine += textTools.makeIndent(indent) + '<ul id="ul-' + id + '">\n';
    indent += 2;
    _html.push(folderLine);
  }
  if (bookmarkItem.children) {
    for (let child of bookmarkItem.children) {
      await prepareItemsRecursivelyAsync(storageObj, child, indent, true);
    }
  }
  indent -= 2;
  _html.push(textTools.makeIndent(indent) + '</ul>\n');
  _html.push(textTools.makeIndent(indent) + '</li>\n');
  indent -= 2;
  _html.push(textTools.makeIndent(indent) + '</div>\n');
}
//----------------------------------------------------------------------
function addEventListenerOnFeedItems() {
  let feedItems = document.querySelectorAll('[role="feedItem"]');
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
    divItems[i].addEventListener('contextmenu', contextMenu.instance.onClicked_event);
    divItems[i].addEventListener('click', folderOnClickedEvent, true);
  }
}
//----------------------------------------------------------------------
function folderOnClickedEvent(event){
  selectionBar.instance.put(event.currentTarget);
}
//----------------------------------------------------------------------
async function feedClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  try {
    topMenu.instance.animateCheckFeedButton(true);
    let feedItem = event.currentTarget;
    let id = feedItem.getAttribute('id');
    let bookmarks = await browser.bookmarks.get(id);
    statusBar.instance.text = 'Loading ' + bookmarks[0].title;
    await openFeedItemAsync(bookmarks[0]);

  }
  finally {
    statusBar.instance.text = '';
    topMenu.instance.animateCheckFeedButton(false);
  }
}
//----------------------------------------------------------------------
function folderChangedEvent(event) {
  let folderItem = event.currentTarget;
  let folderId = folderItem.getAttribute('id');
  let storedFolder = defaultStoredFolder(folderId);
  storedFolder.checked = folderItem.checked;
  localStorageManager.setValue_async(folderId, storedFolder);
}
//----------------------------------------------------------------------
async function openFeedItemAsync(bookmarkItem){
  let storedFeedObj = await getStoredFeedAsync(null, bookmarkItem.id, bookmarkItem.title);
  let feedObj = {index:0, id:bookmarkItem.id, title:storedFeedObj.name, bookmark:bookmarkItem, pubDate:storedFeedObj.pubDate, feedText:null, error:null, newUrl: null};
  let hash = await openFeedAsync(feedObj, false);
  await updateFeedStatusAsync(feedObj.id, FeedStatusEnum.OLD, new Date(), feedObj.title, hash);
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
  let url = browser.extension.getURL(commonValues.instance.subscribeHtmlUrl);
  let createData = {url: url, type: 'popup', width: 778, height: 500, allowScriptsToClose: true, titlePreface: 'Subscribe with Drop feed'};
  localStorageManager.setValue_async('subscribeInfo', {feedTitle: tabInfos[0].title, feedUrl: tabInfos[0].url});
  let win = await browser.windows.create(createData);
  //workaround to force to display content
  await dateTime.delay_async(100);
  browser.windows.update(win.id, {width: 779});
  await dateTime.delay_async(100);
  browser.windows.update(win.id, {width: 780});
}
//----------------------------------------------------------------------
