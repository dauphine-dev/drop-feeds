/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global  browser*/
//----------------------------------------------------------------------
"use strict";
const verEnum = {
  MAJ : 0,
  MIN : 1,
  REV : 2  
};
let _sidebarActionIsOpen = false;
mainBg();
//----------------------------------------------------------------------
async function mainBg() {  
  //addingTestContextMenus();
  let version = await getBrowserVersionAsync();
  if (version[verEnum.MAJ] < 57) {
    disableBrowserAction();
    return;
  }    
  _sidebarActionIsOpen = await sidebarActionIsOpenAsync();
  browser.browserAction.onClicked.addListener(toggleDropFeedsPanelAsync);
}
//----------------------------------------------------------------------
function addingTestContextMenus() {
  browser.contextMenus.create( {id: 'test', title:'test', contexts: ["all"] });
  browser.contextMenus.onClicked.addListener(contextMenusOnClickedEvent);  
}
//----------------------------------------------------------------------
function contextMenusOnClickedEvent(info, tab) {
  switch (info.menuItemId) {
    case "test":
      testAsync();
      break;
  }
}
//----------------------------------------------------------------------
async function testAsync() {
}
//----------------------------------------------------------------------
function disableBrowserAction() {
  browser.browserAction.setIcon({path: '../../ressources/none.png'});
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
  //let isOpen = await browser.sidebarAction.isOpen();
  //if (isOpen) {
  if (_sidebarActionIsOpen) {
    browser.sidebarAction.close();
  }
  else {
    let panelUrl = browser.extension.getURL("sidebar/sidebar.html");
    browser.sidebarAction.setPanel({panel: panelUrl});
    browser.sidebarAction.open();
  }
  _sidebarActionIsOpen = await sidebarActionIsOpenAsync();  
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
