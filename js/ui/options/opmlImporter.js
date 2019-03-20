/*global browser DefaultValues LocalStorageManager TextTools DateTime XmlTools*/
/*cSpell:ignore parsererror */
'use strict';
const TagKindEnum = {
  OPENER: 'opener',
  CLOSER: 'closer',
  SINGLE: 'single'
};
class OpmlImporter { /*exported OpmlImporter*/
  static get instance() { return (this._instance = this._instance || new this()); }

  async import_async(opmlText, progressBar, cleanStorage) {
    this._progressBarImport = progressBar;
    let isOpmlValid = this._opmlIsValid(opmlText);
    if (isOpmlValid) {
      await this._importOpmlOutlinesAsync(opmlText, cleanStorage);
      await LocalStorageManager.setValue_async('reloadTreeView', Date.now());
    }
    else {
      this._progressBarImport.text = 'Invalid opml file!';
    }
  }

  _opmlIsValid(opmlText) {
    let parser = new DOMParser();
    let docXml = parser.parseFromString(opmlText, 'application/xml');
    let parseErrorElements = docXml.getElementsByTagName('parsererror');
    return (parseErrorElements.length == 0);
  }

  async _importOpmlOutlinesAsync(opmlText, cleanStorage) {
    let folderId = await LocalStorageManager.getValue_async('rootBookmarkId', DefaultValues.rootBookmarkId);
    await this._cleanBookmarkFolder_async(folderId);
    if (cleanStorage) { await LocalStorageManager.clean_async(); }
    let i1 = TextTools.occurrences(opmlText, '<outline');
    let i2 = TextTools.occurrences(opmlText, '</outline');
    let itemNumber = i1 + i2;
    let index = 0;
    this._progressBarImport.show();
    try {
      await LocalStorageManager.setValue_async('importInProgress', true);
      for (let i = 0; i < itemNumber; i++) {
        try {
          let perCent = (100 * i) / itemNumber;
          perCent = Math.round(perCent * 10) / 10;
          this._progressBarImport.value = perCent;
          let outlineInfo = this._getNextOutlineElementInfo(opmlText, index);
          switch (outlineInfo.kind) {
            case TagKindEnum.OPENER:
              folderId = await this._openFolder_async(folderId, outlineInfo);
              break;
            case TagKindEnum.CLOSER:
              folderId = await this._closeFolder_async(folderId);
              break;
            case TagKindEnum.SINGLE:
              await this._createFeed_async(folderId, outlineInfo);
              break;
          }
          index = outlineInfo.endIndex;
        }
        catch (e) {
          /* eslint-disable no-console */
          console.error(e);
          /* eslint-enable no-console */
        }
      }
      this._progressBarImport.value = 100;
      await DateTime.delay_async(500);
    }
    finally {
      await LocalStorageManager.setValue_async('importInProgress', false);
    }
  }

  async _openFolder_async(folderId, outlineInfo) {
    let createDetails = { parentId: folderId, title: outlineInfo.title };
    let bookmarkFolder = await browser.bookmarks.create(createDetails);
    if (outlineInfo.bookmarkId != '') {
      await this._updateBookmarkInfo_async('cb-' + outlineInfo.bookmarkId, 'cb-' + bookmarkFolder.id);
    }
    return bookmarkFolder.id;
  }

  async _createFeed_async(folderId, outlineInfo) {
    let createDetails = { parentId: folderId, title: outlineInfo.title, url: outlineInfo.url };
    let bookmarkFeed = await browser.bookmarks.create(createDetails);
    if (outlineInfo.bookmarkId != '') {
      await this._updateBookmarkInfo_async(outlineInfo.bookmarkId, bookmarkFeed.id);
    }
  }

  async _closeFolder_async(folderId) {
    let bookmarks = await browser.bookmarks.get(folderId);
    let currentFolder = bookmarks[0];
    return currentFolder.parentId;
  }

  async _updateBookmarkInfo_async(oldId, newId) {
    let bookmarkInfo = await LocalStorageManager.getValue_async(oldId, null);
    if (bookmarkInfo) {
      await browser.storage.local.remove(oldId);
      bookmarkInfo.id = newId;
      await LocalStorageManager.setValue_async(newId, bookmarkInfo);
    }
  }

  async _cleanBookmarkFolder_async(folderId) {
    let children = [];
    try { children = await browser.bookmarks.getChildren(folderId); }
    catch (e) { }
    for (let bookmark of children) {
      browser.bookmarks.removeTree(bookmark.id);
    }
  }

  _getNextOutlineElementInfo(opmlText, index) {
    let kind = null;
    let indexStart = Number.MAX_SAFE_INTEGER;
    let indexEnd = Number.MAX_SAFE_INTEGER;

    let i1 = opmlText.indexOf('<outline', index); if (i1 == -1) { i1 = Number.MAX_SAFE_INTEGER; }
    let i2 = opmlText.indexOf('</outline>', index); if (i2 == -1) { i2 = Number.MAX_SAFE_INTEGER; }
    if (i1 < i2) {
      indexStart = i1;
      if (indexStart >= 0) {
        let j1 = opmlText.indexOf('>', indexStart + 1); if (j1 == -1) { j1 = Number.MAX_SAFE_INTEGER; }
        let j2 = opmlText.indexOf('/>', indexStart + 1); if (j2 == -1) { j2 = Number.MAX_SAFE_INTEGER; }
        if (j1 < j2) {
          kind = TagKindEnum.OPENER;
          indexEnd = j1 + 1;
        }
        else {
          kind = TagKindEnum.SINGLE;
          indexEnd = j2 + 2;
        }
      }
    }
    else {
      indexStart = i2;
      kind = TagKindEnum.CLOSER;
      indexEnd = i2 + '</outline>'.length;
    }
    let outlineText = opmlText.substring(indexStart, indexEnd);
    let isFeed = outlineText.includes('xmlUrl');
    let type = this._getAttributeValue(outlineText, 'type');
    let title = this._getAttributeValue(outlineText, 'title');
    if (title == '') { title = this._getAttributeValue(outlineText, 'text'); }
    title = XmlTools.unescapeTextAll(title);
    let xmlUrl = this._getAttributeValue(outlineText, 'xmlUrl');
    xmlUrl = XmlTools.unescapeUrlXml(xmlUrl);
    xmlUrl = decodeURIComponent(xmlUrl);
    let bookmarkId = this._getAttributeValue(outlineText, 'bookmarkId');
    let outlineElementInfo = {
      startIndex: indexStart, endIndex: indexEnd, kind: kind,
      isFeed: isFeed, type: type, title: title, url: xmlUrl, bookmarkId: bookmarkId
    };
    return outlineElementInfo;
  }

  _getAttributeValue(elementText, attributeName) {
    let value = '';
    let i1 = elementText.indexOf(attributeName + ' '); if (i1 == -1) { i1 = Number.MAX_SAFE_INTEGER; }
    let i2 = elementText.indexOf(attributeName + '='); if (i2 == -1) { i2 = Number.MAX_SAFE_INTEGER; }
    let startAttributeName = Math.min(i1, i2); if (startAttributeName == Number.MAX_SAFE_INTEGER) { startAttributeName = -1; }
    let endAttributeName = 0;
    if (startAttributeName >= 0) {
      endAttributeName = startAttributeName + attributeName.length + 1;
      let startValue = elementText.indexOf('"', endAttributeName) + 1;
      let endValue = elementText.indexOf('"', startValue + 1);
      value = elementText.substring(startValue, endValue);
    }
    return value;
  }
}

