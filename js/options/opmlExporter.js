/*global browser, browserManager, localStorageManager, textTools*/
'use strict';
class opmlExporter { /*exported opmlExporter*/
  static get instance() {
    if (!this._instance) {
      this._instance = new opmlExporter();
    }
    return this._instance;
  }

  async export_async() {
    let opmlFileUrl = await this._generateExportFile();
    browser.downloads.download({url : opmlFileUrl, filename: 'export.opml', saveAs: true });

  }

  async _generateExportFile() {
    this._opmlItemList = [];
    this._opmlIntentSize = 2;
    let opmlFileText = await this._computeOpmlText_async();
    let blob = new Blob([opmlFileText], {encoding:'UTF-8', type : 'text/html;charset=UTF-8'});
    let opmlFileUrl = URL.createObjectURL(blob);
    return opmlFileUrl;
  }

  async _computeOpmlText_async() {
    let indentRef = [0];
    let opmlText = this._getOpmlHead(indentRef);
    opmlText += await this._getOpmlBody_async(indentRef);
    opmlText += this._getOpmlFoot(indentRef);
    return opmlText;
  }

  _getOpmlHead(indentRef) {
    let headText = '<?xml version="1.0" encoding="UTF-8"?>\n';
    headText += '<opml version="1.0">\n';
    indentRef[0] += this._opmlIntentSize;
    headText += textTools.makeIndent(indentRef[0]) + '<head>\n';
    indentRef[0] += this._opmlIntentSize;
    headText += textTools.makeIndent(indentRef[0]) + '<title>Drop feeds OPML Export</title>\n';
    indentRef[0] -= this._opmlIntentSize;
    headText += textTools.makeIndent(indentRef[0]) +'</head>\n';
    headText += textTools.makeIndent(indentRef[0]) +'<body>\n';
    indentRef[0] += this._opmlIntentSize;
    return headText;
  }

  async _getOpmlBody_async(indentRef) {
    let rootBookmarkId = await localStorageManager.getValue_async('rootBookmarkId');
    let rootBookmarkItem = (await browser.bookmarks.getSubTree(rootBookmarkId))[0];
    await this._prepareOpmlItemsRecursively_async(rootBookmarkItem, indentRef, true);
    let opmlBody = this._opmlItemList.join('');
    return opmlBody;
  }

  _getOpmlFoot(indentRef) {
    indentRef[0] -= this._opmlIntentSize;
    let footText = textTools.makeIndent(indentRef[0]) + '</body>\n';
    footText += '</opml>';
    return footText;
  }

  async _prepareOpmlItemsRecursively_async(bookmarkItem, indentRef, isRoot) {
    //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
    let isFolder = (!bookmarkItem.url);
    if (isFolder) {
      await this._createOpmlInternalNodes_async(bookmarkItem, indentRef, isRoot);
    }
    else {
      let title = escape(bookmarkItem.title).replace(/%20/g, ' ');
      let url = escape(bookmarkItem.url);
      let externalLine = textTools.makeIndent(indentRef[0]) +  '<outline type="rss" text="' + title + '" title="' + title + '" xmlUrl="' + url + '"/>\n';
      this._opmlItemList.push(externalLine);
    }
  }

  async _createOpmlInternalNodes_async (bookmarkItem, indentRef, isRoot) {
    let addClose = false;
    if (!isRoot) {
      let internalLineOpen = textTools.makeIndent(indentRef[0]) + '<outline type="rss" text="' + bookmarkItem.title + '"';
      if (browserManager.bookmarkHasChild(bookmarkItem)) {
        addClose = true;
        internalLineOpen += '>\n';
      }
      else {
        internalLineOpen += '/>\n';
      }
      this._opmlItemList.push(internalLineOpen);
      indentRef[0] += this._opmlIntentSize;
    }

    if (browserManager.bookmarkHasChild(bookmarkItem)) {
      for (let child of bookmarkItem.children) {
        await this._prepareOpmlItemsRecursively_async(child, indentRef, false);
      }
    }
    if (!isRoot) {
      indentRef[0] -= this._opmlIntentSize;
      if (addClose) {
        let internalLineClose = textTools.makeIndent(indentRef[0]) + '</outline>\n';
        this._opmlItemList.push(internalLineClose);
      }
    }
  }

}
