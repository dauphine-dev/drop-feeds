/*global browser, commonValues*/
/*global getStoredValue_async, storageLocalGetItemAsync, storageLocalSetItemAsync*/
'use strict';
//----------------------------------------------------------------------
let themeManager = {
  themeFolderName: commonValues.instance.themeDefaultFolderName,
  themeFolderUrl: commonValues.instance.themeBaseFolderUrl + commonValues.instance.themeDefaultFolderName,

  async reload_async() {
    themeManager.themeFolderName = await getStoredValue_async('themeFolderName', themeManager.themeFolderName);
    themeManager._reloadValues();
  },

  _reloadValues() {
    themeManager.themeFolderUrl = commonValues.instance.themeBaseFolderUrl + this.themeFolderName + '/';
  },

  async setThemeFolderName_async(themeFolderName) {
    themeManager.themeFolderName = themeFolderName;
    themeManager._reloadValues();
    await storageLocalSetItemAsync('themeFolderName', themeFolderName);
  },

  applyCssToCurrentDocument(cssName) {
    let cssUrl = themeManager.themeFolderUrl + 'css/' + cssName;
    let elCssLink = document.getElementById('cssLink');
    elCssLink.setAttribute('href', cssUrl);
  },

  getCssUrl(cssName) {
    let cssUrl = themeManager.themeFolderUrl + 'css/' + cssName;
    return cssUrl;
  },

  getImgUrl(imgName) {
    let icoUrl = themeManager.themeFolderUrl + 'img/' + imgName;
    return icoUrl;
  }
};
//----------------------------------------------------------------------
