/*global themeManager*/
/*global getStoredValue_async, storageLocalSetItemAsync*/
'use strict';
//----------------------------------------------------------------------
let commonValues = {
  //read: public, write : use set methods
  alwaysOpenNewTab: true,
  openNewTabForeground: true,
  timeOutMs: 10000,
  displayRootFolder: true,

  iconDF32Url: '/resources/img/drop-feeds-32.png',
  iconDF96Url: '/resources/img/drop-feeds-96.png',
  themeBaseFolderUrl: '/resources/themes/',
  themesListUrl: '/resources/themes/themes.list',
  themeDefaultFolderName: 'dauphine',
  subscribeHtmlUrl: '/html/subscribe.html',
  //------------------------------
  async reload_async() {
    commonValues.alwaysOpenNewTab = await getStoredValue_async('alwaysOpenNewTab', commonValues.alwaysOpenNewTab);
    commonValues.openNewTabForeground = await getStoredValue_async('openNewTabForeground', commonValues.openNewTabForeground);
    commonValues.timeOutMs = await getStoredValue_async('timeOut', commonValues.timeOutMs);
    commonValues.displayRootFolder = await getStoredValue_async('displayRootFolder', commonValues.displayRootFolder);
    if (commonValues.displayRootFolder == 'yes') { commonValues.displayRootFolder = true; }
  },
  //------------------------------
  async setAlwaysOpenNewTab_async(alwaysOpenNewTab){
    commonValues.alwaysOpenNewTab = alwaysOpenNewTab;
    await storageLocalSetItemAsync('alwaysOpenNewTab', alwaysOpenNewTab);
  },
  //------------------------------
  async setOpenNewTabForeground_async(openNewTabForeground){
    commonValues.openNewTabForeground = openNewTabForeground;
    await storageLocalSetItemAsync('openNewTabForeground', openNewTabForeground);
  },
  //------------------------------
  async setTimeOutMs_async(timeOutMs){
    commonValues.timeOutMs = timeOutMs;
    await storageLocalSetItemAsync('timeOutMs', timeOutMs);
  },
  //------------------------------
  async setDisplayRootFolder_async(displayRootFolder){
    commonValues.displayRootFolder = displayRootFolder;
    await storageLocalSetItemAsync('displayRootFolder', displayRootFolder);
  }
};
//----------------------------------------------------------------------
