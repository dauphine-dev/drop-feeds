/*global browser*/
'use strict';
const ICON_NONE_URL = '/resources/img/none.png';
const SIDEBAR_URL = '/html/sidebar.html';
const VERSION_ENUM = {
  MAJ : 0,
  MIN : 1,
  REV : 2
};
let _sidebarActionIsOpen = false;

class BackgroundManager {
  static async start() {
    let version = await BackgroundManager._getBrowserVersionAsync();
    if (version[VERSION_ENUM.MAJ] < 57) {
      BackgroundManager._disableBrowserAction();
      return;
    }
    _sidebarActionIsOpen = await BackgroundManager._sidebarActionIsOpenAsync();
    browser.browserAction.onClicked.addListener(BackgroundManager._toggleDropFeedsPanelAsync);

  }

  static _disableBrowserAction() {
    browser.browserAction.setIcon({path: ICON_NONE_URL});
    browser.browserAction.disable();
    browser.browserAction.setBadgeText({text: ''});
    browser.browserAction.setTitle({title: ''});
  }

  static async _getBrowserVersionAsync() {
    let browserInfo = await browser.runtime.getBrowserInfo();
    let version = browserInfo.version.split('.');
    return version;
  }

  static async _toggleDropFeedsPanelAsync(){
    if (_sidebarActionIsOpen) {
      browser.sidebarAction.close();
    }
    else {
      let panelUrl = browser.extension.getURL(SIDEBAR_URL);
      browser.sidebarAction.setPanel({panel: panelUrl});
      browser.sidebarAction.open();
    }
    _sidebarActionIsOpen = await BackgroundManager._sidebarActionIsOpenAsync();
  }

  static async _sidebarActionIsOpenAsync() {
    let isOpen = false;
    try {
      isOpen = await browser.sidebarAction.isOpen();
    }
    catch(e) {
      isOpen = ! _sidebarActionIsOpen;
    }
    return isOpen;
  }
}

BackgroundManager.start();
