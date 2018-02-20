/*global checkFeedsForFolderAsync, OpenAllUpdatedFeedsAsync, MarkAllFeedsAsReadAsync, MarkAllFeedsAsUpdatedAsync*/
let _selectedRootElement = null;
let _selectedRootElementId = null;
let _selectedElement = null;
let _selectedElementId = null;
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
  setSelectionBar(event.currentTarget);
}
//----------------------------------------------------------------------
function folderOnClickedEvent(event){
  setSelectionBar(event.currentTarget);
}
//----------------------------------------------------------------------
function getSelectedRootElement() {
  if (!_selectedRootElement) {
    _selectedRootElement = document.getElementById(_selectedRootElementId);
  }
  return _selectedRootElement;
}
//----------------------------------------------------------------------
function setSelectedRootElement(rootElementId) {
  _selectedRootElementId = rootElementId;
}
//----------------------------------------------------------------------
function setSelectionBar(targetElement) {

  let prevSelectedElement = _selectedElement;
  let prevSelectedElementId = _selectedElementId;
  if (prevSelectedElement) {
    prevSelectedElement.removeEventListener('scroll', selectedElementOnScrollEvent);
    let prevElLabel = document.getElementById('lbl-' + prevSelectedElementId);
    if (prevElLabel) {
      prevElLabel.style.color = '';
    }
  }

  let isTheSame = (_selectedElement == targetElement);
  _selectedElement = targetElement;
  if (_selectedElement) {
    _selectedElementId = targetElement.getAttribute('id').substring(3);
    let elLabel = document.getElementById('lbl-' + _selectedElementId);
    if (elLabel) {
      elLabel.style.color = 'white';
      let rectTarget = _selectedElement.getBoundingClientRect();
      let elSelectionBar = document.getElementById('selectionBar');
      let y = rectTarget.top + 5;
      elSelectionBar.style.top = y + 'px';
    }
  }
}
//----------------------------------------------------------------------
function contentOnScrollEvent(event){
  setSelectionBar(_selectedElement);
}
//----------------------------------------------------------------------
function selectedElementOnScrollEvent(event) {
  setSelectionBar(_selectedElement);
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
