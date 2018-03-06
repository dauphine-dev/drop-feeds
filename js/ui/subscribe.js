/*global browser LocalStorageManager TextTools BrowserManager*/
'use strict';
class Subscribe {

  static get instance() {
    if (!this._instance) {
      this._instance = new Subscribe();
    }
    return this._instance;
  }

  constructor() {
    this._html = [];
    this._feedTitle = null;
    this._feedUrl = null;
    this._selectedId = null;
  }

  async init_async() {
    let subscribeInfo = await LocalStorageManager.getValue_async('subscribeInfo');
    if (subscribeInfo) {
      LocalStorageManager.setValue_async('subscribeInfo', null);
      this._feedTitle = subscribeInfo.feedTitle;
      this._feedUrl = subscribeInfo.feedUrl;
    }
    else {
      let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
      this._feedTitle = tabInfos[0].title;
      this._feedUrl = tabInfos[0].url;
    }

    this._selectedId = await LocalStorageManager.getValue_async('rootBookmarkId');
    this._loadFolderView_async( this._selectedId);
    document.getElementById('inputName').value = this._feedTitle;
    document.getElementById('newFolderButton').addEventListener('click', this._newFolderButtonClicked_event);
    document.getElementById('cancelButton').addEventListener('click', this._cancelButtonClicked_event);
    document.getElementById('subscribeButton').addEventListener('click', this._subscribeButtonClicked_event);
    document.getElementById('cancelNewFolderButton').addEventListener('click', this._cancelNewFolderButtonClicked_event);
    document.getElementById('createNewFolderButton').addEventListener('click', this._createNewFolderButtonClicked_event);
  }

  async _newFolderButtonClicked_event(event) {
    let self = Subscribe.instance;
    event.stopPropagation();
    event.preventDefault();
    self._showNewFolderDialog();
  }

  async _cancelButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    window.close();
  }

  async _subscribeButtonClicked_event() {
    let self = Subscribe.instance;
    try {
      let name = document.getElementById('inputName').value;
      await browser.bookmarks.create({parentId: self._selectedId, title: name, url: self._feedUrl});
    }
    catch(e) {
      /* eslint-disable no-console */
      console.log(e);
      /* eslint-enable no-console */
    }
    window.close();
  }

  async _cancelNewFolderButtonClicked_event(event) {
    let self = Subscribe.instance;
    event.stopPropagation();
    event.preventDefault();
    self._hideNewFolderDialog();
  }

  async _createNewFolderButtonClicked_event(event) {
    let self = Subscribe.instance;
    event.stopPropagation();
    event.preventDefault();
    try {
      let folderName = document.getElementById('inputNewFolder').value;
      await browser.bookmarks.create({parentId: self._selectedId, title: folderName});
      self._hideNewFolderDialog(self._selectedId);
    }
    catch(e) {
      /* eslint-disable no-console */
      console.log(e);
      /* eslint-enable no-console */
    }
    self._hideNewFolderDialog();
  }

  _hideNewFolderDialog() {
    let elNewFolderDialog = document.getElementById('newFolderDialog');
    elNewFolderDialog.classList.remove('show');
    elNewFolderDialog.classList.add('hide');
  }


  _showNewFolderDialog() {
    let elNewFolderDialog = document.getElementById('newFolderDialog');
    let elMainDiv = document.getElementById('mainDiv');
    let elSelectedLabel = document.getElementById('lbl-' + this._selectedId);
    let rectSelectedLabel = elSelectedLabel.getBoundingClientRect();
    let x = Math.round(rectSelectedLabel.left);
    let y = Math.round(rectSelectedLabel.bottom);
    elNewFolderDialog.classList.remove('hide');
    elNewFolderDialog.classList.add('show');
    let xMax  = Math.max(0, elMainDiv.offsetWidth - elNewFolderDialog.offsetWidth + 18);
    let yMax  = Math.max(0, elMainDiv.offsetHeight - elNewFolderDialog.offsetHeight + 20);
    x = Math.min(xMax, x);
    y = Math.min(yMax, y);
    elNewFolderDialog.style.left = x + 'px';
    elNewFolderDialog.style.top = y + 'px';
  }
  async _loadFolderView_async(idToSelect) {
    let rootBookmarkId = await LocalStorageManager.getValue_async('rootBookmarkId');
    let subTree = await browser.bookmarks.getSubTree(rootBookmarkId);
    await this._createItemsForSubTree_async(subTree, idToSelect);
    this._addEventListenerOnFolders();
  }
  async _createItemsForSubTree_async(bookmarkItems, idToSelect) {
    this._html= [];
    await this._prepareSbItemsRecursively_async(bookmarkItems[0], 10, idToSelect);
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
    let folderName = bookmarkItem.title;
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
    let els = document.querySelectorAll('.folderLabel');
    for (let i = 0; i < els.length; i++) {
      els[i].addEventListener('click', this._folderOnClicked_event);
    }
  }
  async _folderOnClicked_event(event) {
    let self = Subscribe.instance;
    let elLabel = event.currentTarget;
    let id = elLabel.getAttribute('id').substring(4);
    self._selectedId = id;
    //Unselecting
    let labelsToUnselect = document.querySelectorAll('.folderLabel, .folderClose, .folderOpen, label');
    for (let i = 0; i < labelsToUnselect.length; i++) {
      labelsToUnselect[i].classList.remove('selected');
      labelsToUnselect[i].classList.remove('selected1');
    }
    //Selecting
    elLabel.classList.add('selected');
    let labelsToSelect = document.querySelectorAll('label[for="cb-' + id + '"]');
    for (let i = 0; i < labelsToSelect.length; i++) {
      labelsToSelect[i].classList.add('selected1');
    }
    //document.getElementById('lbl-' + id).classList.add('selected');
    document.getElementById('cb-' + id).classList.add('selected1');
  }
}

Subscribe.instance.init_async();