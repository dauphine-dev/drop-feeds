/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global browser, storageLocalGetItemAsync, storageLocalSetItemAsync, createFeedFolderOptionsAsync, ImportOmplFileAsync*/
/*global GetUrlForExportedOpmlFileAsync, sleep, cleanStorage, createThemeOptionsAsync, setThemeFolderNameAsync*/
"use strict";
//----------------------------------------------------------------------
main();
//----------------------------------------------------------------------
async function main() {  
  //OMPL Import/Export
  addEventListener('inputImportFile', 'change', importInputChangedEvent);
  addEventListener('importButton', 'click', importButtonOnClickedEvent);
  addEventListener('exportButton', 'click', exportButtonOnClickedEventAsync);
  //Select theme
  let themeSelectHtml = await createThemeOptionsAsync();  
  document.querySelector("#themeList").innerHTML += themeSelectHtml;
  addEventListener('themeSelect', 'change', themeSelectChangedEvent);
  //Select feed folder
  let feedFolderSelectHtml = await createFeedFolderOptionsAsync();
  document.querySelector("#feedList").innerHTML += feedFolderSelectHtml;
  addEventListener('feedFolderSelect', 'change', feedFolderSelectChangedEvent);
  addEventListener('applySelectedFeedButton', 'click', applySelectedClickedEventAsync);    
}
//----------------------------------------------------------------------
function importButtonOnClickedEvent(event) {
  document.getElementById('inputImportFile').click();
}
//----------------------------------------------------------------------
function importInputChangedEvent(event) {
  let file = document.getElementById('inputImportFile').files[0];  
  let reader = new FileReader();
  reader.onload = ImportOmplFileAsync;
  reader.readAsText(file);
}
//----------------------------------------------------------------------
async function exportButtonOnClickedEventAsync(event) {
  let opmlFileUrl = await GetUrlForExportedOpmlFileAsync();
  browser.downloads.download({url : opmlFileUrl, filename: 'export.opml', saveAs: true });
}
//----------------------------------------------------------------------
function feedFolderSelectChangedEvent(event) {
  document.getElementById('applySelectedFeedButton').style.display = '';  
  let selectedBookmarkId = document.getElementById('feedFolderSelect').value;
  console.log('selectedBookmarkId:', selectedBookmarkId);
}
//----------------------------------------------------------------------
async function applySelectedClickedEventAsync(event) {
  let rootBookmarkId = document.getElementById('feedFolderSelect').value;
  await cleanStorage();
  await storageLocalSetItemAsync('rootBookmarkId', rootBookmarkId);
  await storageLocalSetItemAsync('lastModified', Date.now());
  await sleep(100);
  document.getElementById('applySelectedFeedButton').style.display = 'none';

}
//----------------------------------------------------------------------
async function themeSelectChangedEvent(event) {
console.log('1:');
  let themeName = document.getElementById('themeSelect').value;
  await setThemeFolderNameAsync(themeName);
  storageLocalSetItemAsync('lastModifiedForceReload', Date.now());
}
//----------------------------------------------------------------------
