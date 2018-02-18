/*global checkFeedsAsync, discoverFeedsAsync, optionsMenuAsync, setSelectionBar, getSelectedRootElement*/
/*global browser, storageLocalGetItemAsync, storageLocalSetItemAsync, defaultStoredFolder, sleep, getStyle, replaceStyle*/
//----------------------------------------------------------------------
'use strict';
let _updatedFeedsVisible=false;
let _errorFeedsVisible=false;
let _foldersOpened=true;
let _buttonAddFeedEnabled=false;
//----------------------------------------------------------------------
async function prepareTopMenuAsync() {
  _updatedFeedsVisible = await storageLocalGetItemAsync('updatedFeedsVisibility');
  setUpdatedFeedsVisibility();
  _errorFeedsVisible = await storageLocalGetItemAsync('errorFeedsVisibility');
  setErrorFeedsVisibility();
  updatingSelectedButton('toggleFoldersButton' ,_foldersOpened);

  document.getElementById('checkFeedsButton').addEventListener('click', checkFeedsButtonClickedEvent);
  let elDiscoverFeedsButton = document.getElementById('discoverFeedsButton');
  elDiscoverFeedsButton.addEventListener('click', discoverFeedsButtonClickedEvent);
  elDiscoverFeedsButton.style.opacity = '0.2';
  document.getElementById('onlyUpdatedFeedsButton').addEventListener('click', onlyUpdatedFeedsButtonClickedEvent);
  //document.getElementById('onlyErrorFeedsButton').addEventListener('click', onlyErrorFeedsButtonClickedEvent);
  document.getElementById('toggleFoldersButton').addEventListener('click', toggleFoldersButtonClickedEvent);
  document.getElementById('addFeedButton').addEventListener('click', addFeedButtonClickedEvent);
  document.getElementById('optionsMenuButton').addEventListener('click', optionsMenuClickedEvent);
}
//----------------------------------------------------------------------
function buttonAddFeedEnable(isEnable) {
  if (isEnable) {
    _buttonAddFeedEnabled = true;
    document.getElementById('addFeedButton').style.opacity = '1';
  }
  else {
    _buttonAddFeedEnabled = false;
    document.getElementById('addFeedButton').style.opacity = '0.2';
  }
}
//----------------------------------------------------------------------
function updatingFeedsButtons(updateInProgress) {
  if (updateInProgress)
  {
    document.getElementById('checkFeedsButton').classList.add('checkFeedsButtonAnim');
    document.getElementById('checkFeedsButton').classList.remove('checkFeedsButton');

    document.getElementById('statusButton').classList.add('statusButtonUpdating');
  }
  else
  {
    document.getElementById('checkFeedsButton').classList.add('checkFeedsButton');
    document.getElementById('checkFeedsButton').classList.remove('checkFeedsButtonAnim');

    document.getElementById('statusButton').classList.remove('statusButtonUpdating');
  }
}
//----------------------------------------------------------------------
function printToStatusBar(text) {
  let statusBar = document.getElementById('statusText');
  statusBar.innerHTML = text;
}
//----------------------------------------------------------------------
function checkFeedsButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  setSelectionBar(getSelectedRootElement());
  checkFeedsAsync(document);
}
//----------------------------------------------------------------------

function onlyUpdatedFeedsButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  _updatedFeedsVisible = ! _updatedFeedsVisible;
  _errorFeedsVisible = ! _updatedFeedsVisible;
  setSelectionBar(getSelectedRootElement());
  setUpdatedFeedsVisibility();
}
//----------------------------------------------------------------------
function onlyErrorFeedsButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  setSelectionBar(getSelectedRootElement());
  setErrorFeedsVisibility();
}
//----------------------------------------------------------------------
function setUpdatedFeedsVisibility() {
  updatingSelectedButton('onlyUpdatedFeedsButton',  _updatedFeedsVisible);
  let visibleValue = _updatedFeedsVisible ? 'display:none;' : 'visibility:visible;';
  replaceStyle('.feedUnread', '  visibility: visible;\n  font-weight: bold;');
  replaceStyle('.feedRead', visibleValue);
  replaceStyle('.feedError', visibleValue);
  storageLocalSetItemAsync('updatedFeedsVisibility', _updatedFeedsVisible);
}
//----------------------------------------------------------------------
function setErrorFeedsVisibility() {
  let visibleValue = _errorFeedsVisible ? 'visibility:visible;' : 'display:none,';
  //replaceStyle('.feedError', visibleValue);
  if (_errorFeedsVisible) {
    replaceStyle('.feedRead', 'display:none;');
    replaceStyle('.feedUnread', 'display:none; ');
  }
  else{
    setUpdatedFeedsVisibility();
  }
  storageLocalSetItemAsync('errorFeedsVisibility', _errorFeedsVisible);
}
//----------------------------------------------------------------------
function toggleFoldersButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  setSelectionBar(getSelectedRootElement());
  _foldersOpened = !_foldersOpened;
  let query = _foldersOpened ? 'not(checked)' : 'checked';
  let folders = document.querySelectorAll('input[type=checkbox]:' + query);
  let i = folders.length;
  updatingSelectedButton('toggleFoldersButton' ,_foldersOpened);
  while (i--) {
    let folderId = folders[i].id;
    let storedFolder = defaultStoredFolder(folderId);
    folders[i].checked = _foldersOpened;
    storedFolder.checked = _foldersOpened;
    storageLocalSetItemAsync(folderId, storedFolder);
  }
}
//----------------------------------------------------------------------
async function addFeedButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  setSelectionBar(getSelectedRootElement());
  if (!_buttonAddFeedEnabled) { return; }
  browser.pageAction.openPopup();
}
//----------------------------------------------------------------------
async function discoverFeedsButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  setSelectionBar(getSelectedRootElement());
  printToStatusBar('not yet implemented!');
  await sleep(250);
  printToStatusBar('');
}
//----------------------------------------------------------------------
async function optionsMenuClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  setSelectionBar(getSelectedRootElement());
  await browser.runtime.openOptionsPage();
}
//----------------------------------------------------------------------
function updatingSelectedButton(elementId, selected) {
  let el =  document.getElementById(elementId);
  if (selected)
  {
    el.classList.add('topMenuItemSelected');
    el.classList.remove('topMenuItem');
  }
  else
  {
    el.classList.add('topMenuItem');
    el.classList.remove('topMenuItemSelected');
  }
}
//----------------------------------------------------------------------
