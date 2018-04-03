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
    Listener.instance.subscribe(ListenerProviders.localStorage, 'reloadTreeView', TreeView._reload_sbscrb, false);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'displayRootFolder', TreeView._reload_sbscrb, false);
  }

  async load_async() {
    this._html = [];
    this._is1stFolder = true;
    this._rootFolderId = await BookmarkManager.instance.getRootFolderId_async();
    let rootBookmark = (await browser.bookmarks.getSubTree(this._rootFolderId))[0];
    let cacheLocalStorage = await LocalStorageManager.getCache_async();
    this._displayRootFolder = this._getDisplayRootFolder(cacheLocalStorage);
    //this._html.push('<div id="dv-content">');
    this._computeHtmlTree(cacheLocalStorage, rootBookmark, 10, this._displayRootFolder);
    //this._html.push('</div>');
    BrowserManager.setInnerHtmlById('content', '\n' + this._html.join(''));
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

  putSelectionBarAtRoot() {
    if (!this._1stElement) {
      this._1stElement = document.getElementById(this._1stFolderDivId);
    }
    this._selectionBar.put(this._1stElement);

  }

  _addEventListenerOnFeedItems() {
    let feedItems = document.querySelectorAll('[role="feedItem"]');
    for (let i = 0; i < feedItems.length; i++) {
      feedItems[i].addEventListener('click', this._feedClicked_event);
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
    }
  }

  async _feedClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    try {
      TopMenu.instance.animateCheckFeedButton(true);
      StatusBar.instance.workInProgress = true;
      let feedId = event.currentTarget.getAttribute('id');
      FeedManager.instance.openOneFeedToTabById_async(feedId);
    }
    finally {
      StatusBar.instance.text = '';
      TopMenu.instance.animateCheckFeedButton(false);
      StatusBar.instance.workInProgress = false;
    }
  }

  async _folderChanged_event(event) {
    let folderItem = event.currentTarget;
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
    TreeView.instance._selectionBar.put(event.currentTarget);
  }

  _setAs1stFolder(id)  {
    this._is1stFolder = false;
    this._1stFolderDivId = 'dv-' + id;
  }

  _computeHtmlTree(cacheLocalStorage, bookmarkItem, indent, displayThisFolder) {
    //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
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
      folderLine += '<div id="dv-' + id + '" class="folder">\n';
      indent += 2;
      folderLine += TextTools.makeIndent(indent) +
      '<li>' +
      '<input type="checkbox" id=cb-' + id + ' ' + checked + '/>' +
      '<label for="cb-' + id + '" class="folderClose"></label>' +
      '<label for="cb-' + id + '" class="folderOpen"></label>' +
      '<label for="cb-' + id + '" id="lbl-' + id + '">' + folderName + '</label>\n';
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
    '<li role="feedItem" class="' + className + '" id="' + bookmarkItem.id + '">' + feedName + '</li>\n';
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