/*global browser CommonValues BrowserManager SelectionBar TopMenu FeedManager StatusBar ContextMenu LocalStorageManager TextTools Feed BookmarkManager*/
/*global defaultStoredFolder*/
'use strict';
class TreeView { /*exported TreeView*/
  constructor() {
    this._html = null;
    this._is1stFolder = null;
  }

  async createAndShow() {
    //loadPanelAsync
    this._html = [];
    this._is1stFolder = true;
    let rootBookmarkId = await BookmarkManager.getRootFolderId_async();
    let rootBookmark = (await browser.bookmarks.getSubTree(rootBookmarkId))[0];
    let displayRootFolder = CommonValues.instance.displayRootFolder;
    await this._computeHtmlTree_async(rootBookmark, 10, displayRootFolder);
    BrowserManager.setInnerHtmlById('content', '\n' + this._html.join(''));
    this._addEventListenerOnFeedItems();
    this._addEventListenerOnFeedFolders();
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
      divItems[i].addEventListener('click', this._folderOnClicked_event, true);
    }
  }

  async _feedClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    try {
      TopMenu.instance.animateCheckFeedButton(true);
      let feedId = event.currentTarget.getAttribute('id');
      FeedManager.instance.openOneFeedToTab_async(feedId);

    }
    finally {
      StatusBar.instance.text = '';
      TopMenu.instance.animateCheckFeedButton(false);
    }
  }

  _folderChanged_event(event) {
    let folderItem = event.currentTarget;
    let folderId = folderItem.getAttribute('id');
    let storedFolder = defaultStoredFolder(folderId);
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
    SelectionBar.instance.put(event.currentTarget);
  }

  _setAs1stFolder(id)  {
    this._is1stFolder = false;
    this._1stFolderDivId = 'dv-' + id;
    SelectionBar.instance.setRootElement(this._1stFolderDivId);
  }

  async _computeHtmlTree_async(bookmarkItem, indent, displayThisFolder) {
    //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
    let isFolder = (!bookmarkItem.url);
    if (isFolder) {
      await this._createTreeFolder_async(bookmarkItem, indent, displayThisFolder);
      indent += 2;
    } else {
      await this.createTreeFeed_async(bookmarkItem, indent);
    }
    indent -=2;
  }

  async _createTreeFolder_async (bookmarkItem, indent, displayThisFolder) {
    let id = bookmarkItem.id;
    let folderName = bookmarkItem.title;
    let storedFolder = await LocalStorageManager.getValue_async('cb-' + id, defaultStoredFolder('cb-' + id));
    let checked = storedFolder.checked ? 'checked' : '';
    let folderLine = '';
    if (displayThisFolder) {
      if (this._is1stFolder) {
        this._setAs1stFolder(id);
      }
      folderLine += TextTools.makeIndent(indent) +
      '<div id="dv-' + id + '" class="folder">\n';
      indent += 2;
      folderLine += TextTools.makeIndent(indent) +
      '<li>' +
      '<input type="checkbox" id=cb-' + id + ' ' + checked + '/>' +
      '<label for="cb-' + id + '" class="folderClose"></label>' +
      '<label for="cb-' + id + '" class="folderOpen"></label>' +
      '<label for="cb-' + id + '" id="lbl-' + id + '">' + folderName + '</label>\n';
      folderLine += TextTools.makeIndent(indent) + '<ul id="ul-' + id + '">\n';
      indent += 2;
      this._html.push(folderLine);
    }
    if (bookmarkItem.children) {
      for (let child of bookmarkItem.children) {
        await this._computeHtmlTree_async(child, indent, true);
      }
    }
    indent -= 2;
    this._html.push(TextTools.makeIndent(indent) + '</ul>\n');
    this._html.push(TextTools.makeIndent(indent) + '</li>\n');
    indent -= 2;
    this._html.push(TextTools.makeIndent(indent) + '</div>\n');
  }

  async createTreeFeed_async (bookmarkItem, indent) {
    let feedName = bookmarkItem.title;
    let className = (await Feed.new(bookmarkItem.id)).className;
    let feedLine = TextTools.makeIndent(indent) +
    '<li role="feedItem" class="' + className + '" id="' + bookmarkItem.id + '">' + feedName + '</li>\n';
    this._html.push(feedLine);
  }

}