/*global browser DefaultValues LocalStorageManager DateTime BrowserManager*/
/*cSpell:ignore nbsp */
'use strict';
class TabGeneral { /*exported TabGeneral*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._optionFolderList = [];
    this._optionSize = 4;
  }

  async init_async() {
    this._updateLocalizedStrings();
    this._rootBookmarkId = await LocalStorageManager.getValue_async('rootBookmarkId', DefaultValues.rootBookmarkId);
    await this._initDisplayRootFolderCheckbox_async();
    await this._initFeedItemOrderDropdown_async();
    await this._initFeedFolderDropdown_async();
  }

  _updateLocalizedStrings() {
    document.getElementById('lblSelectFeedFolder').textContent = browser.i18n.getMessage('optSelectFeedFolder');
    document.getElementById('applySelectedFeedButton').textContent = browser.i18n.getMessage('optApply');
    document.getElementById('textDoNotDisplayRootFolder').textContent = browser.i18n.getMessage('optDoNotDisplayRootFolder');
    document.getElementById('feedItemOrder').textContent = browser.i18n.getMessage('optFeedItemOrder');

    document.getElementById('newerFirst').textContent = browser.i18n.getMessage('optNewerFirst');
    document.getElementById('olderFirst').textContent = browser.i18n.getMessage('optOlderFirst');
    document.getElementById('original').textContent = browser.i18n.getMessage('optOriginal');
  }

  async _initFeedFolderDropdown_async() {
    let bookmarkItems = await browser.bookmarks.getTree();

    await this._prepareOptionsRecursively_async(bookmarkItems[0], 0);
    let optionList =  this._optionFolderList.join('');
    let elFeedList = document.getElementById('feedList');
    let feedFolderSelectHtml = elFeedList.innerHTML + '<select id="feedFolderSelect">\n' +  optionList + '</select>\n';
    BrowserManager.setInnerHtmlByElement(elFeedList, feedFolderSelectHtml);


    document.getElementById('feedFolderSelect').addEventListener('change', (e) => { this._feedFolderSelectChanged_event(e); });
    document.getElementById('applySelectedFeedButton').addEventListener('click', (e) => { this._applySelectedFeedButtonClicked_event(e); });
  }

  async _initDisplayRootFolderCheckbox_async() {
    let notDisplayRootFolder = ! await LocalStorageManager.getValue_async('displayRootFolder', DefaultValues.displayRootFolder);
    let elNotDisplayRootFolderCheckBox = document.getElementById('notDisplayRootFolderCheckBox');
    elNotDisplayRootFolderCheckBox.checked = notDisplayRootFolder;
    elNotDisplayRootFolderCheckBox.addEventListener('click', (e) => { this._notDisplayRootFolderCheckBoxClicked_event(e); });
  }


  async _initFeedItemOrderDropdown_async() {
    let itemSortOrder = await LocalStorageManager.getValue_async('itemSortOrder', DefaultValues.itemSortOrder);
    itemSortOrder = Number.isInteger(itemSortOrder) ? itemSortOrder : DefaultValues.itemSortOrder;
    let feedItemOrderSelectEl = document.getElementById('feedItemOrderSelect');
    feedItemOrderSelectEl.options[itemSortOrder].selected = true;
    feedItemOrderSelectEl.addEventListener('change', (e) => { this._feedItemOrderSelectChanged_event(e); });
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
    if (bookmarkItem.id == this._rootBookmarkId) {
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
    await LocalStorageManager.setValue_async('displayRootFolder', ! document.getElementById('notDisplayRootFolderCheckBox').checked);
  }

  async _feedFolderSelectChanged_event() {
    document.getElementById('applySelectedFeedButton').style.display = '';
  }

  async _applySelectedFeedButtonClicked_event() {
    let rootBookmarkId = document.getElementById('feedFolderSelect').value;
    await LocalStorageManager.clean_async();
    await LocalStorageManager.setValue_async('rootBookmarkId', rootBookmarkId);
    await LocalStorageManager.setValue_async('reloadTreeView', Date.now());
    await DateTime.delay_async(100);
    document.getElementById('applySelectedFeedButton').style.display = 'none';
  }

  async _feedItemOrderSelectChanged_event() {
    let itemSortOrder = document.getElementById('feedItemOrderSelect').selectedIndex;
    await LocalStorageManager.setValue_async('itemSortOrder', itemSortOrder);
  }

}
