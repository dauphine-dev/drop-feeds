/*global  selectionBar, checkFeedsForFolderAsync, OpenAllUpdatedFeedsAsync, MarkAllFeedsAsReadAsync, MarkAllFeedsAsUpdatedAsync*/
//----------------------------------------------------------------------
function addEventListenerContextMenus() {
  document.getElementById('main').addEventListener('click', mainOnClickedEvent);
  document.getElementById('ctxMnCheckFeeds').addEventListener('click', checkFeedsMenuClicked);
  document.getElementById('ctxMnMarkAllAsRead').addEventListener('click', markAllFeedsAsReadMenuClicked);
  document.getElementById('ctxMnMarkAllAsUpdated').addEventListener('click', markAllFeedsAsUpdatedMenuClicked);
  document.getElementById('ctxMnOpenAllUpdated').addEventListener('click', openAllUpdatedFeedsMenuClicked);
}
//----------------------------------------------------------------------
function contextMenusOnClickedEvent(event){
  event.stopPropagation();
  event.preventDefault();
  let elContent = document.getElementById('content');
  let elContextMenu = document.getElementById('contextMenuId');
  let idComeFrom = event.currentTarget.getAttribute('id');
  elContextMenu.setAttribute('comeFrom', idComeFrom);
  elContextMenu.classList.add('show');
  let xMax  = Math.max(0, elContent.offsetWidth - elContextMenu.offsetWidth - 36);
  let x = Math.min(xMax, event.clientX);
  elContextMenu.style.left = x + 'px';

  let rectTarget = event.currentTarget.getBoundingClientRect();
  let yMax  = Math.max(0, elContent.offsetHeight - elContextMenu.offsetHeight + 60);
  let y = Math.min(yMax, rectTarget.top+ 17);
  elContextMenu.style.top = y + 'px';
  selectionBar.put(event.currentTarget);
}
//----------------------------------------------------------------------
function mainOnClickedEvent(){
  document.getElementById('contextMenuId').classList.remove('show');
}
//----------------------------------------------------------------------
async function checkFeedsMenuClicked() {
  let elContextMenu = document.getElementById('contextMenuId');
  elContextMenu.classList.remove('show');
  let idComeFrom = elContextMenu.getAttribute('comeFrom');
  checkFeedsForFolderAsync(idComeFrom);
}
//----------------------------------------------------------------------
async function openAllUpdatedFeedsMenuClicked() {
  let elContextMenu = document.getElementById('contextMenuId');
  elContextMenu.classList.remove('show');
  let idComeFrom = elContextMenu.getAttribute('comeFrom');
  OpenAllUpdatedFeedsAsync(idComeFrom);
}
//----------------------------------------------------------------------
async function markAllFeedsAsReadMenuClicked() {
  let elContextMenu = document.getElementById('contextMenuId');
  elContextMenu.classList.remove('show');
  let idComeFrom = elContextMenu.getAttribute('comeFrom');
  MarkAllFeedsAsReadAsync(idComeFrom);
}
//----------------------------------------------------------------------
async function markAllFeedsAsUpdatedMenuClicked() {
  let elContextMenu = document.getElementById('contextMenuId');
  elContextMenu.classList.remove('show');
  let idComeFrom = elContextMenu.getAttribute('comeFrom');
  MarkAllFeedsAsUpdatedAsync(idComeFrom);
}
//----------------------------------------------------------------------
