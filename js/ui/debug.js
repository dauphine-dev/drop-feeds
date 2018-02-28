/*global browser*/
//----------------------------------------------------------------------
'use strict';
mainDbg();
//----------------------------------------------------------------------
async function mainDbg() {
  let debugContent = '\n';
  debugContent += '<table>\n';
  debugContent += await localStorageToHtml_async();
  debugContent += await allBookmarksToHtml_async();
  debugContent += '</table>\n';
  document.getElementById('debugContent').innerHTML += debugContent;
}
//----------------------------------------------------------------------
async function localStorageToHtml_async() {
  let storageLocal = await browser.storage.local.get();
  let nodataList = [];
  let miscList = [];
  let folderStateList = [];
  let bookmarkList = [];
  for (let property in storageLocal) {
    if (storageLocal.hasOwnProperty(property)) {
      if(typeof storageLocal[property] === 'undefined') {
        nodataList.push([property, typeof storageLocal[property], 'undefined']);
        continue;
      }
      if (property.startsWith('cb-')) {
        folderStateList.push([property, typeof storageLocal[property], storageLocal[property] ]);
        continue;
      }
      if (storageLocal[property] !== null) {
        if (storageLocal[property].isFeedInfo || storageLocal[property].isBkmrk || storageLocal[property].bkmrkId) {
          bookmarkList.push([property, typeof storageLocal[property], storageLocal[property] ]);
          continue;
        }
      }
      if (storageLocal[property] === null) {
        nodataList.push([property, typeof storageLocal[property], 'null']);
      }
      else {
        miscList.push([property, typeof storageLocal[property], storageLocal[property].toString() ]);
      }
    }
  }

  bookmarkList.sort(function(a, b) {
    return new Date(b[1].pubDate) - new Date(a[1].pubDate);
  });
  let htmlText = '';
  htmlText += '  ' + addSectionHtml('Misc.');
  htmlText += '  ' + listToHtml(nodataList);
  htmlText += '  ' + listToHtml(miscList);
  htmlText += '  ' + addSectionHtml('Feeds info');
  htmlText += '  ' + listToHtml(bookmarkList);
  htmlText += '  ' + addSectionHtml('Folders state');
  htmlText += '  ' + listToHtml(folderStateList);
  return htmlText;
}
//----------------------------------------------------------------------
async function allBookmarksToHtml_async(){
  let htmlText = '';
  let rootBookmarkId = (await browser.storage.local.get('rootBookmarkId'))['rootBookmarkId'];
  let bookmarks = await browser.bookmarks.getSubTree(rootBookmarkId);
  htmlText += '  ' + addSectionHtml('Bookmarks');
  htmlText += await bookmarksToHtml_async(bookmarks);
  return htmlText;
}
//----------------------------------------------------------------------
async function bookmarksToHtml_async(bookmarks){
  let htmlText = '';
  for (let bookmark of bookmarks) {
    htmlText += '<tr>';
    htmlText += '<td>' + bookmark.id + '</td>';
    htmlText += '<td>(' + (bookmark.url ?  'item' : 'folder') + ')</td>';
    htmlText += '<td>' + printToHtml(bookmark) + '</td>';
    htmlText += '</tr>';
    if (bookmark.children) {
      htmlText += await bookmarksToHtml_async(bookmark.children);
    }
  }
  return htmlText;
}
//----------------------------------------------------------------------
function listToHtml(list) {
  let htmlText = '';
  for(let item of list) {
    htmlText+= '<tr>';
    for (let field of item) {
      htmlText+= '<td>' + printToHtml(field) + '</td>';
    }
    htmlText+= '</tr>\n';
  }
  return htmlText;
}
//----------------------------------------------------------------------
function addSectionHtml(text) {
  let nbCol = 3;
  let htmlText = '';
  htmlText+= '<tr>';
  htmlText+= '<td><h3>' + text + '</h3></td>';
  let max = nbCol -1;
  for (let i=0; i<max; i++){
    htmlText+= '<td></td>';
  }
  htmlText+= '</tr>\n';
  return htmlText;
}
//----------------------------------------------------------------------
function printToHtml(message) {
  if (!message)  {return ''; }
  let html = '';
  if (typeof message == 'object') {
    html += (JSON && JSON.stringify ? JSON.stringify(message, jsonStringifyReplacer) : message);
  } else {
    html += message;
  }
  return html;
}
//----------------------------------------------------------------------
function jsonStringifyReplacer(key, value) {
  if (key == 'children') {
    return '[...]';
  }
  return value;
}