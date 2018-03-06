/*global browser*/
'use strict';
class Debug {
  static async init() {
    let debugContent = '\n';
    debugContent += '<table>\n';
    debugContent += await Debug._localStorageToHtml_async();
    debugContent += await Debug._allBookmarksToHtml_async();
    debugContent += '</table>\n';
    document.getElementById('debugContent').innerHTML += debugContent;
  }

  static async _localStorageToHtml_async() {
    let LocalStorageManager = await browser.storage.local.get();
    let nodataList = [];
    let miscList = [];
    let folderStateList = [];
    let bookmarkList = [];
    //let keysToRemove = [];

    for (let property in LocalStorageManager) {
      if (LocalStorageManager.hasOwnProperty(property)) {
        if(typeof LocalStorageManager[property] === 'undefined') {
          nodataList.push([property, typeof LocalStorageManager[property], 'undefined']);
          continue;
        }
        if (property.startsWith('cb-')) {
          folderStateList.push([property, typeof LocalStorageManager[property], LocalStorageManager[property] ]);
          continue;
        }
        if (LocalStorageManager[property] !== null) {
          if (LocalStorageManager[property].isFeedInfo || LocalStorageManager[property].isBkmrk || LocalStorageManager[property].bkmrkId) {
            bookmarkList.push([property, typeof LocalStorageManager[property], LocalStorageManager[property] ]);
            continue;
          }
        }
        if (LocalStorageManager[property] === null) {
          nodataList.push([property, typeof LocalStorageManager[property], 'null']);
        }
        else {
          if (typeof LocalStorageManager[property] == 'object') {
            //keysToRemove.push(property);
          }
          else {
            miscList.push([property, typeof LocalStorageManager[property], LocalStorageManager[property].toString() ]);
          }
        }
      }
    }
    //await browser.storage.local.remove(keysToRemove);

    bookmarkList.sort(function(a, b) {
      return new Date(b[1].pubDate) - new Date(a[1].pubDate);
    });
    let htmlText = '';
    htmlText += '  ' + Debug._addSectionHtml('Misc.');
    htmlText += '  ' + Debug._listToHtml(nodataList);
    htmlText += '  ' + Debug._listToHtml(miscList);
    htmlText += '  ' + Debug._addSectionHtml('Feeds info');
    htmlText += '  ' + Debug._listToHtml(bookmarkList);
    htmlText += '  ' + Debug._addSectionHtml('Folders state');
    htmlText += '  ' + Debug._listToHtml(folderStateList);
    return htmlText;
  }

  static async _allBookmarksToHtml_async(){
    let htmlText = '';
    let rootBookmarkId = (await browser.storage.local.get('rootBookmarkId'))['rootBookmarkId'];
    let bookmarks = await browser.bookmarks.getSubTree(rootBookmarkId);
    htmlText += '  ' + Debug._addSectionHtml('Bookmarks');
    htmlText += await Debug._bookmarksToHtml_async(bookmarks);
    return htmlText;
  }

  static async _bookmarksToHtml_async(bookmarks){
    let htmlText = '';
    for (let bookmark of bookmarks) {
      htmlText += '<tr>';
      htmlText += '<td>' + bookmark.id + '</td>';
      htmlText += '<td>(' + (bookmark.url ?  'item' : 'folder') + ')</td>';
      htmlText += '<td>' + Debug._printToHtml(bookmark) + '</td>';
      htmlText += '</tr>';
      if (bookmark.children) {
        htmlText += await Debug._bookmarksToHtml_async(bookmark.children);
      }
    }
    return htmlText;
  }

  static _listToHtml(list) {
    let htmlText = '';
    for(let item of list) {
      htmlText+= '<tr>';
      for (let field of item) {
        htmlText+= '<td>' + Debug._printToHtml(field) + '</td>';
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
      html += (JSON && JSON.stringify ? JSON.stringify(message, Debug._jsonStringifyReplacer) : message);
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
Debug.init();