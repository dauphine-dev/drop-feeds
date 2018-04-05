/*global browser DefaultValues LocalStorageManager BrowserManager TextTools*/
'use strict';
class FolderTreeView { /*exported FolderTreeView*/
  static get instance() {
    if (!this._instance) {
      this._instance = new FolderTreeView();
    }
    return this._instance;
  }

  constructor() {
    this._html= [];
    this._rootBookmarkId = DefaultValues.rootBookmarkId;
    this._selectedId = DefaultValues.rootBookmarkId;
  }

  get selectedId() {
    return this._selectedId;
  }

  async init_async() {
    this._rootBookmarkId = await LocalStorageManager.getValue_async('rootBookmarkId', this._rootBookmarkId);
    this._selectedId = this._rootBookmarkId;
  }

  async load_async(selectedId) {
    let subTree = await browser.bookmarks.getSubTree(this._rootBookmarkId);
    await this._createItemsForSubTree_async(subTree);
    this._addEventListenerOnFolders();
    selectedId = selectedId ? selectedId : this._selectedId;
    this._selectFolder(selectedId);
  }

  async _createItemsForSubTree_async(bookmarkItems) {
    this._html= [];
    await this._prepareSbItemsRecursively_async(bookmarkItems[0], 10, this._selectedId);
    BrowserManager.setInnerHtmlById('content', '\n' + this._html.join(''));
  }

  async _prepareSbItemsRecursively_async(bookmarkItem, indent, idToSelect) {
    //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
    let isFolder = (!bookmarkItem.url);
    if (isFolder) {
      await this._createFolderSbItem_async(bookmarkItem, indent, idToSelect);
      indent += 2;
    }
    indent -=2;
  }

  async _createFolderSbItem_async (bookmarkItem, indent, idToSelect) {
    let id = bookmarkItem.id;
    let folderName = bookmarkItem.title.trim();
    if (folderName == '') { folderName = '&nbsp;&nbsp;'; }
    let selected = (idToSelect == id ? ' class="selected"' : '');
    let selected1 = (idToSelect == id ? ' class="selected1"' : '');
    let folderLine = '';
    folderLine += TextTools.makeIndent(indent) +
    '<div id="dv-' + id + '" class="folder">\n';
    indent += 2;
    folderLine += TextTools.makeIndent(indent) +
    '<li>' +
    '<input type="checkbox" id="cb-' + id + '" checked' + selected1 + '/>' +
    '<label for="cb-' + id + '" class="folderClose"' + selected1 + '></label>' +
    '<label for="cb-' + id + '" class="folderOpen"' + selected1 + '></label>' +
    '<label id="lbl-' + id + '" class="folderLabel"' + selected + '>' + folderName + '</label>\n';
    folderLine += TextTools.makeIndent(indent) + '<ul id="ul-' + id + '">\n';
    indent += 2;
    this._html.push(folderLine);
    if (bookmarkItem.children) {
      for (let child of bookmarkItem.children) {
        await this._prepareSbItemsRecursively_async(child, indent, idToSelect);
      }
    }
    indent -= 2;
    this._html.push(TextTools.makeIndent(indent) + '</ul>\n');
    this._html.push(TextTools.makeIndent(indent) + '</li>\n');
    indent -= 2;
    this._html.push(TextTools.makeIndent(indent) + '</div>\n');
  }

  _addEventListenerOnFolders() {
    //let els = document.querySelector('#folderView').querySelectorAll('.folderLabel, input');
    let els = document.querySelector('#folderView').querySelectorAll('*');
    for (let i = 0; i < els.length; i++) {
      els[i].addEventListener('click', this._folderOnClicked_event);
    }
  }

  async _folderOnClicked_event(event) {
    let self = FolderTreeView.instance;
    event.stopPropagation();
    //event.preventDefault();
    let element = event.currentTarget;
    let attributeId = element.getAttribute('id');
    let rawId  = attributeId ? attributeId : element.getAttribute('for');
    let id  = attributeId ? rawId.substring(4) : rawId.substring(3);
    self._selectFolder(id);
  }

  _selectFolder(folderId) {
    this._selectedId = folderId;
    //Unselecting
    let labelsToUnselect = document.querySelectorAll('.folderLabel, .folderClose, .folderOpen, label');
    for (let i = 0; i < labelsToUnselect.length; i++) {
      labelsToUnselect[i].classList.remove('selected');
      labelsToUnselect[i].classList.remove('selected1');
    }
    //Selecting
    let labelsToSelect = document.querySelectorAll('label[id="lbl-' + folderId + '"]');
    for (let i = 0; i < labelsToSelect.length; i++) {
      labelsToSelect[i].classList.add('selected');
    }
    let labelsToSelect1 = document.querySelectorAll('label[for="cb-' + folderId + '"]');
    for (let i = 0; i < labelsToSelect1.length; i++) {
      labelsToSelect1[i].classList.add('selected1');
    }

  }
}

