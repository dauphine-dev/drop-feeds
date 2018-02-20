/*global  browser, getThemeFolderNameAsync*/
//----------------------------------------------------------------------
'use strict';
const verEnum = {
  MAJ : 0,
  MIN : 1,
  REV : 2
};
let _sidebarActionIsOpen = false;
mainBg();
//----------------------------------------------------------------------
async function mainBg() {
  let version = await getBrowserVersionAsync();
  if (version[verEnum.MAJ] < 57) {
    disableBrowserAction();
    return;
  }
  _sidebarActionIsOpen = await sidebarActionIsOpenAsync();
  setSidebarActionIcon(_sidebarActionIsOpen);
  browser.browserAction.onClicked.addListener(toggleDropFeedsPanelAsync);

}
//----------------------------------------------------------------------
function disableBrowserAction() {
  browser.browserAction.setIcon({path: '/icons/none.png'});
  browser.browserAction.disable();
  browser.browserAction.setBadgeText({text: ''});
  browser.browserAction.setTitle({title: ''});
}
//----------------------------------------------------------------------
async function getBrowserVersionAsync() {
  let browserInfo = await browser.runtime.getBrowserInfo();
  let version = browserInfo.version.split('.');
  return version;
}
//----------------------------------------------------------------------
async function toggleDropFeedsPanelAsync(){
  if (_sidebarActionIsOpen) {
    browser.sidebarAction.close();
  }
  else {
    let panelUrl = browser.extension.getURL('sidebar/sidebar.html');
    browser.sidebarAction.setPanel({panel: panelUrl});
    browser.sidebarAction.open();
  }
  _sidebarActionIsOpen = await sidebarActionIsOpenAsync();
  setSidebarActionIcon(_sidebarActionIsOpen);
}
//----------------------------------------------------------------------
async function sidebarActionIsOpenAsync() {
  let isOpen = false;
  try {
    isOpen = await browser.sidebarAction.isOpen();
  }
  catch(e) {
    isOpen = ! _sidebarActionIsOpen;
  }
  return isOpen;
}
//----------------------------------------------------------------------
function setSidebarActionIcon(sidebarActionIsOpen) {
  /*
  let iconUrl = '/icons/drop-feeds' + (sidebarActionIsOpen ? '-shadow' : '') + '-96.png';
  browser.browserAction.setIcon({path: iconUrl});
  */
}
//----------------------------------------------------------------------
