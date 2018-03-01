/*global browser, commonValues, themeManager, localStorageManager, dateTime*/
/*global createFeedFolderOptionsAsync, ImportOmplFileAsync, GetUrlForExportedOpmlFileAsync, createThemeOptionsAsync*/
'use strict';
//----------------------------------------------------------------------
main();
//----------------------------------------------------------------------
async function main() {
  await themeManager.instance.init_async();
  await commonValues.instance.init_async();
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
  let notDisplayRootFolder = ! commonValues.instance.displayRootFolder;
  let elNotDisplayRootFolderCheckBox = document.getElementById('notDisplayRootFolderCheckBox');
  elNotDisplayRootFolderCheckBox.checked = notDisplayRootFolder;
  elNotDisplayRootFolderCheckBox.addEventListener('click', notDisplayRootFolderCheckBoxClickedEvent);
  //Select feed folder
  let feedFolderSelectHtml = await createFeedFolderOptionsAsync();
  document.getElementById('feedList').innerHTML += feedFolderSelectHtml;
  document.getElementById('feedFolderSelect').addEventListener('change', feedFolderSelectChangedEvent);
  document.getElementById('applySelectedFeedButton').addEventListener('click', applySelectedFeedButtonClickedEvent);
}
//----------------------------------------------------------------------
async function prepareUpdateCheckerPanelAsync() {
  let elTimeoutNumber = document.getElementById('timeoutNumber');
  let timeOut = commonValues.instance.timeOut;
  elTimeoutNumber.value = timeOut;
  elTimeoutNumber.addEventListener('change', elTimeoutNumberValueChangeEvent);
}
//----------------------------------------------------------------------
async function prepareContentAreaPanelAsync() {
  let elAlwaysOpenNewTabCheckbox = document.getElementById('alwaysOpenNewTabCheckbox');
  elAlwaysOpenNewTabCheckbox.checked = commonValues.instance.alwaysOpenNewTab;
  elAlwaysOpenNewTabCheckbox.addEventListener('click', alwaysOpenNewTabCheckBoxClickedEvent);

  let elOpenNewTabForegroundCheckbox = document.getElementById('openNewTabForegroundCheckbox');
  elOpenNewTabForegroundCheckbox.checked =  commonValues.instance.openNewTabForeground;
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
async function importButtonOnClickedEvent() {
  document.getElementById('inputImportFile').click();
}
//----------------------------------------------------------------------
async function importInputChangedEvent() {
  let file = document.getElementById('inputImportFile').files[0];
  let reader = new FileReader();
  reader.onload = ImportOmplFileAsync;
  reader.readAsText(file);
}
//----------------------------------------------------------------------
async function exportButtonOnClickedEvent() {
  let opmlFileUrl = await GetUrlForExportedOpmlFileAsync();
  browser.downloads.download({url : opmlFileUrl, filename: 'export.opml', saveAs: true });
}
//----------------------------------------------------------------------
async function feedFolderSelectChangedEvent() {
  document.getElementById('applySelectedFeedButton').style.display = '';
}
//----------------------------------------------------------------------
async function applySelectedFeedButtonClickedEvent() {
  let rootBookmarkId = document.getElementById('feedFolderSelect').value;
  await localStorageManager.clean();
  commonValues.instance.rootBookmarkId = rootBookmarkId;
  await localStorageManager.setValue_async('reloadPanel', Date.now());
  await dateTime.delay_async(100);
  document.getElementById('applySelectedFeedButton').style.display = 'none';
}
//----------------------------------------------------------------------
async function notDisplayRootFolderCheckBoxClickedEvent() {
  commonValues.instance.displayRootFolder = ! document.getElementById('notDisplayRootFolderCheckBox').checked;
  await localStorageManager.setValue_async('reloadPanel', Date.now());
}
//----------------------------------------------------------------------
async function themeSelectChangedEvent() {
  let themeName = document.getElementById('themeSelect').value;
  await themeManager.instance.setThemeFolderName_async(themeName);
  await localStorageManager.setValue_async('reloadPanelWindow', Date.now());
}
//----------------------------------------------------------------------
async function alwaysOpenNewTabCheckBoxClickedEvent() {
  commonValues.instance.alwaysOpenNewTab = document.getElementById('alwaysOpenNewTabCheckbox').checked;
}
//----------------------------------------------------------------------
async function openNewTabForegroundCheckboxClickedEvent() {
  commonValues.instance.openNewTabForeground = document.getElementById('openNewTabForegroundCheckbox').checked;
}
//----------------------------------------------------------------------
async function elTimeoutNumberValueChangeEvent() {
  commonValues.instance.timeOut = document.getElementById('timeoutNumber').value;
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
