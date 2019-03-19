/*global browser ThemeManager JSZip ZipTools LocalStorageManager Transfer TextTools*/
'use strict';
class ThemeCustomManager { /*exported ThemeCustomManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  get kinds() { return ThemeManager.instance.kinds; }

  async exportThemeCustom_async(themeKind, themeName) {
    let zipCustomTheme = null;
    if (this.isCustomTheme(themeName)) {
      zipCustomTheme = await this.getThemeArchive_async(themeKind, themeName);
    }
    else {
      zipCustomTheme = await this.getCustomFromBuiltin_async(themeKind, themeName);
    }
    let zipBlob = await zipCustomTheme.generateAsync({ type: 'blob' });
    let url = URL.createObjectURL(zipBlob);
    return url;
  }

  async exportAllThemesCustom_async() {
    let zipAllCustomThemes = new JSZip();
    let themeKindList = Object.values(this.kinds);
    let themesListObjList = [];
    for (let themeKind of themeKindList) {
      let listStorageKey = this._themeStorageKeyFromKind(themeKind);
      let themesList = await LocalStorageManager.getValue_async(listStorageKey, []);
      for (let themeName of themesList) {
        let zipCustomTheme = await this.getThemeArchive_async(themeKind, themeName);
        let zipBlob = await zipCustomTheme.generateAsync({ type: 'blob' });
        let zipThemeUrl = URL.createObjectURL(zipBlob);
        zipAllCustomThemes.file(themeKind + '-' + themeName + '.zip', ZipTools.getBinaryContent_async(zipThemeUrl), { binary: true });
      }
      let themesListObj = { themeKind: themeKind, themesList: themesList };
      themesListObjList.push(themesListObj);
    }
    let archiveInfo = { fileType: 'df-all-custom-themes', themesListInfo: themesListObjList };
    let archiveInfoJson = JSON.stringify(archiveInfo);
    zipAllCustomThemes.file('archiveInfo.json', archiveInfoJson);
    let zipAllCustomThemesBlob = await zipAllCustomThemes.generateAsync({ type: 'blob' });
    let zipAllCustomThemesUrl = URL.createObjectURL(zipAllCustomThemesBlob);
    return zipAllCustomThemesUrl;
  }

  async getCustomCssUrl_async(themeName, sheetFile, themeKind, sheetFolder) {
    let sheetUrl = await this._loadCustomSheet_async(themeName, sheetFile, themeKind, sheetFolder, sheetFolder);
    return sheetUrl;
  }

  async getCustomFromBuiltin_async(themeKind, themeName) {
    let zip = new JSZip();
    let baseFolder = ThemeManager.instance.getBaseFolderForThemeKind(themeKind, themeName);
    let fileListUrl = browser.runtime.getURL(baseFolder + '/files.list');
    let fileList = (await Transfer.downloadTextFile_async(fileListUrl)).trim().split('\n');
    for (let file of fileList) {
      if (file == './files.list') { continue; }
      file = file.replace('./', '');
      let fileUrl = browser.runtime.getURL(baseFolder + '/' + file);
      if (file.endsWith('.css')) {
        let cssMainText = await Transfer.downloadTextFile_async(fileUrl);
        cssMainText = TextTools.replaceAll(cssMainText, 'url(/themes/' + themeName + '/', 'url([archive]/');
        zip.file(file, cssMainText);
      }
      else if (file.endsWith('.js')) {
        zip.file(file + '.url', baseFolder + '/' + file);
        //zip.file(file, await ZipTools.getBinaryContent_async(fileUrl), { binary: true });
      }
      else {
        zip.file(file, await ZipTools.getBinaryContent_async(fileUrl), { binary: true });
      }
    }
    zip.file('readme.txt', await ZipTools.getBinaryContent_async('/themes/_export/readme.txt'), { binary: true });
    let archiveInfo = { fileType: 'df-custom-theme', themeInfo: { themeKind: themeKind } };
    let archiveInfoJson = JSON.stringify(archiveInfo);
    zip.file('archiveInfo.json', archiveInfoJson);
    return zip;
  }

  async getCustomThemeList_async(themeKind) {
    let storageKey = this._themeStorageKeyFromKind(themeKind);
    let themeList = await LocalStorageManager.getValue_async(storageKey, []);
    themeList = themeList.map((themeName) => this.getThemeNameWithPrefix(themeKind, themeName) + ';' + themeName);
    return themeList;
  }

  async getThemeArchive_async(themeKind, themeName) {
    let themeNameWithPrefix = this.getThemeNameWithPrefix(themeKind, themeName);
    let zipFile = await LocalStorageManager.getValue_async(themeNameWithPrefix, null);
    if (!zipFile) { return null; }
    let zipArchive = await JSZip.loadAsync(zipFile);
    return zipArchive;
  }

  getThemeNameWithoutPrefix(themeKind, themeName) {
    let prefix = themeKind + ':';
    themeName = (themeName.startsWith(prefix) ? themeName.replace(prefix, '') : themeName);
    return themeName;
  }

  getThemeNameWithPrefix(themeKind, themeName) {
    let prefix = themeKind + ':';
    themeName = (themeName.startsWith(prefix) ? themeName : prefix + themeName);
    return themeName;
  }

  async getThemeResourceUrl_async(themeKind, targetResource) {
    let resourceUrl = null;
    let themeName = ThemeManager.instance.getThemeFolderForThemeKind(themeKind);
    if (targetResource.endsWith('.js')) {
      resourceUrl = await this._loadCustomResourceJs_async(themeKind, themeName, targetResource);
    }
    if (!resourceUrl) {
      resourceUrl = await this._loadCustomResource_async(themeKind, themeName, targetResource);
    }
    return resourceUrl;
  }

  async importAllThemesCustom_async(customThemesFile) {
    let zipArchive = await JSZip.loadAsync(customThemesFile);
    let archiveInfo = JSON.parse(await zipArchive.file('archiveInfo.json').async('text'));
    if (archiveInfo.fileType != 'df-all-custom-themes') { return; }
    for (let themesListObj of archiveInfo.themesListInfo) {
      for (let themeName of themesListObj.themesList) {
        let themeNameWithPrefix = this.getThemeNameWithPrefix(themesListObj.themeKind, themeName);
        let zipThemName = themesListObj.themeKind + '-' + themeName + '.zip';
        let zipCustomThemBlob = await zipArchive.file(zipThemName).async('blob');
        await LocalStorageManager.setValue_async(themeNameWithPrefix, zipCustomThemBlob);
      }
      let listStorageKey = this._themeStorageKeyFromKind(themesListObj.themeKind);
      await LocalStorageManager.setValue_async(listStorageKey, themesListObj.themesList);
    }
  }

  async importThemeCustom_async(zipFile, themeName) {
    try {
      let zipArchive = await JSZip.loadAsync(zipFile);
      if (!zipArchive) { return { error: 'notValidThemeArchive', value: null }; }
      let archiveInfoJsonFile = zipArchive.file('archiveInfo.json');
      if (!archiveInfoJsonFile) { return { error: 'notValidThemeArchive', value: null }; }
      let archiveInfoJson = await archiveInfoJsonFile.async('text');
      if (!archiveInfoJson) { return { error: 'notValidThemeArchive', value: null }; }
      let archiveInfo = JSON.parse(archiveInfoJson);
      if (!archiveInfo || !archiveInfo.fileType || archiveInfo.fileType != 'df-custom-theme' || !archiveInfo.themeInfo || !archiveInfo.themeInfo.themeKind) {
        return { error: 'notValidThemeArchive', value: null };
      }
      if (!this._isValidThemeKind(archiveInfo.themeInfo.themeKind)) { return { error: 'notValidThemeArchive', value: 'invalid theme kind' }; }
      let listStorageKey = this._themeStorageKeyFromKind(archiveInfo.themeInfo.themeKind);
      let themesList = await LocalStorageManager.getValue_async(listStorageKey, []);
      let isNewNameAvailable = !themesList.includes(themeName);
      if (!isNewNameAvailable) { return { error: 'alreadyExist', value: themeName }; }
      themesList.push(themeName);
      themesList = [...new Set(themesList)];
      await LocalStorageManager.setValue_async(listStorageKey, themesList);
      let themeNameWithPrefix = this.getThemeNameWithPrefix(archiveInfo.themeInfo.themeKind, themeName);
      await LocalStorageManager.setValue_async(themeNameWithPrefix, zipFile);
    }
    catch (e) {
      return { error: 'notValidThemeArchive', value: e };
    }
    return null;
  }

  async isNewNameAvailable_async(themeKind, newName) {
    let listStorageKey = this._themeStorageKeyFromKind(themeKind);
    let themesList = await LocalStorageManager.getValue_async(listStorageKey, []);
    let isNewNameAvailable = !themesList.includes(newName);
    return isNewNameAvailable;

  }

  async renameCustomTheme_async(themeKind, oldName, newName) {
    try {
      oldName = this.getThemeNameWithoutPrefix(themeKind, oldName);
      newName = this.getThemeNameWithoutPrefix(themeKind, newName);
      let oldNameWithPrefix = this.getThemeNameWithPrefix(themeKind, oldName);
      let newNameWithPrefix = this.getThemeNameWithPrefix(themeKind, newName);
      let listStorageKey = this._themeStorageKeyFromKind(themeKind);
      let themesList = await LocalStorageManager.getValue_async(listStorageKey, []);
      let isNewNameAvailable = !themesList.includes(newName);
      if (!isNewNameAvailable) { return { error: 'alreadyExist', value: newName }; }
      let zipArchive = await this.getThemeArchive_async(themeKind, oldNameWithPrefix);
      let zipBlob = await zipArchive.generateAsync({ type: 'blob' });
      await LocalStorageManager.setValue_async(newNameWithPrefix, zipBlob);
      await browser.storage.local.remove(oldNameWithPrefix);
      themesList = themesList.map((themeName) => (themeName == oldName ? newName : themeName));
      themesList = [...new Set(themesList)];
      await LocalStorageManager.setValue_async(listStorageKey, themesList);
    }
    catch (e) {
      return { error: 'error', value: e };
    }

  }

  _isValidThemeKind(themeKind) {
    return Object.values(this.kinds).includes(themeKind);
  }

  isCustomTheme(themeName) {
    let isCustomTheme = themeName.startsWith(this.kinds.mainTheme + ':')
      || themeName.startsWith(this.kinds.renderTemplate + ':')
      || themeName.startsWith(this.kinds.renderTheme + ':')
      || themeName.startsWith(this.kinds.scriptEditorTheme + ':');
    return isCustomTheme;
  }

  async isThemeKindOf_async(themeKind, themeName) {
    themeName = this.getThemeNameWithoutPrefix(themeKind, themeName);
    let listStorageKey = this._themeStorageKeyFromKind(themeKind);
    let themesList = await LocalStorageManager.getValue_async(listStorageKey, []);
    return themesList.includes(themeName);
  }

  async removeTheme_async(themeKind, themeName) {
    let themeNameNoPrefix = this.getThemeNameWithoutPrefix(themeKind, themeName);
    let themeNamePrefix = this.getThemeNameWithPrefix(themeKind, themeName);
    let storageKey = this._themeStorageKeyFromKind(themeKind);
    let themeCustomList = await LocalStorageManager.getValue_async(storageKey, []);
    themeCustomList = themeCustomList.filter((thName) => thName !== themeNameNoPrefix);
    await LocalStorageManager.setValue_async(storageKey, themeCustomList);
    await browser.storage.local.remove(themeNamePrefix);
  }

  async _loadCustomResource_async(themeKind, themeName, targetResource) {
    let themeArchive = await this.getThemeArchive_async(themeKind, themeName);
    if (!themeArchive) { return null; }
    let resourceFile = themeArchive.file(targetResource);
    if (!resourceFile) { return null; }
    let resourceBlob = await resourceFile.async('blob');
    if (!resourceBlob) { return null; }
    let resourceUrl = URL.createObjectURL(resourceBlob);
    return resourceUrl;
  }

  async _loadCustomResourceJs_async(themeKind, themeName, targetResource) {
    let resourceUrl = null;
    let themeArchive = await this.getThemeArchive_async(themeKind, themeName);
    if (!themeArchive) { return null; }
    let file = themeArchive.file(targetResource + '.url');
    if (!file) {
      file = themeArchive.file(targetResource);
      if (!file) { return null; }
      let fileBlob = await file.async('blob');
      resourceUrl = URL.createObjectURL(fileBlob);
      return resourceUrl;
    }
    resourceUrl = file.async('text');
    return resourceUrl;
  }

  async _loadCustomSheet_async(themeName, sheetFile, themeKind, sheetFolder) {
    let themeArchive = await this.getThemeArchive_async(themeKind, themeName);
    if (!themeArchive) { return null; }
    let cssText = await themeArchive.file(sheetFolder + '/' + sheetFile).async('text');

    let urlList = [...new Set(await this._urlListFromTextCss(cssText))];
    urlList = urlList.filter((url) => url.includes('[archive]'));
    for (let url of urlList) {
      let filePath = url.split(']')[1].substring(1);
      let fileBlob = await themeArchive.file(filePath).async('blob');
      let urlField = 'url(' + url + ')';
      let fileUrlField = 'url(' + URL.createObjectURL(fileBlob) + ')';
      cssText = TextTools.replaceAll(cssText, urlField, fileUrlField);
    }
    let sheetBlob = new Blob([cssText]);
    let sheetUrl = URL.createObjectURL(sheetBlob);
    return sheetUrl;
  }

  _themeStorageKeyFromKind(themeKind) {
    return themeKind + 'List';
  }

  async _urlListFromCss_async(cssUrl) {
    cssUrl = browser.runtime.getURL(cssUrl);
    let ccsText = await Transfer.downloadTextFile_async(cssUrl);
    let urlList = this._urlListFromTextCss(ccsText);
    return urlList;
  }

  _urlListFromTextCss(ccsText) {
    /*eslint-disable no-useless-escape*/
    let regexUrls = /url\((?!['"]?:)['"]?([^'"\)]*)['"]?\)/g;
    /*eslint-enable no-useless-escape*/
    let urlList = ccsText.match(regexUrls);
    if (!urlList) { urlList = []; }
    urlList = urlList.map((url) => {
      return (url ? url.slice(4, -1) : '');
    });
    return urlList;
  }
}