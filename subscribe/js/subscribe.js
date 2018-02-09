/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global browser, storageLocalGetItemAsync, makeIndent, storageLocalSetItemAsync*/
//----------------------------------------------------------------------
"use strict";
let _html= [];
let _feedTitle = null;
let _feedUrl = null;
let _selectedId = null;
mainSbc();
//----------------------------------------------------------------------
async function mainSbc() {
  let subscribeInfo = await storageLocalGetItemAsync('subscribeInfo');
  if (subscribeInfo) {
    storageLocalSetItemAsync('subscribeInfo', null);
    _feedTitle = subscribeInfo.feedTitle;
    _feedUrl = subscribeInfo.feedUrl;
  }
  else {
    let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
    _feedTitle = tabInfos[0].title;
    _feedUrl = tabInfos[0].url;
  }
  
  _selectedId = await storageLocalGetItemAsync('rootBookmarkId');
  loadFolderViewAsync( _selectedId);
  document.getElementById('inputName').value = _feedTitle;
  addEventListener('newFolderButton', 'click', newFolderButtonClickedEvent);
  addEventListener('cancelButton', 'click', cancelButtonClickedEvent);
  addEventListener('subscribeButton', 'click', subscribeButtonClickedEvent);  
  addEventListener('cancelNewFolderButton', 'click', cancelNewFolderButtonClickedEvent);
  addEventListener('createNewFolderButton', 'click', createNewFolderButtonClickedEvent);
}
//----------------------------------------------------------------------
async function newFolderButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  
  let idComeFrom = event.currentTarget.getAttribute('id');
  showNewFolderDialog();  
}
//----------------------------------------------------------------------
function showNewFolderDialog() {
  let elNewFolderDialog = document.getElementById('newFolderDialog');
  let elMainDiv = document.getElementById('mainDiv');  
  let elSelectedLabel = document.getElementById('lbl-' + _selectedId);  
  let rectSelectedLabel = elSelectedLabel.getBoundingClientRect();
  let x = Math.round(rectSelectedLabel.left);
  let y = Math.round(rectSelectedLabel.bottom);  
  elNewFolderDialog.classList.remove('hide');
  elNewFolderDialog.classList.add('show');  
  let xMax  = Math.max(0, elMainDiv.offsetWidth - elNewFolderDialog.offsetWidth + 18);
  let yMax  = Math.max(0, elMainDiv.offsetHeight - elNewFolderDialog.offsetHeight + 20);
  x = Math.min(xMax, x);
  y = Math.min(yMax, y);  
  elNewFolderDialog.style.left = x + 'px';
  elNewFolderDialog.style.top = y + 'px';  
}
//----------------------------------------------------------------------
function hideNewFolderDialog() {
  let elNewFolderDialog = document.getElementById('newFolderDialog');
  elNewFolderDialog.classList.remove('show');
  elNewFolderDialog.classList.add('hide');
}
//----------------------------------------------------------------------
async function cancelButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  window.close(); 
}
//----------------------------------------------------------------------
async function subscribeButtonClickedEvent(event) {
  try {
    let name = document.getElementById('inputName').value;
    await browser.bookmarks.create({parentId: _selectedId, title: name, url: _feedUrl});
  }
  catch(e) {
    console.log('e:', e);
  }
  window.close();
}
//----------------------------------------------------------------------
async function loadFolderViewAsync(idToSelect) {
  let rootBookmarkId = await storageLocalGetItemAsync('rootBookmarkId');
  let subTree = await browser.bookmarks.getSubTree(rootBookmarkId);
  await createItemsForSubTreeAsync(subTree, idToSelect);
  addEventListenerOnFolders();
}
//----------------------------------------------------------------------
async function createItemsForSubTreeAsync(bookmarkItems, idToSelect) {
  _html= [];
  await prepareItemsrecursivelyAsync(bookmarkItems[0], 10, idToSelect);
  document.getElementById('content').innerHTML = '\n' + _html.join('');
}
//----------------------------------------------------------------------
async function prepareItemsrecursivelyAsync(bookmarkItem, indent, idToSelect) {
  //let isFolder = (!bookmarkItem.url && bookmarkItem.BookmarkTreeNodeType == 'bookmark');
  let isFolder = (!bookmarkItem.url);
  if (isFolder) {
    await createFolderItemAsync(bookmarkItem, indent, idToSelect);
    indent += 2;
  }
  indent -=2;
}
//----------------------------------------------------------------------
async function createFolderItemAsync (bookmarkItem, indent, idToSelect) {
    let id = bookmarkItem.id;
    let folderName = bookmarkItem.title;
    let selected = (idToSelect == id ? ' class="selected"' : '');
    let selected1 = (idToSelect == id ? ' class="selected1"' : '');
    let folderLine = '';
    folderLine += makeIndent(indent) + 
    '<div id="dv-' + id + '" class="folder">\n';
    indent += 2;    
    folderLine += makeIndent(indent) + 
      '<li>' + 
      '<input type="checkbox" id="cb-' + id + '" checked' + selected1 + '/>' +
      '<label for="cb-' + id + '" class="folderClose"' + selected1 + '></label>' + 
      '<label for="cb-' + id + '" class="folderOpen"' + selected1 + '></label>' + 
      '<label id="lbl-' + id + '" class="folderLabel"' + selected + '>' + folderName + '</label>\n';
    folderLine += makeIndent(indent) + '<ul id="ul-' + id + '">\n';
    indent += 2;
    _html.push(folderLine);
    if (bookmarkItem.children) {
      for (let child of bookmarkItem.children) {
        await prepareItemsrecursivelyAsync(child, indent, idToSelect);
      }
    }
    indent -= 2;
    _html.push(makeIndent(indent) + '</ul>\n');
    _html.push(makeIndent(indent) + '</li>\n');
    indent -= 2;
    _html.push(makeIndent(indent) + '</div>\n');
}
//----------------------------------------------------------------------
function addEventListenerOnFolders() {  
  let els = document.querySelectorAll('.folderLabel');
  for (let i = 0; i < els.length; i++) {
    els[i].addEventListener('click', folderOnClickedEvent);
  }
}
//----------------------------------------------------------------------
async function folderOnClickedEvent(event) {
  let elLabel = event.currentTarget;
  let id = elLabel.getAttribute('id').substring(4);
  _selectedId = id;
  //Unselecting
  let labelsToUnseletec = document.querySelectorAll('.folderLabel, .folderClose, .folderOpen, label');
  for (let i = 0; i < labelsToUnseletec.length; i++) {
    labelsToUnseletec[i].classList.remove('selected');
    labelsToUnseletec[i].classList.remove('selected1');
  }
  //Selecting
  elLabel.classList.add('selected');
  let labelsToSeletec = document.querySelectorAll('label[for="cb-' + id + '"]');
  for (let i = 0; i < labelsToSeletec.length; i++) {
    labelsToSeletec[i].classList.add('selected1');
  }
  //document.getElementById('lbl-' + id).classList.add('selected');
  document.getElementById('cb-' + id).classList.add('selected1');
}
//----------------------------------------------------------------------
async function cancelNewFolderButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  hideNewFolderDialog();
}
//----------------------------------------------------------------------
async function createNewFolderButtonClickedEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  try {
    let folderName = document.getElementById('inputNewFolder').value;
    await browser.bookmarks.create({parentId: _selectedId, title: folderName});
    loadFolderViewAsync(_selectedId);
  }
  catch(e) {
    console.log('e:', e);
  }
  hideNewFolderDialog();
}
//----------------------------------------------------------------------
