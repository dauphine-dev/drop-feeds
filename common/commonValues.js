/*global themeManager, getStoredValue_async*/
'use strict';
//----------------------------------------------------------------------
let commonValues = {
  alwaysOpenNewTab: true,
  openNewTabForeground: true,
  timeOutMs: 10000,
  iconDF32Url: '/icons/drop-feeds-32.png',
  iconDF96Url: '/icons/drop-feeds-96.png',

  themeBaseFolderUrl: '/themes/',
  themesListUrl: '/themes/themes.list',
  themeDefaultFolderName: 'dauphine',

  async reload_async() {
    this.alwaysOpenNewTab = await getStoredValue_async('alwaysOpenNewTab', commonValues.alwaysOpenNewTab);
    this.openNewTabForeground = await getStoredValue_async('openNewTabForeground', commonValues.openNewTabForeground);
    this.timeOutMs = await getStoredValue_async('timeOut', commonValues.timeOutMs);
  },
  async reloadAll_async() {
    await commonValues.reload_async();
    await themeManager.reload_async();
  }
};
//----------------------------------------------------------------------
