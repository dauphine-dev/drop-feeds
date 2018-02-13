/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global checkFeedsAsync, discoverFeedsAsync, toogleUpdatedFeedsVisibity, toogleFolders, optionsMenuAsync, toogleErrorFeedsVisibity*/
/*global browser, storageLocalGetItemAsync, storageLocalSetItemAsync, defaultStoredFolder, sleep, getStyle, replaceStyle*/
//----------------------------------------------------------------------
'use strict';
let _updatedFeedsVisible=false;
let _errorFeedsVisible=false;
let _foldersOpenned=true;
let _buttonAddFeedEnabled=false;
//----------------------------------------------------------------------
async function prepareTopMenuAsync() {
  _updatedFeedsVisible = await storageLocalGetItemAsync('updatedFeedsVisibity');
  setUpdatedFeedsVisibity();    
  _errorFeedsVisible = await storageLocalGetItemAsync('errorFeedsVisibity');
  setErrorFeedsVisibity();
 
  document.getElementById('discoverFeedsButton').style.opacity = '0.2';      
  addEventListener('checkFeedsButton', 'click', checkFeedsButtonClickedEvent);
  addEventListener('discoverFeedsButton', 'click', discoverFeedsButtonClickedEvent);
  addEventListener('onlyUpdatedFeedsButton', 'click', onlyUpdatedFeedsButtonClickedEvent);
  //addEventListener('onlyErrorFeedsButton', 'click', onlyErrorFeedsButtonClickedEvent);
  addEventListener('toogleFoldersButton', 'click', toogleFoldersButtonClickedEvent);
  addEventListener('addFeedButton', 'click', addFeedButtonClickedEvent);
  addEventListener('optionsMenuButton', 'click', optionsMenuClickedEvent);
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
function updatingFeedsButtons(updateInprogress) {
  if (updateInprogress)
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
  checkFeedsAsync(null, document);
}
//---------------------------------------------------------------------- 

function onlyUpdatedFeedsButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  _updatedFeedsVisible = ! _updatedFeedsVisible;
  setUpdatedFeedsVisibity();
}
//---------------------------------------------------------------------- 
function onlyErrorFeedsButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  _errorFeedsVisible = ! _errorFeedsVisible;
  setErrorFeedsVisibity();
}
//---------------------------------------------------------------------- 
function setUpdatedFeedsVisibity() {
  let visibleValue = _updatedFeedsVisible ? 'display:none;' : 'visibility:visible;';
  replaceStyle('.feedUnread', '  visibility: visible;\n  font-weight: bold;');
  replaceStyle('.feedRead', visibleValue);
  storageLocalSetItemAsync('updatedFeedsVisibity', _updatedFeedsVisible);
}
//---------------------------------------------------------------------- 
function setErrorFeedsVisibity() {
  let visibleValue = _errorFeedsVisible ? 'visibility:visible;' : 'display:none,';
  //replaceStyle('.feedError', visibleValue);
  if (_errorFeedsVisible) {
    replaceStyle('.feedRead', 'display:none;');
    replaceStyle('.feedUnread', 'display:none; ');
  }
  else{
    setUpdatedFeedsVisibity();
  }
  storageLocalSetItemAsync('errorFeedsVisibity', _errorFeedsVisible);
}
//---------------------------------------------------------------------- 
function toogleFoldersButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  _foldersOpenned = !_foldersOpenned;
  let query = _foldersOpenned ? 'not(checked)' : 'checked';
  let folders = document.querySelectorAll('input[type=checkbox]:' + query);
  let i = folders.length;
  while (i--) {
    let folderId = folders[i].id;
    let storedFolder = defaultStoredFolder(folderId);
    folders[i].checked = _foldersOpenned;
    storedFolder.checked = _foldersOpenned;
    storageLocalSetItemAsync(folderId, storedFolder);    
  } 
}
//---------------------------------------------------------------------- 
async function addFeedButtonClickedEvent(event) {
  if (!_buttonAddFeedEnabled) { return; }
  browser.pageAction.openPopup();
  event.stopPropagation();
  event.preventDefault();
}
//---------------------------------------------------------------------- 
async function discoverFeedsButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  printToStatusBar('not yet implemented!');
  await sleep(250);
  printToStatusBar('');
}
//---------------------------------------------------------------------- 
async function optionsMenuClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  await browser.runtime.openOptionsPage();
}
//---------------------------------------------------------------------- 
