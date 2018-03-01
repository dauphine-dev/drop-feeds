/*global browser, commonValues, themeManager, transfer*/
'use strict';
//----------------------------------------------------------------------
let _optionFolderList= [];
let _optionSize = 4;
//----------------------------------------------------------------------
async function createFeedFolderOptionsAsync() {
  let bookmarkItems = await browser.bookmarks.getTree();
  await prepareOptionsRecursivelyAsync(bookmarkItems[0], 0, commonValues.instance.rootBookmarkId);
  let optionList =  _optionFolderList.join('');
  let selectOptions = '<select id="feedFolderSelect">\n' +  optionList + '</select>\n';
  return selectOptions;
}
//----------------------------------------------------------------------
async function createThemeOptionsAsync() {
  const folder_name = 0;
  const ui_name = 1;
  let themeListUrl = browser.extension.getURL(themeManager.instance.themesListUrl);
  let themeListText = await transfer.downloadTextFile_async(themeListUrl);
  let themeList = themeListText.trim().split('\n');
  let selectedThemeName = await themeManager.instance.themeFolderName;

  let optionList = [];
  themeList.shift();
  for (let themeEntry of themeList) {
    let theme = themeEntry.split(';');
    let selected = '';
    if(theme[folder_name] == selectedThemeName) { selected = 'selected'; }
    let optionLine =  '<option value="' + theme[folder_name] + '" ' + selected + '>' + theme[ui_name] +'</option>\n';
    optionList.push(optionLine);
  }
  let selectOptions = '<select id="themeSelect">\n' +  optionList + '</select>\n';
  return selectOptions;
}
//----------------------------------------------------------------------
async function prepareOptionsRecursivelyAsync(bookmarkItem, indent) {
  //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
  let isFolder = (!bookmarkItem.url);
  if (isFolder) {
    await createFolderOptionAsync(bookmarkItem, indent);
  }
}
//----------------------------------------------------------------------
async function createFolderOptionAsync (bookmarkItem, indent) {
  let indentString = '&nbsp;'.repeat(indent);
  let selected = '';
  if (bookmarkItem.id == commonValues.instance.rootBookmarkId) {
    selected = ' selected';
  }
  let optionLine =  '<option value="' + bookmarkItem.id + '"' + selected + '>' +
                    indentString + '>' + bookmarkItem.title +
                    '</option>\n';
  _optionFolderList.push(optionLine);
  indent += _optionSize;
  if (bookmarkItem.children) {
    for (let child of bookmarkItem.children) {
      await prepareOptionsRecursivelyAsync(child, indent);
    }
  }
  indent -= _optionSize;
}
//----------------------------------------------------------------------
