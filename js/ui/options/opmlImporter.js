/*global browser DefaultValues LocalStorageManager TextTools ProgressBar DateTime*/
/*cSpell:ignore parsererror */
'use strict';
const TagKindEnum = {
  OPENER: 'opener',
  CLOSER: 'closer',
  SINGLE: 'single'
};
class OpmlImporter { /*exported OpmlImporter*/
  static get instance() { return (this._instance = this._instance || new this()); }

  async import_async() {
    let file = document.getElementById('inputImportFile').files[0];
    let reader = new FileReader();
    reader.onload = ((e) => { this._fileReaderOnLoad_event(e); });
    reader.readAsText(file);
  }

  async _fileReaderOnLoad_event(event) {
    let opmlText = event.target.result;
    this._progressBarImport = new ProgressBar('progressBarImport');
    let isOpmlValid = this._opmlIsValid(opmlText);
    if (isOpmlValid) {
      await this._importOpmlOutlinesAsync(opmlText);
      LocalStorageManager.setValue_async('reloadTreeView', Date.now());
    }
    else {
      this._progressBarImport.text = 'Invalid opml file!';
      await DateTime.delay_async(2000);
      this._progressBarImport.hide();
    }
  }

  _opmlIsValid(opmlText) {
    let parser = new DOMParser();
    let docXml = parser.parseFromString(opmlText, 'application/xml');
    let parseErrorElements = docXml.getElementsByTagName('parsererror');
    return  (parseErrorElements.length == 0);

  }

  async _importOpmlOutlinesAsync(opmlText) {
    let folderId = await LocalStorageManager.getValue_async('rootBookmarkId', DefaultValues.rootBookmarkId);
    await this._cleanBookmarkFolder_async(folderId);
    await LocalStorageManager.clean_async();
    let i1 = TextTools.occurrences(opmlText, '<outline');
    let i2 = TextTools.occurrences(opmlText, '</outline');
    let itemNumber = i1 + i2;
    let index = 0;
    this._progressBarImport.show();
    try {
      LocalStorageManager.setValue_async('importInProgress', true);
      for (let i=0; i<itemNumber; i++) {
        try {
          let perCent = (100*i) / itemNumber;
          perCent = Math.round(perCent * 10) / 10;
          this._progressBarImport.value = perCent;
          let outlineInfo = this._getNextOutlineElementInfo(opmlText, index);
          switch (outlineInfo.kind) {
            case TagKindEnum.OPENER:
              let bookmarkFolder = await browser.bookmarks.create({
                parentId: folderId,
                title: outlineInfo.title
              });
              folderId = bookmarkFolder.id;
              break;
            case TagKindEnum.CLOSER:
              let bookmarks = await browser.bookmarks.get(folderId);
              let currentFolder = bookmarks[0];
              folderId = currentFolder.parentId;
              break;
            case TagKindEnum.SINGLE:
              await browser.bookmarks.create({
                parentId: folderId,
                title: outlineInfo.title,
                url: outlineInfo.url
              });
              break;
              // no default
          }
          index = outlineInfo.endIndex;
        }
        catch(e) {
          /* eslint-disable no-console */
          console.log(e);
          /* eslint-enable no-console */
        }
      }
      this._progressBarImport.value = 100;
      await DateTime.delay_async(500);
    }
    finally {
      LocalStorageManager.setValue_async('importInProgress', false);
      this._progressBarImport.hide();
    }
  }

  async _cleanBookmarkFolder_async(folderId) {
    let children = await browser.bookmarks.getChildren(folderId);
    for (let bookmark of children) {
      browser.bookmarks.removeTree(bookmark.id);
    }
  }

  _getNextOutlineElementInfo(opmlText, index) {
    let kind = null;
    let indexStart = Number.MAX_SAFE_INTEGER;
    let indexEnd = Number.MAX_SAFE_INTEGER;

    let i1 = opmlText.indexOf('<outline', index); if (i1==-1) { i1 = Number.MAX_SAFE_INTEGER; }
    let i2 = opmlText.indexOf('</outline>', index); if (i2==-1) { i2 = Number.MAX_SAFE_INTEGER; }
    if (i1 < i2) {
      indexStart = i1;
      if (indexStart >= 0) {
        let j1 = opmlText.indexOf('>', indexStart + 1); if (j1==-1) { j1 = Number.MAX_SAFE_INTEGER; }
        let j2 = opmlText.indexOf('/>', indexStart + 1); if (j2==-1) { j2 = Number.MAX_SAFE_INTEGER; }
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
    let outlineText =  opmlText.substring(indexStart, indexEnd);
    let isFeed = outlineText.includes('xmlUrl');
    let type = this._getAttributeValue(outlineText , 'type');
    let title = this._getAttributeValue(outlineText , 'title');
    if (title == '') { title = this._getAttributeValue(outlineText , 'text'); }
    title = unescape(title);
    let xmlUrl = this._getAttributeValue(outlineText , 'xmlUrl');
    xmlUrl = decodeURIComponent(xmlUrl);

    let outlineElementInfo = { startIndex : indexStart, endIndex : indexEnd, kind : kind,
      isFeed : isFeed, type : type, title : title, url : xmlUrl };
    return outlineElementInfo;
  }

  _getAttributeValue(elementText,  attributeName) {
    let value = '';
    let i1 = elementText.indexOf(attributeName +  ' '); if (i1==-1) { i1 = Number.MAX_SAFE_INTEGER; }
    let i2 = elementText.indexOf(attributeName + '=' ); if (i2==-1) { i2 = Number.MAX_SAFE_INTEGER; }
    let startAttributeName = Math.min(i1, i2); if (startAttributeName==Number.MAX_SAFE_INTEGER) { startAttributeName = -1; }
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

