/*global browser*/
'use strict';
class debug {
  static async init() {
    let debugContent = '\n';
    debugContent += '<table>\n';
    debugContent += await debug._localStorageToHtml_async();
    debugContent += await debug._allBookmarksToHtml_async();
    debugContent += '</table>\n';
    document.getElementById('debugContent').innerHTML += debugContent;
  }

  static async _localStorageToHtml_async() {
    let localStorageManager = await browser.storage.local.get();
    let nodataList = [];
    let miscList = [];
    let folderStateList = [];
    let bookmarkList = [];
    //let keysToRemove = [];

    for (let property in localStorageManager) {
      if (localStorageManager.hasOwnProperty(property)) {
        if(typeof localStorageManager[property] === 'undefined') {
          nodataList.push([property, typeof localStorageManager[property], 'undefined']);
          continue;
        }
        if (property.startsWith('cb-')) {
          folderStateList.push([property, typeof localStorageManager[property], localStorageManager[property] ]);
          continue;
        }
        if (localStorageManager[property] !== null) {
          if (localStorageManager[property].isFeedInfo || localStorageManager[property].isBkmrk || localStorageManager[property].bkmrkId) {
            bookmarkList.push([property, typeof localStorageManager[property], localStorageManager[property] ]);
            continue;
          }
        }
        if (localStorageManager[property] === null) {
          nodataList.push([property, typeof localStorageManager[property], 'null']);
        }
        else {
          if (typeof localStorageManager[property] == 'object') {
            //keysToRemove.push(property);
          }
          else {
            miscList.push([property, typeof localStorageManager[property], localStorageManager[property].toString() ]);
          }
        }
      }
    }
    //await browser.storage.local.remove(keysToRemove);

    bookmarkList.sort(function(a, b) {
      return new Date(b[1].pubDate) - new Date(a[1].pubDate);
    });
    let htmlText = '';
    htmlText += '  ' + debug._addSectionHtml('Misc.');
    htmlText += '  ' + debug._listToHtml(nodataList);
    htmlText += '  ' + debug._listToHtml(miscList);
    htmlText += '  ' + debug._addSectionHtml('Feeds info');
    htmlText += '  ' + debug._listToHtml(bookmarkList);
    htmlText += '  ' + debug._addSectionHtml('Folders state');
    htmlText += '  ' + debug._listToHtml(folderStateList);
    return htmlText;
  }

  static async _allBookmarksToHtml_async(){
    let htmlText = '';
    let rootBookmarkId = (await browser.storage.local.get('rootBookmarkId'))['rootBookmarkId'];
    let bookmarks = await browser.bookmarks.getSubTree(rootBookmarkId);
    htmlText += '  ' + debug._addSectionHtml('Bookmarks');
    htmlText += await debug._bookmarksToHtml_async(bookmarks);
    return htmlText;
  }

  static async _bookmarksToHtml_async(bookmarks){
    let htmlText = '';
    for (let bookmark of bookmarks) {
      htmlText += '<tr>';
      htmlText += '<td>' + bookmark.id + '</td>';
      htmlText += '<td>(' + (bookmark.url ?  'item' : 'folder') + ')</td>';
      htmlText += '<td>' + debug._printToHtml(bookmark) + '</td>';
      htmlText += '</tr>';
      if (bookmark.children) {
        htmlText += await debug._bookmarksToHtml_async(bookmark.children);
      }
    }
    return htmlText;
  }

  static _listToHtml(list) {
    let htmlText = '';
    for(let item of list) {
      htmlText+= '<tr>';
      for (let field of item) {
        htmlText+= '<td>' + debug._printToHtml(field) + '</td>';
      }
      htmlText+= '</tr>\n';
    }
    return htmlText;
  }

  static _addSectionHtml(text) {
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

  static _printToHtml(message) {
    if (!message)  {return ''; }
    let html = '';
    if (typeof message == 'object') {
      html += (JSON && JSON.stringify ? JSON.stringify(message, debug._jsonStringifyReplacer) : message);
    } else {
      html += message;
    }
    return html;
  }

  static _jsonStringifyReplacer(key, value) {
    if (key == 'children') {
      return '[...]';
    }
    return value;
  }
}
debug.init();