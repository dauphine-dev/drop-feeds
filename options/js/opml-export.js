/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global browser, escape, storageLocalGetItemAsync, makeIndent, bookmarkItemHasChild*/
"use strict";
let _opmlItemList = [];
let  _opmlIntentSize = 2;
//----------------------------------------------------------------------
async function GetUrlForExportedOpmlFileAsync() {
  let opmlFileText = await computeOpmlTextAsync();
  let blob = new Blob([opmlFileText], {encoding:"UTF-8", type : 'text/html;charset=UTF-8'});
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
  let rootBookmarkId = await storageLocalGetItemAsync('rootBookmarkId');
  let bookmarkItems = await browser.bookmarks.getSubTree(rootBookmarkId);
  await prepareOpmlItemsRecursivelyAsync(bookmarkItems[0], indentRef);
  let opmlBody = _opmlItemList.join('');
  return opmlBody;
}
//----------------------------------------------------------------------
async function prepareOpmlItemsRecursivelyAsync(bookmarkItem, indentRef) {
  //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
  let isFolder = (!bookmarkItem.url);
  if (isFolder) {
    await createOpmlInternalNodesAsync(bookmarkItem, indentRef);
  }
  else {
    let title = escape(bookmarkItem.title).replace(/%20/g, ' ');
    let url = escape(bookmarkItem.url);    
    let externalLine = makeIndent(indentRef[0]) +  '<outline type="rss" text="' + title + '" title="' + title + '" xmlUrl="' + url + '"/>\n';
    _opmlItemList.push(externalLine);    
  }
}
//----------------------------------------------------------------------
async function createOpmlInternalNodesAsync (bookmarkItem, indentRef) {
  let addClose = false;
  let internalLineOpen = makeIndent(indentRef[0]) + '<outline type="rss" text="' + bookmarkItem.title + '"';
  
  if (bookmarkItemHasChild(bookmarkItem)) { addClose = true; internalLineOpen += '>\n'; }
  else { internalLineOpen += '/>\n'; }
  
  _opmlItemList.push(internalLineOpen);
  indentRef[0] += _opmlIntentSize;
  if (bookmarkItemHasChild(bookmarkItem)) {
    for (let child of bookmarkItem.children) {
      await prepareOpmlItemsRecursivelyAsync(child, indentRef);
    }
  }    
  indentRef[0] -= _opmlIntentSize;
  if (addClose) {
    let internalLineClose = makeIndent(indentRef[0]) + '</outline>\n';
    _opmlItemList.push(internalLineClose);
  }
}
//----------------------------------------------------------------------
function GetOpmlHead(indentRef) {
  let headText = '<?xml version="1.0" encoding="UTF-8"?>\n';
  headText += '<opml version="1.0">\n';
  indentRef[0] += _opmlIntentSize;
  headText += makeIndent(indentRef[0]) + '<head>\n';
  indentRef[0] += _opmlIntentSize;  
  headText += makeIndent(indentRef[0]) + '<title>Drop feeds OPML Export</title>\n';
  indentRef[0] -= _opmlIntentSize;  
  headText += makeIndent(indentRef[0]) +'</head>\n';
  headText += makeIndent(indentRef[0]) +'<body>\n';
  indentRef[0] += _opmlIntentSize;
  return headText;
}
//----------------------------------------------------------------------
function GetOpmlFoot(indentRef) {
  indentRef[0] -= _opmlIntentSize;
  let footText = makeIndent(indentRef[0]) + '</body>\n';
  footText += '</opml>';  
  return footText;
}
//----------------------------------------------------------------------
