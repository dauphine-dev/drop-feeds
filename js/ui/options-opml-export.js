/*global browser, browserManager, localStorageManager, textTools*/
'use strict';
let _opmlItemList = [];
let  _opmlIntentSize = 2;
//----------------------------------------------------------------------
async function GetUrlForExportedOpmlFileAsync() {
  let opmlFileText = await computeOpmlTextAsync();
  let blob = new Blob([opmlFileText], {encoding:'UTF-8', type : 'text/html;charset=UTF-8'});
  let opmlFileUrl = URL.createObjectURL(blob);
  return opmlFileUrl;
}
//----------------------------------------------------------------------
async function computeOpmlTextAsync() {
  let indentRef = [0];
  let opmlText = GetOpmlHead(indentRef);
  opmlText += await GetOpmlBodyAsync(indentRef);
  opmlText += GetOpmlFoot(indentRef);
  return opmlText;
}
//----------------------------------------------------------------------
async function GetOpmlBodyAsync(indentRef) {
  let rootBookmarkId = await localStorageManager.getValue_async('rootBookmarkId');
  let rootBookmarkItem = (await browser.bookmarks.getSubTree(rootBookmarkId))[0];
  await prepareOpmlItemsRecursivelyAsync(rootBookmarkItem, indentRef, true);
  let opmlBody = _opmlItemList.join('');
  return opmlBody;
}
//----------------------------------------------------------------------
async function prepareOpmlItemsRecursivelyAsync(bookmarkItem, indentRef, isRoot) {
  //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
  let isFolder = (!bookmarkItem.url);
  if (isFolder) {
    await createOpmlInternalNodesAsync(bookmarkItem, indentRef, isRoot);
  }
  else {
    let title = escape(bookmarkItem.title).replace(/%20/g, ' ');
    let url = escape(bookmarkItem.url);
    let externalLine = textTools.makeIndent(indentRef[0]) +  '<outline type="rss" text="' + title + '" title="' + title + '" xmlUrl="' + url + '"/>\n';
    _opmlItemList.push(externalLine);
  }
}
//----------------------------------------------------------------------
async function createOpmlInternalNodesAsync (bookmarkItem, indentRef, isRoot) {
  let addClose = false;
  if (!isRoot) {
    let internalLineOpen = textTools.makeIndent(indentRef[0]) + '<outline type="rss" text="' + bookmarkItem.title + '"';
    if (browserManager.bookmarkHasChild(bookmarkItem)) {
      addClose = true;
      internalLineOpen += '>\n';
    }
    else {
      internalLineOpen += '/>\n';
    }
    _opmlItemList.push(internalLineOpen);
    indentRef[0] += _opmlIntentSize;
  }

  if (browserManager.bookmarkHasChild(bookmarkItem)) {
    for (let child of bookmarkItem.children) {
      await prepareOpmlItemsRecursivelyAsync(child, indentRef, false);
    }
  }
  if (!isRoot) {
    indentRef[0] -= _opmlIntentSize;
    if (addClose) {
      let internalLineClose = textTools.makeIndent(indentRef[0]) + '</outline>\n';
      _opmlItemList.push(internalLineClose);
    }
  }
}
//----------------------------------------------------------------------
function GetOpmlHead(indentRef) {
  let headText = '<?xml version="1.0" encoding="UTF-8"?>\n';
  headText += '<opml version="1.0">\n';
  indentRef[0] += _opmlIntentSize;
  headText += textTools.makeIndent(indentRef[0]) + '<head>\n';
  indentRef[0] += _opmlIntentSize;
  headText += textTools.makeIndent(indentRef[0]) + '<title>Drop feeds OPML Export</title>\n';
  indentRef[0] -= _opmlIntentSize;
  headText += textTools.makeIndent(indentRef[0]) +'</head>\n';
  headText += textTools.makeIndent(indentRef[0]) +'<body>\n';
  indentRef[0] += _opmlIntentSize;
  return headText;
}
//----------------------------------------------------------------------
function GetOpmlFoot(indentRef) {
  indentRef[0] -= _opmlIntentSize;
  let footText = textTools.makeIndent(indentRef[0]) + '</body>\n';
  footText += '</opml>';
  return footText;
}
//----------------------------------------------------------------------
