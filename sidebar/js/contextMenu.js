/*global checkFeedsForFolderAsync, OpenAllUpdatedFeedsAsync, MarkAllFeedsAsReadAsync, MarkAllFeedsAsUpdatedAsync*/

//---------------------------------------------------------------------- 
function addEventListenerContextMenus() {
  addEventListener('main', 'click', mainOnClickedEvent);  
  addEventListener('ctxMnCheckFeeds', 'click', checkFeedsMenuClicked);
  addEventListener('ctxMnMarkAllasRead', 'click', markAllFeedsAsReadMenuClicked);
  addEventListener('ctxMnMarkAllasUpdated', 'click', markAllFeedsAsUpdatedMenuClicked);
  addEventListener('ctxMnOpenAllUpdated', 'click', openAllUpdatedFeedsMenuClicked);
}
//---------------------------------------------------------------------- 
function contextMenusOnClickedEvent(event){
  event.stopPropagation();
  event.preventDefault();
  let elcontent = document.getElementById('content');
  let elContextMenu = document.getElementById('contextMenuId');
  let idComeFrom = event.currentTarget.getAttribute('id');
  elContextMenu.setAttribute('comeFrom', idComeFrom);  
  elContextMenu.classList.add('show');
  let x  = Math.max(0, elcontent.offsetWidth - elContextMenu.offsetWidth - 36);
  x = Math.min(x, event.clientX);  
  elContextMenu.style.left = x + 'px';
  elContextMenu.style.top = event.clientY + 'px';
}
//---------------------------------------------------------------------- 
function mainOnClickedEvent(event){
  document.getElementById('contextMenuId').classList.remove('show');
}
//----------------------------------------------------------------------
async function checkFeedsMenuClicked(event) {
  let elContextMenu = document.getElementById('contextMenuId');
  elContextMenu.classList.remove('show');
  let idComeFrom = elContextMenu.getAttribute('comeFrom');
  checkFeedsForFolderAsync(idComeFrom);
}
//----------------------------------------------------------------------
async function openAllUpdatedFeedsMenuClicked(event) {
  let elContextMenu = document.getElementById('contextMenuId');
  elContextMenu.classList.remove('show');
  let idComeFrom = elContextMenu.getAttribute('comeFrom');
  OpenAllUpdatedFeedsAsync(idComeFrom);
}
//----------------------------------------------------------------------
async function markAllFeedsAsReadMenuClicked(event) {
  let elContextMenu = document.getElementById('contextMenuId');
  elContextMenu.classList.remove('show');
  let idComeFrom = elContextMenu.getAttribute('comeFrom');
  MarkAllFeedsAsReadAsync(idComeFrom);
}
//----------------------------------------------------------------------
async function markAllFeedsAsUpdatedMenuClicked(event) {
  let elContextMenu = document.getElementById('contextMenuId');
  elContextMenu.classList.remove('show');
  let idComeFrom = elContextMenu.getAttribute('comeFrom');
  MarkAllFeedsAsUpdatedAsync(idComeFrom);
}
//----------------------------------------------------------------------
