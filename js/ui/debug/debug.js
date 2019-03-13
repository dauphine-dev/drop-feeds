/*global browser BrowserManager*/
'use strict';
class Debug {
  static async init() {
    let debugContent = '\n';
    debugContent += '<table>\n';
    debugContent += await Debug._localStorageToHtml_async();
    debugContent += await Debug._allBookmarksToHtml_async();
    debugContent += '</table>\n';
    let elDebugContent = document.getElementById('debugContent');
    BrowserManager.setInnerHtmlByElement(elDebugContent, elDebugContent.innerHTML + debugContent);
  }

  static async _localStorageToHtml_async() {
    let localStorage = await browser.storage.local.get();
    let nodataList = [];
    let miscList = [];
    let folderStateList = [];
    let feedInfoList = [];
    let scriptsList = [];
    let customThemeList = [];
    //let keysToRemove = [];

    for (let property in localStorage) {
      if (localStorage.hasOwnProperty(property)) {
        // No data list
        if (typeof localStorage[property] === 'undefined') {
          nodataList.push([property, typeof localStorage[property], 'undefined']);
          continue;
        }

        // Folder state list
        if (property.startsWith('cb-')) {
          folderStateList.push([property, typeof localStorage[property], localStorage[property]]);
          continue;
        }

        // Feed info list
        if (localStorage[property] !== null) {
          if (localStorage[property].isFeedInfo || localStorage[property].isBkmrk || localStorage[property].bkmrkId) {
            feedInfoList.push([property, typeof localStorage[property], localStorage[property]]);
            continue;
          }
        }

        // Scripts list
        if (property == 'scriptList' || property.startsWith('scriptObj-') || property.startsWith('scriptCode-')) {
          scriptsList.push([property, typeof localStorage[property], localStorage[property]]);
          continue;
        }

        // Custom theme list
        if (property.startsWith('mainTheme') || property.startsWith('renderTemplate') || property.startsWith('renderTheme') || property.startsWith('scriptEditorTheme')) {
          customThemeList.push([property, typeof localStorage[property], localStorage[property]]);
          continue;
        }

        // No data list (again)
        if (localStorage[property] === null) {
          nodataList.push([property, typeof localStorage[property], 'null']);
        }
        else {
          // Misc. list (object)
          if (typeof localStorage[property] == 'object') {
            miscList.push([property, typeof localStorage[property], localStorage[property]]);
          }
          // Misc. list
          else {
            miscList.push([property, typeof localStorage[property], localStorage[property].toString()]);
          }
        }
      }
    }
    //await browser.storage.local.remove(keysToRemove);
    feedInfoList.sort(function (a, b) {
      return (new Date(b[2].pubDate) - new Date(a[2].pubDate));
    });

    let htmlText = '';
    //htmlText += '  ' + Debug._addSectionHtml('Test button colors');
    //htmlText += '  ' + Debug._testButtonWithHueRotate();
    htmlText += '  ' + Debug._addSectionHtml('Misc.');
    htmlText += '  ' + Debug._listToHtml(nodataList);
    htmlText += '  ' + Debug._listToHtml(miscList);
    htmlText += '  ' + Debug._addSectionHtml('Custom themes info');
    htmlText += '  ' + Debug._listToHtml(customThemeList);
    htmlText += '  ' + Debug._addSectionHtml('Scripts info');
    htmlText += '  ' + Debug._listToHtml(scriptsList);
    htmlText += '  ' + Debug._addSectionHtml('Feeds info');
    htmlText += '  ' + Debug._listToHtml(feedInfoList);
    htmlText += '  ' + Debug._addSectionHtml('Folders state');
    htmlText += '  ' + Debug._listToHtml(folderStateList);
    return htmlText;
  }

  static async _allBookmarksToHtml_async() {
    let htmlText = '';
    let rootBookmarkId = (await browser.storage.local.get('rootBookmarkId'))['rootBookmarkId'];
    let bookmarks = await browser.bookmarks.getSubTree(rootBookmarkId);
    htmlText += '  ' + Debug._addSectionHtml('Bookmarks');
    htmlText += await Debug._bookmarksToHtml_async(bookmarks);
    return htmlText;
  }

  static async _bookmarksToHtml_async(bookmarks) {
    let htmlText = '';
    for (let bookmark of bookmarks) {
      htmlText += '<tr>';
      htmlText += '<td>' + bookmark.id + '</td>';
      htmlText += '<td>(' + (bookmark.url ? 'item' : 'folder') + ')</td>';
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
    for (let item of list) {
      htmlText += '<tr>';
      for (let field of item) {
        htmlText += '<td>' + Debug._printToHtml(field) + '</td>';
      }
      htmlText += '</tr>\n';
    }
    return htmlText;
  }

  static _addSectionHtml(text) {
    let nbCol = 3;
    let htmlText = '';
    htmlText += '<tr>';
    htmlText += '<td><h3>' + text + '</h3></td>';
    let max = nbCol - 1;
    for (let i = 0; i < max; i++) {
      htmlText += '<td></td>';
    }
    htmlText += '</tr>\n';
    return htmlText;
  }

  static _printToHtml(message) {
    if (!message) { return ''; }
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

  static _testButtonWithHueRotate() {
    let buttonsHtml = '';
    let i = 1;
    for (let deg = 0; deg < 360; deg += 1, i++) {
      let style = 'style="';
      style += 'background-image: url(/themes/_templates/img/test.png);';
      style += 'background-repeat: no-repeat;';
      style += 'background-size: 16px 16px;';
      style += 'width: 16px;height: 16px;';
      style += 'filter: hue-rotate(' + deg + 'deg);';
      style += '"';
      let degText = deg.toString().padStart(2, '-').padEnd(3, '-');
      degText = degText.replace(/-/g, '&nbsp;');
      buttonsHtml += '<span ' + style + '>' + degText + '&nbsp;</span>';
      if (i % 40 == 0) {
        buttonsHtml += '<br/><br/>';
      }
    }


    let htmlText = '';
    htmlText += '<tr>';
    htmlText += '<td></td><td></td>';
    htmlText += '<td>' + buttonsHtml + '</td>';
    htmlText += '</tr>\n';
    return htmlText;
  }
}
Debug.init();