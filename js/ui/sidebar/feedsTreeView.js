/*global  browser DefaultValues BrowserManager FeedsSelectionBar FeedsTopMenu FeedManager FeedsStatusBar ItemsLayout
FeedsContextMenu LocalStorageManager Listener ListenerProviders TextTools Feed BookmarkManager SideBar CssManager*/
'use strict';
const _dropfeedsId = 'dropfeedsId=';
class FeedsTreeView { /*exported FeedsTreeView*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._init();
    Listener.instance.subscribe(ListenerProviders.localStorage, 'reloadTreeView', (v) => { this._reload_sbscrb(v); }, false);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'displayRootFolder', (v) => { this._reload_sbscrb(v); }, false);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'showUpdatedFeedCount', (v) => { this._showUpdatedFeedCount_sbscrb(v); }, true);
  }

  _init() {
    this._selectionBar = new FeedsSelectionBar();
    this._html = null;
    this._is1stFolder = null;
    this._1stElement = null;
    this._displayRootFolder = DefaultValues.displayRootFolder;
    this._1stFolderDivId = null;
    this._rootFolderId = DefaultValues.rootFolderId;
    this._rootBookmark = null;
    this._showUpdatedFeedCount = DefaultValues.showUpdatedFeedCount;
    this._feedsContentPanel = document.getElementById('feedsContentPanel');
  }

  async load_async() {
    this._is1stFolder = true;
    this._rootFolderId = await BookmarkManager.instance.getRootFolderId_async();
    this._rootBookmark = (await browser.bookmarks.getSubTree(this._rootFolderId))[0];
    let cacheLocalStorage = await LocalStorageManager.getCache_async();
    this._displayRootFolder = this._getDisplayRootFolder(cacheLocalStorage);
    this._html = [];
    this._computeHtmlTree(cacheLocalStorage, this._rootBookmark, 10, this._displayRootFolder);
    this._html = this._html.slice(0, -3);
    BrowserManager.setInnerHtmlById('feedsContentPanel', '\n' + this._html.join(''));
    this.updateAllFolderCount();
    this._addEventListenerOnFeedItems();
    this._addEventListenerOnFeedFolders();
    let feedsContentHeightItemsClosed = await LocalStorageManager.getValue_async('feedsContentHeightItemsClosed', window.innerHeight / 3);
    let feedsContentHeightItemsOpened = await LocalStorageManager.getValue_async('feedsContentHeightItemsOpened', window.innerHeight / 3);
    let feedsContentHeight = ItemsLayout.instance.visible ? feedsContentHeightItemsOpened : feedsContentHeightItemsClosed;
    setTimeout(() => {
      FeedsTreeView.instance.setContentHeight(feedsContentHeight);
    }, 15);

  }

  get element() {
    return this._feedsContentPanel;
  }

  get rootFolderId() {
    return this._rootFolderId;
  }

  async reload_async() {
    this._init();
    await this.load_async();
    SideBar.instance.resize();
    setTimeout(() => { SideBar.instance.resize(); }, 20);
  }

  get selectionBar() {
    return this._selectionBar;
  }

  get rootFolderUiId() {
    return this._1stFolderDivId;
  }

  async _reload_sbscrb() {
    await this.reload_async();
  }

  resize() {
    let rec = this._feedsContentPanel.getBoundingClientRect();
    let height = Math.max(ItemsLayout.instance.top - rec.top, 0);
    BrowserManager.setElementHeight(this._feedsContentPanel, height);
    document.getElementById('topMenu').style.width = window.innerWidth + 'px';
    document.getElementById('statusBar').style.width = window.innerWidth + 'px';
    document.getElementById('filterBar').style.width = window.innerWidth + 'px';
    document.getElementById('treeView').style.width = window.innerWidth + 'px';
    this._resizeBackgroundDiv();
  }

  _resizeBackgroundDiv() {
    let rec = document.getElementById('feedsLayoutCell').getBoundingClientRect();
    let feedsLayoutBackground = document.getElementById('feedsLayoutBackground');
    feedsLayoutBackground.style.left = rec.left + 'px';
    feedsLayoutBackground.style.width = rec.width + 'px';
    feedsLayoutBackground.style.top = rec.top + 'px';
    feedsLayoutBackground.style.height = rec.height + 'px';
  }

  setContentHeight(height) {
    BrowserManager.setElementHeight(this._feedsContentPanel, height);
    let rec = this._feedsContentPanel.getBoundingClientRect();
    let maxHeight = Math.max(window.innerHeight - rec.top - ItemsLayout.instance.splitterBar1.element.offsetHeight - 1, 0);
    if (this._feedsContentPanel.offsetHeight > maxHeight) {
      height = maxHeight;
      BrowserManager.setElementHeight(this._feedsContentPanel, height);
    }
    if (ItemsLayout.instance.visible) {
      LocalStorageManager.setValue_async('feedsContentHeightItemsOpened', height);
    }
    else {
      LocalStorageManager.setValue_async('feedsContentHeightItemsClosed', height);
    }

    this._resizeBackgroundDiv();
    return height;
  }

  increaseContentHeight(offset) {
    let prevOffsetHeight = this._feedsContentPanel.offsetHeight;
    let height = Math.max(this._feedsContentPanel.offsetHeight + offset, 0);
    this.setContentHeight(height);
    let delta = this._feedsContentPanel.offsetHeight - prevOffsetHeight;
    return delta;
  }

  _showUpdatedFeedCount_sbscrb(value) {
    this._showUpdatedFeedCount = value;
    let force = true;
    this.updateAllFolderCount(force);
  }

  async updateAllFolderCount(force) {
    if (this._showUpdatedFeedCount || force) {
      this._updateFolderCount(this._rootBookmark);
    }
  }

  openFeed(feedId, openNewTabForce, openNewTabBackGroundForce) {
    try {
      FeedsTopMenu.instance.animateCheckFeedButton(true);
      FeedsStatusBar.instance.workInProgress = true;
      FeedManager.instance.openOneFeedToTabById_async(feedId, openNewTabForce, openNewTabBackGroundForce);
    }
    finally {
      FeedsStatusBar.instance.setText('');
      FeedsTopMenu.instance.animateCheckFeedButton(false);
      FeedsStatusBar.instance.workInProgress = false;
    }

  }

  async updatedFeedsSetVisibility_async(updatedFeedsVisible) {
    let visibleValue = updatedFeedsVisible ? 'display:none !important;' : 'visibility:visible;';
    let unreadValue = '  visibility: visible;\n  font-weight: bold;';
    let showErrorsAsUnread = await LocalStorageManager.getValue_async('showErrorsAsUnread', DefaultValues.showErrorsAsUnreadCheckbox);
    CssManager.replaceStyle('.feedUnread', unreadValue);
    CssManager.replaceStyle('.feedRead', visibleValue);
    CssManager.replaceStyle('.feedError', showErrorsAsUnread ? unreadValue : visibleValue);  
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
      else {
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
    for (let feedItem of feedItems) {
      feedItem.addEventListener('contextmenu', (e) => { this._feedOnRightClicked_event(e); });
      feedItem.addEventListener('click', (e) => { this._feedClicked_event(e); });
      feedItem.addEventListener('mouseup', (e) => { this._feedOnMouseUp_event(e); });
      feedItem.addEventListener('dragstart', (e) => { this._feedOnDragStart_event(e); });
      feedItem.addEventListener('dragover', (e) => { this._feedOnDragOver_event(e); });
      feedItem.addEventListener('dragenter', (e) => { this._feedOnDragEnter_event(e); });
      feedItem.addEventListener('dragleave', (e) => { this._feedOnDragLeave_event(e); });
      feedItem.addEventListener('drop', (e) => { this._feedOnDrop_event(e); });
    }
  }

  _addEventListenerOnFeedFolders() {
    let checkboxItems = document.querySelectorAll('[type="checkbox"]');
    for (let checkboxItem of checkboxItems) {
      checkboxItem.addEventListener('change', (e) => { this._folderChanged_event(e); });
    }

    let folderDivs = document.querySelectorAll('.folderDiv');
    for (let folderDiv of folderDivs) {
      folderDiv.addEventListener('contextmenu', (e) => { this._folderOnRightClicked_event(e); });
      folderDiv.addEventListener('click', (e) => { this._folderOnClicked_event(e); });
      folderDiv.addEventListener('dragstart', (e) => { this._folderOnDragStart_event(e); });
      folderDiv.addEventListener('dragover', (e) => { this._folderOnDragOver_event(e); });
      folderDiv.addEventListener('dragenter', (e) => { this._folderOnDragEnter_event(e); });
      folderDiv.addEventListener('dragleave', (e) => { this._folderOnDragLeave_event(e); });
      folderDiv.addEventListener('drop', (e) => { this._folderOnDrop_event(e); });
    }

    let afterFolders = document.querySelectorAll('.afterFolder');
    for (let afterFolder of afterFolders) {
      afterFolder.addEventListener('dragover', (e) => { this._afterFolderOnDragOver_event(e); });
      afterFolder.addEventListener('dragenter', (e) => { this._afterFolderOnDragEnter_event(e); });
      afterFolder.addEventListener('dragleave', (e) => { this._afterFolderOnDragLeave_event(e); });
      afterFolder.addEventListener('drop', (e) => { this._afterFolderOnDrop_event(e); });
    }

    let labelForList = document.querySelectorAll('label');
    for (let label of labelForList) {
      label.addEventListener('contextmenu', (e) => { this._folderOnRightClicked_event(e); });
    }



  }
  
  async _feedOnRightClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    FeedsContextMenu.instance.hide();
    let elTarget = event.currentTarget;
    let xPos = event.clientX;
    let yPos = event.currentTarget.getBoundingClientRect().top;
    FeedsContextMenu.instance.show(xPos, yPos, elTarget);
  }

  async _feedClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    FeedsContextMenu.instance.hide();
    this._selectionBar.put(event.currentTarget);
    let feedId = event.currentTarget.getAttribute('id');
    let openNewTabForce = null; let openNewTabBackGroundForce = null;
    this.openFeed(feedId, openNewTabForce, openNewTabBackGroundForce);
  }

  async _feedOnMouseUp_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (event.button == 1) { //middle-click
      FeedsContextMenu.instance.hide();
      this._selectionBar.put(event.currentTarget);
      let feedId = event.currentTarget.getAttribute('id');
      let openNewTabForce = true; let openNewTabBackGroundForce = true;
      this.openFeed(feedId, openNewTabForce, openNewTabBackGroundForce);
    }
  }

  async _feedOnDragStart_event(event) {
    event.stopPropagation();
    let origin = event.target.getAttribute('origin');
    let data = origin + (origin.includes('?') ? '&' : '?') + _dropfeedsId + this._cleanId(event.target.id);
    event.dataTransfer.setData('text', data);
  }

  async _feedOnDragOver_event(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  async _feedOnDragEnter_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let targetFeedId = this._getTargetFeedId(event);
    let targetFeed = document.getElementById(targetFeedId);
    targetFeed.classList.add('dropZone');
  }

  async _feedOnDragLeave_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let targetFeedId = this._getTargetFeedId(event);
    let targetFeed = document.getElementById(targetFeedId);
    targetFeed.classList.remove('dropZone');
  }

  async _feedOnDrop_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let data = event.dataTransfer.getData('text');
    let toMoveId = data.substring(data.indexOf(_dropfeedsId) + _dropfeedsId.length);
    let targetId = this._getTargetFeedId(event);
    await BookmarkManager.instance.moveAfterBookmark_async(toMoveId, targetId);
    let dropZoneList = document.getElementsByClassName('dropZone');
    for (let el of dropZoneList) {
      el.classList.remove('dropZone');
    }
  }

  async _folderChanged_event(event) {
    let folderItem = event.currentTarget;
    FeedsContextMenu.instance.hide();
    let folderId = folderItem.getAttribute('id');
    let storedFolder = DefaultValues.getStoredFolder(folderId);
    storedFolder.checked = folderItem.checked;
    await LocalStorageManager.setValue_async(folderId, storedFolder);
  }

  async _folderOnRightClicked_event(event) {
    event.preventDefault();
    let elFolder = event.currentTarget.parentNode.parentNode;
    let xPos = event.clientX;
    let yPos = event.currentTarget.getBoundingClientRect().top;
    FeedsContextMenu.instance.show(xPos, yPos, elFolder);
  }

  async _folderOnClicked_event(event) {
    event.stopPropagation();
    FeedsContextMenu.instance.hide();
    this._selectionBar.put(event.currentTarget.parentNode.parentNode);
  }

  async _folderOnDragStart_event(event) {
    event.stopPropagation();
    let data = origin + (origin.includes('?') ? '&' : '?') + _dropfeedsId + this._cleanId(event.target.id);
    event.dataTransfer.setData('text', data);
  }

  async _folderOnDragOver_event(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  async _folderOnDragEnter_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let target = event.target;
    if (target.nodeType == Node.TEXT_NODE) { target = target.parentNode; }
    target = target.closest('.folderDiv');
    target.classList.add('dropZone');

  }

  async _folderOnDragLeave_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let target = event.target;
    if (target.nodeType == Node.TEXT_NODE) { target = target.parentNode; }
    target = target.closest('.folderDiv');
    target.classList.remove('dropZone');
  }

  async _folderOnDrop_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let data = event.dataTransfer.getData('text');
    let toMoveId = data.substring(data.indexOf(_dropfeedsId) + _dropfeedsId.length);
    let folderId = this._getTargetFeedId(event);
    BookmarkManager.instance.changeParentFolder(folderId, toMoveId, true);
    let dropZoneList = document.getElementsByClassName('dropZone');
    for (let el of dropZoneList) {
      el.classList.remove('dropZone');
    }
  }

  async _afterFolderOnDragOver_event(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  async _afterFolderOnDragEnter_event(event) {
    event.stopPropagation();
    event.preventDefault();
    event.target.classList.add('dropZoneAfterFolder');
  }

  async _afterFolderOnDragLeave_event(event) {
    event.stopPropagation();
    event.preventDefault();
    event.target.classList.remove('dropZoneAfterFolder');
  }

  async _afterFolderOnDrop_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let data = event.dataTransfer.getData('text');
    let toMoveId = data.substring(data.indexOf(_dropfeedsId) + _dropfeedsId.length);
    let folderId = event.target.getAttribute('after');
    await BookmarkManager.instance.moveAfterBookmark_async(toMoveId, folderId);
    let dropZoneList = document.getElementsByClassName('dropZone');
    for (let el of dropZoneList) {
      el.classList.remove('dropZone');
    }
  }

  _getTargetFolderId(event) {
    let target = event.target;
    if (target.nodeType == Node.TEXT_NODE) {
      target = event.target.parentNode;
    }
    let targetId = target.id;
    if (!targetId) { targetId = target.htmlFor; }
    let folderId = this._cleanId(targetId);
    return folderId;
  }

  _getTargetFeedId(event) {
    let target = event.target;
    if (target.nodeType == Node.TEXT_NODE) {
      target = event.target.parentNode;
    }
    let targetId = target.id;
    let feedId = this._cleanId(targetId);
    return feedId;
  }


  _cleanId(elementId) {
    if (!elementId) { return null; }
    let start = 0;
    if (elementId.startsWith('cb-') || elementId.startsWith('ul-') || elementId.startsWith('dv-') || elementId.startsWith('fd-') || elementId.startsWith('lbl-')) {
      start = elementId.indexOf('-') + 1;
    }
    elementId = elementId.substring(start);
    return elementId;
  }

  _setAs1stFolder(id) {
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
    indent -= 2;
  }

  _createTreeFolder(cacheLocalStorage, bookmarkItem, indent, displayThisFolder) {
    let id = bookmarkItem.id;
    let folderName = (TextTools.isNullOrEmpty(bookmarkItem.title.trim()) ? '&nbsp;' : bookmarkItem.title);
    let storedFolder = this._getStoredFolder(cacheLocalStorage, id);
    let checked = storedFolder.checked ? 'checked=""' : '';

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
        `<li>
         <input type="checkbox" id="cb-` + id + '" ' + checked + `>
         <label for="cb-` + id + `" class="folderClose"></label>
         <label for="cb-` + id + `" class="folderOpen"></label>
         <span id="fd-` + id + `" class="folderDiv">
         <label for="cb-` + id + '" id="lbl-' + id + '">' + folderName + '<span id="cpt-' + id + '"></span></label></span>\n';
      let paddingLeft = displayThisFolder ? '' : 'style="padding-left: 22px;"';
      folderLine += TextTools.makeIndent(indent) + '<ul id="ul-' + id + '" ' + paddingLeft + '>\n';

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
    this._html.push(TextTools.makeIndent(indent) + '<div class="afterFolder" after="' + id + '" ></div>\n');
  }

  _createTreeFeed(cacheLocalStorage, bookmarkItem, indent) {
    let feedName = bookmarkItem.title;
    let className = this._getFeedClassName(cacheLocalStorage, bookmarkItem.id);
    let feedLine = TextTools.makeIndent(indent) +
      '<li role="feedItem" class="' + className + '" id="' + bookmarkItem.id + '" draggable="true" origin="' + bookmarkItem.url + '">' + feedName + '</li>\n';
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
      displayRootFolder = DefaultValues.displayRootFolder;
    }
    return displayRootFolder;
  }
}