/*global browser CommonValues ThemeManager Transfer LocalStorageManager DateTime BrowserManager*/
'use strict';
class TabGeneral { /*exported TabGeneral*/
  static get instance() {
    if (!this._instance) {
      this._instance = new TabGeneral();
    }
    return this._instance;
  }

  constructor() {
    this._optionFolderList = [];
    this._optionSize = 4;
  }

  init() {
    this._initFeedFolderDropdown_async();
    this._initDisplayRootFolderCheckbox();
    this._initThemeDropdown_async();
  }

  async _initFeedFolderDropdown_async() {
    let bookmarkItems = await browser.bookmarks.getTree();
    await this._prepareOptionsRecursively_async(bookmarkItems[0], 0, CommonValues.instance.rootBookmarkId);
    let optionList =  this._optionFolderList.join('');
    let elFeedList = document.getElementById('feedList');
    let feedFolderSelectHtml = elFeedList.innerHTML + '<select id="feedFolderSelect">\n' +  optionList + '</select>\n';
    BrowserManager.setInnerHtmlByElement(elFeedList, feedFolderSelectHtml);


    document.getElementById('feedFolderSelect').addEventListener('change', this._feedFolderSelectChanged_event);
    document.getElementById('applySelectedFeedButton').addEventListener('click', this._applySelectedFeedButtonClicked_event);
  }

  _initDisplayRootFolderCheckbox() {
    let notDisplayRootFolder = ! CommonValues.instance.displayRootFolder;
    let elNotDisplayRootFolderCheckBox = document.getElementById('notDisplayRootFolderCheckBox');
    elNotDisplayRootFolderCheckBox.checked = notDisplayRootFolder;
    elNotDisplayRootFolderCheckBox.addEventListener('click', this._notDisplayRootFolderCheckBoxClicked_event);
  }

  async _initThemeDropdown_async() {
    let elThemeList = document.getElementById('themeList');
    let themeListHtml = elThemeList.innerHTML + await this._createThemeListHtml_async();
    BrowserManager.setInnerHtmlByElement(elThemeList, themeListHtml);
    document.getElementById('themeSelect').addEventListener('change', this._themeSelectChanged_event);
  }

  async _createThemeListHtml_async() {
    const folder_name = 0;
    const ui_name = 1;
    let themeListUrl = browser.extension.getURL(ThemeManager.instance.themesListUrl);
    let themeListText = await Transfer.downloadTextFile_async(themeListUrl);
    let themeList = themeListText.trim().split('\n');
    let selectedThemeName = await ThemeManager.instance.themeFolderName;

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

  async _prepareOptionsRecursively_async(bookmarkItem, indent) {
    //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
    let isFolder = (!bookmarkItem.url);
    if (isFolder) {
      await this._createFolderOption_async(bookmarkItem, indent);
    }
  }


  async _createFolderOption_async (bookmarkItem, indent) {
    let indentString = '&nbsp;'.repeat(indent);
    let selected = '';
    if (bookmarkItem.id == CommonValues.instance.rootBookmarkId) {
      selected = ' selected';
    }
    let optionLine =  '<option value="' + bookmarkItem.id + '"' + selected + '>' +
                      indentString + '>' + bookmarkItem.title +
                      '</option>\n';
    this._optionFolderList.push(optionLine);
    indent += this._optionSize;
    if (bookmarkItem.children) {
      for (let child of bookmarkItem.children) {
        await this._prepareOptionsRecursively_async(child, indent);
      }
    }
    indent -= this._optionSize;
  }

  async _notDisplayRootFolderCheckBoxClicked_event() {
    CommonValues.instance.displayRootFolder = ! document.getElementById('notDisplayRootFolderCheckBox').checked;
    await LocalStorageManager.setValue_async('reloadPanel', Date.now());
  }

  async _feedFolderSelectChanged_event() {
    document.getElementById('applySelectedFeedButton').style.display = '';
  }

  async _applySelectedFeedButtonClicked_event() {
    let rootBookmarkId = document.getElementById('feedFolderSelect').value;
    await LocalStorageManager.clean();
    CommonValues.instance.rootBookmarkId = rootBookmarkId;
    await LocalStorageManager.setValue_async('reloadPanel', Date.now());
    await DateTime.delay_async(100);
    document.getElementById('applySelectedFeedButton').style.display = 'none';
  }

  async _themeSelectChanged_event() {
    let themeName = document.getElementById('themeSelect').value;
    await ThemeManager.instance.setThemeFolderName_async(themeName);
    await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
  }
}
