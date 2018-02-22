/*global browser*/
//----------------------------------------------------------------------
'use strict';
const _iconNoneUrl = '/resources/img/none.png';
const _iconDF96Url = '/resources/img/drop-feeds-96.png';
const _iconDF96ShadowUrl = '/resources/img/drop-feeds-shadow-96.png';
const _sidebarUrl = '/html/sidebar.html';
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
  browser.browserAction.setIcon({path: _iconNoneUrl});
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
    let panelUrl = browser.extension.getURL(_sidebarUrl);
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
  let iconUrl = (sidebarActionIsOpen ? _iconDF96ShadowUrl : _iconDF96Url);
  browser.browserAction.setIcon({path: iconUrl});
  */
}
//----------------------------------------------------------------------
