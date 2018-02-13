/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global browser, storageLocalGetItemAsync, downloadFileAsync, getThemeFolderNameAsync*/
'use strict';
//----------------------------------------------------------------------
let _optionFolderList= [];
let _optionSize = 4;
//----------------------------------------------------------------------
async function createFeedFolderOptionsAsync() {
  let bookmarkItems = await browser.bookmarks.getTree();
  let selectedId = await storageLocalGetItemAsync('rootBookmarkId');
  await prepareOptionsRecursivelyAsync(bookmarkItems[0], 0, selectedId);
  let optionList =  _optionFolderList.join('');
  let selectOptions = '<select id="feedFolderSelect">\n' +  optionList + '</select>\n';
  return selectOptions;
}
//----------------------------------------------------------------------
async function createThemeOptionsAsync() {
  const folder_name = 0;
  const ui_name = 1;
  let themeListUrl = browser.extension.getURL('/themes/themes.list');
  let themeListText = await downloadFileAsync(themeListUrl);
  let themeList = themeListText.trim().split('\n');
  let selectedThemeName = await getThemeFolderNameAsync();
  
  let optionList = [];
  themeList.shift();
  for (let themeEntry of themeList) {
    let theme = themeEntry.split(';');
    let selected = '';
    if(theme[folder_name] == selectedThemeName) { selected = 'selected'; }
    let optionLine =  '<option value="' + theme[folder_name] + '" ' + selected + '>' + theme[ui_name] +'</option>\n';
    optionList.push(optionLine);
  }
  let selectedId = await storageLocalGetItemAsync('rootBookmarkId');
  let optionListText =  optionList.join('');
  let selectOptions = '<select id="themeSelect">\n' +  optionList + '</select>\n';
  return selectOptions;
}
//----------------------------------------------------------------------
async function prepareOptionsRecursivelyAsync(bookmarkItem, indent, selectedId) {
  //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
  let isFolder = (!bookmarkItem.url);
  if (isFolder) {
    await createFolderOptionAsync(bookmarkItem, indent, selectedId);
  }
}
//----------------------------------------------------------------------
async function createFolderOptionAsync (bookmarkItem, indent, selectedId) {
  let indentString = '&nbsp;'.repeat(indent);
  let selected = '';
  if (bookmarkItem.id == selectedId) {
    selected = ' selected';
  }
  let optionLine =  '<option value="' + bookmarkItem.id + '"' + selected + '>' +
                    indentString + '>' + bookmarkItem.title +
                    '</option>\n';
  _optionFolderList.push(optionLine);    
  indent += _optionSize;
  if (bookmarkItem.children) {
    for (let child of bookmarkItem.children) {
      await prepareOptionsRecursivelyAsync(child, indent, selectedId);
    }
  }    
  indent -= _optionSize;
}
//----------------------------------------------------------------------
