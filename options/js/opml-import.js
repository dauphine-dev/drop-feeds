/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global browser, occurrences, sleep, showProgressBar, hideProgressBar, setProgressBarValue, showMsgInProgressBar, storageLocalGetItemAsync, storageLocalSetItemAsync, cleanStorage, importInProgress*/
//----------------------------------------------------------------------
"use strict";
const TagKindEnum = {
    OPENNER: 'openner',
    CLOSER: 'closer',
    SINGLE: 'single'
};
//----------------------------------------------------------------------
async function ImportOmplFileAsync(event) {
  let opmlText = event.target.result;
  let isOpmlValid = opmlIsValid(opmlText);
  if (isOpmlValid) {
    await importOmplOutlinesAsync(opmlText);
    storageLocalSetItemAsync('lastModified', Date.now());
  }
  else {
    showMsgInProgressBar('progressBarImport', 'Invalid ompl file!');
    await sleep(2000);
    hideProgressBar('progressBarImport');
  }
}
//----------------------------------------------------------------------
function opmlIsValid(opmlText) {
  let parser = new DOMParser();
  let docXml = parser.parseFromString(opmlText, "application/xml");
  let parseErrorElements = docXml.getElementsByTagName('parsererror');
  return  (parseErrorElements.length == 0);  
}
//----------------------------------------------------------------------
async function importOmplOutlinesAsync(opmlText) {
    let folderId = await storageLocalGetItemAsync('rootBookmarkId');    
    await cleanBookmarkFolderAsync(folderId);
    await cleanStorage();
    let indent = 0;
    let i1 = occurrences(opmlText, '<outline');
    let i2 = occurrences(opmlText, '</outline');
    let itemNumber = i1 + i2;
    let index = 0;
    showProgressBar('progressBarImport');
    setProgressBarValue('progressBarImport', 0);
    try {
      storageLocalSetItemAsync('importInProgress', true);
      for (let i=0; i<itemNumber; i++) {
        let perCent = (100*i) / itemNumber;
        perCent = Math.round(perCent * 10) / 10;
        setProgressBarValue('progressBarImport', perCent);
        let outlineInfo = getNextOutlineElementInfo(opmlText, index);
        switch (outlineInfo.kind) {
          case TagKindEnum.OPENNER:
            let bookmarkFolder = await browser.bookmarks.create({
                parentId: folderId,
                title: outlineInfo.title
            });
            folderId = bookmarkFolder.id;
            break;
          case TagKindEnum.CLOSER:
            let bookmarks = await browser.bookmarks.get(folderId);
            let curentFolder = bookmarks[0];
            folderId = curentFolder.parentId;
            break;
          case TagKindEnum.SINGLE:
            await browser.bookmarks.create({
                parentId: folderId,
                title: outlineInfo.title,
                url: outlineInfo.url
            });          
            break;
        }      
        index = outlineInfo.endIndex;
      }
      setProgressBarValue('progressBarImport', 100);
      await sleep(500);
    }
    catch(e) {
      console.log('e:', e);
    }
    finally {
      storageLocalSetItemAsync('importInProgress', false);
      hideProgressBar('progressBarImport');
    }
}
//----------------------------------------------------------------------
async function cleanBookmarkFolderAsync(folderId) {
  let children = await browser.bookmarks.getChildren(folderId);
  for (let bookmark of children) {
      browser.bookmarks.removeTree(bookmark.id);
  }
}
//----------------------------------------------------------------------
function getNextOutlineElementInfo(opmlText, index) {
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
        kind = TagKindEnum.OPENNER;
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
  let type = getAttributeValue(outlineText , 'type');
  let title = getAttributeValue(outlineText , 'title');
  if (title == '') { title = getAttributeValue(outlineText , 'text'); }
  let xmlUrl = getAttributeValue(outlineText , 'xmlUrl');
      
  let outlineElementInfo = { startIndex : indexStart, endIndex : indexEnd, kind : kind,
                              isFeed : isFeed, type : type, title : title, url : xmlUrl };
  return outlineElementInfo;
}  
//----------------------------------------------------------------------
function getAttributeValue(elementText,  attributeName) {
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
//----------------------------------------------------------------------
