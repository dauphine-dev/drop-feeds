/*global browser, themeManager, storageLocalSetItemAsync, createFeedFolderOptionsAsync, ImportOmplFileAsync, commonValues*/
/*global GetUrlForExportedOpmlFileAsync, sleep, cleanStorage, createThemeOptionsAsync, displayRootFolderAsync*/
'use strict';
//----------------------------------------------------------------------
main();
//----------------------------------------------------------------------
async function main() {
  await commonValues.reloadAll_async();
  prepareTabs();
  prepareGeneralPanelAsync();
  prepareUpdateCheckerPanelAsync();
  prepareContentAreaPanelAsync();
  prepareManagementPanelAsync();
}
//----------------------------------------------------------------------
function prepareTabs() {
  let tabLinksList = document.getElementsByClassName('tabLinks');
  for (let tabLink of tabLinksList) {
    tabLink.addEventListener('click', openTab);
  }
}
//----------------------------------------------------------------------
async function prepareGeneralPanelAsync() {
  //Theme list
  PopulateThemeListAsync();
  //Set not display root folder checkbox
  let notDisplayRootFolder = ! await displayRootFolderAsync();
  let elNotDisplayRootFolderCheckBox = document.getElementById('notDisplayRootFolderCheckBox');
  elNotDisplayRootFolderCheckBox.checked = notDisplayRootFolder;
  elNotDisplayRootFolderCheckBox.addEventListener('click', notDisplayRootFolderCheckBoxClickedEvent);
  //Select feed folder
  let feedFolderSelectHtml = await createFeedFolderOptionsAsync();
  document.getElementById('feedList').innerHTML += feedFolderSelectHtml;
  document.getElementById('feedFolderSelect').addEventListener('change', feedFolderSelectChangedEvent);
  document.getElementById('applySelectedFeedButton').addEventListener('click', applySelectedClickedEvent);
}
//----------------------------------------------------------------------
async function prepareUpdateCheckerPanelAsync() {
  let elTimeoutNumber = document.getElementById('timeoutNumber');
  let timeOut = commonValues.timeOutMs / 1000;
  elTimeoutNumber.value = timeOut;
  elTimeoutNumber.addEventListener('change', elTimeoutNumberValueChangeEvent);
}
//----------------------------------------------------------------------
async function prepareContentAreaPanelAsync() {
  let elAlwaysOpenNewTabCheckbox = document.getElementById('alwaysOpenNewTabCheckbox');
  elAlwaysOpenNewTabCheckbox.checked = commonValues.alwaysOpenNewTab;
  elAlwaysOpenNewTabCheckbox.addEventListener('click', alwaysOpenNewTabCheckBoxClickedEvent);

  let elOpenNewTabForegroundCheckbox = document.getElementById('openNewTabForegroundCheckbox');
  elOpenNewTabForegroundCheckbox.checked =  commonValues.openNewTabForeground;
  elOpenNewTabForegroundCheckbox.addEventListener('click', openNewTabForegroundCheckboxClickedEvent);
}
//----------------------------------------------------------------------
async function prepareManagementPanelAsync() {
  document.getElementById('inputImportFile').addEventListener('change', importInputChangedEvent);

  document.getElementById('importButton').addEventListener('click', importButtonOnClickedEvent);
  document.getElementById('exportButton').addEventListener('click', exportButtonOnClickedEvent);
}
//----------------------------------------------------------------------
async function PopulateThemeListAsync() {
  let themeSelectHtml = await createThemeOptionsAsync();
  document.getElementById('themeList').innerHTML += themeSelectHtml;
  document.getElementById('themeSelect').addEventListener('change', themeSelectChangedEvent);
}
//----------------------------------------------------------------------
async function importButtonOnClickedEvent(event) {
  document.getElementById('inputImportFile').click();
}
//----------------------------------------------------------------------
async function importInputChangedEvent(event) {
  let file = document.getElementById('inputImportFile').files[0];
  let reader = new FileReader();
  reader.onload = ImportOmplFileAsync;
  reader.readAsText(file);
}
//----------------------------------------------------------------------
async function exportButtonOnClickedEvent(event) {
  let opmlFileUrl = await GetUrlForExportedOpmlFileAsync();
  browser.downloads.download({url : opmlFileUrl, filename: 'export.opml', saveAs: true });
}
//----------------------------------------------------------------------
async function feedFolderSelectChangedEvent(event) {
  document.getElementById('applySelectedFeedButton').style.display = '';
  let selectedBookmarkId = document.getElementById('feedFolderSelect').value;
  console.log('selectedBookmarkId:', selectedBookmarkId);
}
//----------------------------------------------------------------------
async function applySelectedClickedEvent(event) {
  let rootBookmarkId = document.getElementById('feedFolderSelect').value;
  await cleanStorage();
  await storageLocalSetItemAsync('rootBookmarkId', rootBookmarkId);
  await storageLocalSetItemAsync('reloadPanel', Date.now());
  await sleep(100);
  document.getElementById('applySelectedFeedButton').style.display = 'none';
}
//----------------------------------------------------------------------
async function notDisplayRootFolderCheckBoxClickedEvent(event) {
  let displayRootFolder = document.getElementById('notDisplayRootFolderCheckBox').checked ? 'no' : 'yes';
  await storageLocalSetItemAsync('displayRootFolder', displayRootFolder);
  await storageLocalSetItemAsync('reloadPanel', Date.now());
}
//----------------------------------------------------------------------
async function themeSelectChangedEvent(event) {
  let themeName = document.getElementById('themeSelect').value;
  await themeManager.setThemeFolderName_async(themeName);
  await storageLocalSetItemAsync('reloadPanelWindow', Date.now());
}
//----------------------------------------------------------------------
async function alwaysOpenNewTabCheckBoxClickedEvent(event) {
  let alwaysOpenNewTab = document.getElementById('alwaysOpenNewTabCheckbox').checked;
  await storageLocalSetItemAsync('alwaysOpenNewTab', alwaysOpenNewTab);
  storageLocalSetItemAsync('reloadCommonValues', Date.now());
}
//----------------------------------------------------------------------
async function openNewTabForegroundCheckboxClickedEvent(event) {
  let openNewTabForeground = document.getElementById('openNewTabForegroundCheckbox').checked;
  await storageLocalSetItemAsync('openNewTabForeground', openNewTabForeground);
  await storageLocalSetItemAsync('reloadCommonValues', Date.now());
}
//----------------------------------------------------------------------
async function elTimeoutNumberValueChangeEvent(event) {
  let timeOut = document.getElementById('timeoutNumber').value * 1000;
  await storageLocalSetItemAsync('timeOut', timeOut);
  await storageLocalSetItemAsync('reloadCommonValues', Date.now());
}
//----------------------------------------------------------------------
function openTab(event) {
  let tabName = event.currentTarget.getAttribute('target');
  let i, tabContent, tabLinks;
  tabContent = document.getElementsByClassName('tabContent');
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = 'none';
  }
  tabLinks = document.getElementsByClassName('tabLinks');
  for (i = 0; i < tabLinks.length; i++) {
    tabLinks[i].className = tabLinks[i].className.replace(' active', '');
  }
  document.getElementById(tabName).style.display = 'block';
  event.currentTarget.className += ' active';
}
//----------------------------------------------------------------------
