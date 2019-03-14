/*global browser DefaultValues BrowserManager LocalStorageManager TextTools XmlTools*/
'use strict';
class OpmlExporter { /*exported OpmlExporter*/
  static get instance() { return (this._instance = this._instance || new this()); }

  async generateExportFile_async(addBookmarkId) {
    this._opmlItemList = [];
    this._opmlIntentSize = 2;
    let opmlFileText = await this._computeOpmlText_async(addBookmarkId);
    let blob = new Blob([opmlFileText], { encoding: 'UTF-8', type: 'text/html;charset=UTF-8' });
    let opmlFileUrl = URL.createObjectURL(blob);
    return opmlFileUrl;
  }

  async _computeOpmlText_async(addBookmarkId) {
    let indentRef = [0];
    let opmlText = this._getOpmlHead(indentRef);
    opmlText += await this._getOpmlBody_async(indentRef, addBookmarkId);
    opmlText += this._getOpmlFoot(indentRef);
    return opmlText;
  }

  _getOpmlHead(indentRef) {
    let headText = '<?xml version="1.0" encoding="UTF-8"?>\n';
    headText += '<opml version="1.0">\n';
    indentRef[0] += this._opmlIntentSize;
    headText += TextTools.makeIndent(indentRef[0]) + '<head>\n';
    indentRef[0] += this._opmlIntentSize;
    headText += TextTools.makeIndent(indentRef[0]) + '<title>Drop Feeds OPML Export</title>\n';
    indentRef[0] -= this._opmlIntentSize;
    headText += TextTools.makeIndent(indentRef[0]) + '</head>\n';
    headText += TextTools.makeIndent(indentRef[0]) + '<body>\n';
    indentRef[0] += this._opmlIntentSize;
    return headText;
  }

  async _getOpmlBody_async(indentRef, addBookmarkId) {
    let rootBookmarkId = await LocalStorageManager.getValue_async('rootBookmarkId', DefaultValues.rootBookmarkId);
    let rootBookmarkItem = (await browser.bookmarks.getSubTree(rootBookmarkId))[0];
    await this._prepareOpmlItemsRecursively_async(rootBookmarkItem, indentRef, true, addBookmarkId);
    let opmlBody = this._opmlItemList.join('');
    return opmlBody;
  }

  _getOpmlFoot(indentRef) {
    indentRef[0] -= this._opmlIntentSize;
    let footText = TextTools.makeIndent(indentRef[0]) + '</body>\n';
    footText += '</opml>';
    return footText;
  }

  async _prepareOpmlItemsRecursively_async(bookmarkItem, indentRef, isRoot, addBookmarkId) {
    let isFolder = (!bookmarkItem.url);
    if (isFolder) {
      await this._createOpmlInternalNodes_async(bookmarkItem, indentRef, isRoot, addBookmarkId);
    }
    else {
      let title = XmlTools.escapeTextXml(bookmarkItem.title);
      let url = XmlTools.escapeUrlXml(bookmarkItem.url);
      let bookmarkIdText = (addBookmarkId ? ' bookmarkId="' + bookmarkItem.id + '"' : '');
      let lineText = '<outline type="rss" text="' + title + '" title="' + title + '" xmlUrl="' + url + '"' + bookmarkIdText + '/>\n';
      let externalLine = TextTools.makeIndent(indentRef[0]) + lineText;
      this._opmlItemList.push(externalLine);
    }
  }

  async _createOpmlInternalNodes_async(bookmarkItem, indentRef, isRoot, addBookmarkId) {
    let addClose = false;
    if (!isRoot) {
      let internalLineOpen = TextTools.makeIndent(indentRef[0]) + '<outline text="' + XmlTools.escapeTextXml(bookmarkItem.title) + '"';
      if (addBookmarkId) { internalLineOpen += ' bookmarkId="' + bookmarkItem.id + '"'; }
      if (BrowserManager.bookmarkHasChild(bookmarkItem)) {
        addClose = true;
        internalLineOpen += '>\n';
      }
      else {
        internalLineOpen += '/>\n';
      }
      this._opmlItemList.push(internalLineOpen);
      indentRef[0] += this._opmlIntentSize;
    }

    if (BrowserManager.bookmarkHasChild(bookmarkItem)) {
      for (let child of bookmarkItem.children) {
        await this._prepareOpmlItemsRecursively_async(child, indentRef, false, addBookmarkId);
      }
    }
    if (!isRoot) {
      indentRef[0] -= this._opmlIntentSize;
      if (addClose) {
        let internalLineClose = TextTools.makeIndent(indentRef[0]) + '</outline>\n';
        this._opmlItemList.push(internalLineClose);
      }
    }
  }
}
