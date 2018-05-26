/*global browser DefaultValues BrowserManager SelectionBar TopMenu FeedManager StatusBar
ContextMenu LocalStorageManager Listener ListenerProviders TextTools Feed BookmarkManager SideBar*/
'use strict';

class TreeView { /*exported TreeView*/
  static get instance() {
    if (!this._instance) {
      this._instance = new TreeView();
    }
    return this._instance;
  }

  constructor() {
    this._init();
  }

  _init() {
    this._selectionBar = new SelectionBar();
    this._html = null;
    this._is1stFolder = null;
    this._1stElement = null;
    this._displayRootFolder = DefaultValues.displayRootFolder;
    this._1stFolderDivId = null;
    this._rootFolderId = DefaultValues.rootFolderId;
    this._rootBookmark = null;
    this._showUpdatedFeedCount = DefaultValues.showUpdatedFeedCount;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'reloadTreeView', TreeView._reload_sbscrb, false);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'displayRootFolder', TreeView._reload_sbscrb, false);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'showUpdatedFeedCount', TreeView._showUpdatedFeedCount_sbscrb, true);
  }

  async load_async() {
    //console.log(new Error().stack);
    this._is1stFolder = true;
    this._rootFolderId = await BookmarkManager.instance.getRootFolderId_async();
    this._rootBookmark = (await browser.bookmarks.getSubTree(this._rootFolderId))[0];
    let cacheLocalStorage = await LocalStorageManager.getCache_async();
    this._displayRootFolder = this._getDisplayRootFolder(cacheLocalStorage);
    this._html = [];
    this._computeHtmlTree(cacheLocalStorage, this._rootBookmark, 10, this._displayRootFolder);
    BrowserManager.setInnerHtmlById('content', '\n' + this._html.join(''));
    this.updateAllFolderCount();
    this._addEventListenerOnFeedItems();
    this._addEventListenerOnFeedFolders();
  }

  async reload_async() {
    this._init();
    await this.load_async();
    SideBar.instance.setContentHeight();
  }

  get selectionBar() {
    return this._selectionBar;
  }


  get rootFolderUiId() {
    return this._1stFolderDivId;
  }

  static async _reload_sbscrb() {
    await TreeView.instance.reload_async();
  }

  static async _showUpdatedFeedCount_sbscrb(value) {
    let self = TreeView.instance;
    self._showUpdatedFeedCount = value;
    let force = true;
    self.updateAllFolderCount(force);
  }

  selectionBarRefresh() {
    this._selectionBar.refresh();
  }

  async updateAllFolderCount(force) {
    if (this._showUpdatedFeedCount || force) {
      this._updateFolderCount(this._rootBookmark);
    }
  }

  openFeed(feedId, openNewTabForce, openNewTabBackGroundForce) {
    try {
      TopMenu.instance.animateCheckFeedButton(true);
      StatusBar.instance.workInProgress = true;
      FeedManager.instance.openOneFeedToTabById_async(feedId, openNewTabForce, openNewTabBackGroundForce);
    }
    finally {
      StatusBar.instance.text = '';
      TopMenu.instance.animateCheckFeedButton(false);
      StatusBar.instance.workInProgress = false;
    }

  }
  _updateFolderCount(bookmarkItem) {
    if (!bookmarkItem) { return; }
    if (bookmarkItem.children) {
      for (let child of bookmarkItem.children) {
        if (!bookmarkItem.url) {
          this._updateFolderCount(child);
        }
      }
    }
    let count = this._getFolderCount(bookmarkItem.id);

    let countTextId = 'cpt-' + bookmarkItem.id;
    let countTextEl = document.getElementById(countTextId);
    if (countTextEl) {
      if (count > 0) {
        countTextEl.textContent = ' (' + count + ')';
        countTextEl.classList.add('countBold');
        document.getElementById('lbl-' + bookmarkItem.id).classList.add('countBold');
      }
      else
      {
        countTextEl.textContent = '';
        countTextEl.classList.remove('countBold');
        document.getElementById('lbl-' + bookmarkItem.id).classList.remove('countBold');
      }
    }

  }
  _getFolderCount(bookmarkItemId) {
    if (!this._showUpdatedFeedCount) { return 0; }
    let count = 0;
    let divId = 'dv-' + bookmarkItemId;
    let divEl = document.getElementById(divId);
    if (divEl) {
      let feedUnreadList = divEl.querySelectorAll('.feedUnread');
      count = feedUnreadList.length;
    }
    return count;
  }

  _addEventListenerOnFeedItems() {
    let feedItems = document.querySelectorAll('[role="feedItem"]');
    for (let i = 0; i < feedItems.length; i++) {
      feedItems[i].addEventListener('contextmenu', this._feedOnRightClicked_event);
      feedItems[i].addEventListener('click', this._feedClicked_event);
      feedItems[i].addEventListener('mouseup', this._feedOnMouseUp_event);
      feedItems[i].addEventListener('dragstart', this._feedOnDragStart_event);
      feedItems[i].addEventListener('dragover', this._feedOnDragOver_event);
      feedItems[i].addEventListener('drop', this._feedOnDrop_event);
    }
  }

  _addEventListenerOnFeedFolders() {
    let checkboxItems = document.querySelectorAll('[type="checkbox"]');
    for (let i = 0; i < checkboxItems.length; i++) {
      checkboxItems[i].addEventListener('change', this._folderChanged_event);
    }
    let divItems = document.querySelectorAll('.folder');
    for (let i = 0; i < divItems.length; i++) {
      divItems[i].addEventListener('contextmenu', this._folderOnRightClicked_event);
      divItems[i].addEventListener('click', this._folderOnClicked_event);
      divItems[i].addEventListener('dragstart', this._folderOnDragStart_event);
      divItems[i].addEventListener('dragover', this._folderOnDragOver_event);
      divItems[i].addEventListener('drop', this._folderOnDrop_event);
    }
  }

  async _feedOnRightClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    ContextMenu.instance.hide();
    let elTarget = event.currentTarget;
    let xPos = event.clientX;
    let yPos = event.currentTarget.getBoundingClientRect().top;
    ContextMenu.instance.show(xPos, yPos, elTarget);
  }

  async _feedClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    ContextMenu.instance.hide();
    TreeView.instance._selectionBar.put(event.currentTarget);
    let feedId = event.currentTarget.getAttribute('id');
    let openNewTabForce=null; let openNewTabBackGroundForce=null;
    TreeView.instance.openFeed(feedId, openNewTabForce, openNewTabBackGroundForce);
  }

  async _feedOnMouseUp_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (event.button == 1) { //middle-click
      ContextMenu.instance.hide();
      TreeView.instance._selectionBar.put(event.currentTarget);
      let feedId = event.currentTarget.getAttribute('id');
      let openNewTabForce=true; let openNewTabBackGroundForce=true;
      TreeView.instance.openFeed(feedId, openNewTabForce, openNewTabBackGroundForce);
    }
  }

  async _folderChanged_event(event) {
    let folderItem = event.currentTarget;
    ContextMenu.instance.hide();
    let folderId = folderItem.getAttribute('id');
    let storedFolder = DefaultValues.getStoredFolder(folderId);
    storedFolder.checked = folderItem.checked;
    LocalStorageManager.setValue_async(folderId, storedFolder);
  }

  async _folderOnRightClicked_event(event){
    event.stopPropagation();
    event.preventDefault();
    let elFolder = event.currentTarget;
    let xPos = event.clientX;
    let yPos = event.currentTarget.getBoundingClientRect().top;
    ContextMenu.instance.show(xPos, yPos, elFolder);
  }


  async _folderOnClicked_event(event){
    event.stopPropagation();
    ContextMenu.instance.hide();
    TreeView.instance._selectionBar.put(event.currentTarget);
  }

  async _folderOnDragStart_event(event){
    event.stopPropagation();
    let elementId = TreeView.instance._cleanId(event.target.id);
    event.dataTransfer.setData('text', elementId);
  }

  async _folderOnDragOver_event(event){
    event.stopPropagation();
    event.preventDefault();
  }

  async _folderOnDrop_event(event){
    event.stopPropagation();
    event.preventDefault();
    let sourceId = event.dataTransfer.getData('text');
    let targetId = event.target.id;
    if (!targetId) { targetId = event.target.htmlFor; }
    let folderId = TreeView.instance._cleanId(targetId);
    await BookmarkManager.instance.changeParentFolder(folderId, sourceId);
  }

  async _feedOnDragStart_event(event){
    event.stopPropagation();
    let elementId = TreeView.instance._cleanId(event.target.id);
    event.dataTransfer.setData('text', elementId);
  }

  async _feedOnDragOver_event(event){
    event.stopPropagation();
    event.preventDefault();
  }

  async _feedOnDrop_event(event){
    event.stopPropagation();
    event.preventDefault();
    var feedToMoveId = event.dataTransfer.getData('text');
    let targetFeedId = TreeView.instance._cleanId(event.target.id);
    await BookmarkManager.instance.moveAfterBookmark_async(feedToMoveId, targetFeedId);
  }

  _cleanId(elementId) {
    let start = 0;
    if (elementId.startsWith('cb-') || elementId.startsWith('ul-') || elementId.startsWith('dv-')) {
      start = 3;
    }
    else if (elementId.startsWith('lbl-')) {
      start = 4;
    }
    elementId = elementId.substring(start);
    return elementId;
  }

  _setAs1stFolder(id)  {
    this._is1stFolder = false;
    this._1stFolderDivId = 'dv-' + id;
  }

  _computeHtmlTree(cacheLocalStorage, bookmarkItem, indent, displayThisFolder) {
    //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
    if (!bookmarkItem) { return; }
    let isFolder = (!bookmarkItem.url);
    if (isFolder) {
      this._createTreeFolder(cacheLocalStorage, bookmarkItem, indent, displayThisFolder);
      indent += 2;
    } else {
      this._createTreeFeed(cacheLocalStorage, bookmarkItem, indent);
    }
    indent -=2;
  }

  _createTreeFolder (cacheLocalStorage, bookmarkItem, indent, displayThisFolder) {
    let id = bookmarkItem.id;
    let folderName = bookmarkItem.title;
    let storedFolder = this._getStoredFolder(cacheLocalStorage, id);
    let checked = storedFolder.checked ? 'checked' : '';

    let folderLine = '';
    folderLine += TextTools.makeIndent(indent);
    if (displayThisFolder) {
      if (this._is1stFolder) {
        this._setAs1stFolder(id);
      }
    }
    if (displayThisFolder) {
      folderLine += TextTools.makeIndent(indent);
      folderLine += '<div id="dv-' + id + '" class="folder"  draggable="true">\n';
      indent += 2;
      folderLine += TextTools.makeIndent(indent) +
      '<li>' +
      '<input type="checkbox" id=cb-' + id + ' ' + checked + '/>' +
      '<label for="cb-' + id + '" class="folderClose"></label>' +
      '<label for="cb-' + id + '" class="folderOpen"></label>' +
      '<label for="cb-' + id + '" id="lbl-' + id + '">' + folderName + '<span id="cpt-' + id + '"></span></label>\n';
      let paddingLeft = displayThisFolder ? '' : 'style="padding-left: 22px;"';
      folderLine += TextTools.makeIndent(indent) + '<ul id="ul-' + id + '" ' +  paddingLeft + '>\n';
    }
    indent += 2;
    this._html.push(folderLine);
    if (bookmarkItem.children) {
      for (let child of bookmarkItem.children) {
        this._computeHtmlTree(cacheLocalStorage, child, indent, true);
      }
    }
    indent -= 2;
    this._html.push(TextTools.makeIndent(indent) + '</ul>\n');
    this._html.push(TextTools.makeIndent(indent) + '</li>\n');
    indent -= 2;
    this._html.push(TextTools.makeIndent(indent) + '</div>\n');
  }

  _createTreeFeed (cacheLocalStorage, bookmarkItem, indent) {
    let feedName = bookmarkItem.title;
    let className = this._getFeedClassName(cacheLocalStorage, bookmarkItem.id);
    let feedLine = TextTools.makeIndent(indent) +
    '<li role="feedItem" class="' + className + '" id="' + bookmarkItem.id + '" draggable="true">' + feedName + '</li>\n';
    this._html.push(feedLine);
  }

  _getStoredFolder(cacheLocalStorage, folderId) {
    let storedFolder = cacheLocalStorage['cb-' + folderId];
    if (typeof storedFolder == 'undefined') {
      storedFolder = DefaultValues.getStoredFolder('cb-' + folderId);
    }

    return storedFolder;
  }

  _getStoredFeed(cacheLocalStorage, feedId) {
    let storedFeed = cacheLocalStorage[feedId];
    if (typeof storedFeed == 'undefined') {
      storedFeed = DefaultValues.getStoredFeed(feedId);
    }

    return storedFeed;
  }

  _getFeedClassName(cacheLocalStorage, feedId) {
    let storedFeed = this._getStoredFeed(cacheLocalStorage, feedId);
    return Feed.getClassName(storedFeed);
  }

  _getDisplayRootFolder(cacheLocalStorage) {
    let displayRootFolder = cacheLocalStorage['displayRootFolder'];
    if (typeof displayRootFolder == 'undefined') {
      displayRootFolder =  DefaultValues.displayRootFolder;
    }
    return displayRootFolder;
  }
}