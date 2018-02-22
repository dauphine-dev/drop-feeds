/*global browser, commonValues, getStoredValue_async, storageLocalGetItemAsync, storageLocalSetItemAsync*/
'use strict';
//----------------------------------------------------------------------
let themeManager = {
  themeFolderName: commonValues.themeDefaultFolderName,
  themeFolderUrl: commonValues.themeBaseFolderUrl + commonValues.themeDefaultFolderName,

  async reload_async() {
    themeManager.themeFolderName = await getStoredValue_async('themeFolderName', themeManager.themeFolderName);
    themeManager._reloadValues();
  },

  async _reloadValues() {
    themeManager.themeFolderUrl = commonValues.themeBaseFolderUrl + this.themeFolderName + '/';
  },

  async setThemeFolderName_async(themeFolderName) {
    themeManager.themeFolderName = themeFolderName;
    themeManager._reloadValues();
    await storageLocalSetItemAsync('themeFolderName', themeFolderName);
  },

  async applyCssToCurrentDocument_async(cssName) {
    let cssUrl = themeManager.themeFolderUrl + 'css/' + cssName;
    let elCssLink = document.getElementById('cssLink');
    elCssLink.setAttribute('href', cssUrl);
  },

  getCssRawUrl(cssName) {
    let cssUrl = themeManager.themeFolderUrl + 'css/' + cssName;
    return cssUrl;
  },

  getCssMozUrl(cssName) {
    let cssMozUrl = browser.extension.getURL(themeManager.themeFolderUrl + 'css/' + cssName);
    return cssMozUrl;
  },

  getImgRawUrl(imgName) {
    let icoUrl = themeManager.themeFolderUrl + 'img/' + imgName;
    return icoUrl;
  }
};
//----------------------------------------------------------------------
