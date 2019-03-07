/*global browser ThemeManager JSZip ZipTools LocalStorageManager Transfer TextTools*/
'use strict';

class ThemeCustomManager { /*exported ThemeCustomManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._customCssList = [];
  }

  get kind() { return ThemeManager.instance.kind; }

  async exportThemeCustom_async(themeKind, themeName) {
    let isCustomTheme = this.isCustomTheme(themeName);
    let zipCustomTheme = null;
    let suffix = '';
    if (isCustomTheme) {
      zipCustomTheme = await this.getThemeArchive_async(themeKind, themeName);
    }
    else {
      suffix = ' (copy of)';
      zipCustomTheme = await this.getCustomFromBuiltin_async(themeKind, themeName, suffix);
    }
    let newName = themeName + suffix;
    let zipBlob = await zipCustomTheme.generateAsync({ type: 'blob' });
    let url = URL.createObjectURL(zipBlob);
    browser.downloads.download({ url: url, filename: 'df - ' + themeKind + ' - ' + newName + '.zip', saveAs: true });
  }

  getBaseFolderForThemeKind(themeKind, themeName) {
    let baseFolder = '';
    switch (themeKind) {
      case this.kind.mainTheme:
        baseFolder = 'themes/' + themeName;
        break;
      case this.kind.renderTheme:
        baseFolder = 'themes/_renderTab/' + themeName;
        break;
      case this.kind.renderTemplate:
        baseFolder = 'themes/_renderTab/_templates/' + themeName;
        break;
    }
    return baseFolder;
  }

  async getCssUrl_async(themeName, cssFile, themeKind) {
    let customCss = this._customCssList.find((customCss) => customCss.themeName == themeName && customCss.cssFile == cssFile);
    if (customCss) { return customCss.cssUrl; }

    this._customCssList = this._customCssList.filter(customCss => customCss.themeName != themeName && customCss.cssFile == cssFile);
    customCss = await this._loadCustomCss_async(themeName, cssFile, themeKind);
    return customCss.cssUrl;
  }

  async getCustomFromBuiltin_async(themeKind, themeName, suffix) {
    let zip = new JSZip();
    let baseFolder = this.getBaseFolderForThemeKind(themeKind, themeName);
    let fileListUrl = browser.runtime.getURL(baseFolder + '/files.list');
    let fileList = (await Transfer.downloadTextFile_async(fileListUrl)).trim().split('\n');
    for (let file of fileList) {
      if (file == './files.list') { continue; }
      file = file.replace('./', '');
      let fileUrl = browser.runtime.getURL(baseFolder + '/' + file);
      zip.file(file, ZipTools.getBinaryContent_async(fileUrl), { binary: true });
    }
    let themeInfo = { themeName: themeName + suffix };
    let themeInfoJson = JSON.stringify(themeInfo);
    zip.file('themeInfo.json', themeInfoJson);
    return zip;
  }

  async getCustomThemeList_async(themeKind) {
    let storageKey = this._themeStorageKeyFromKind(themeKind);
    let themeList = await LocalStorageManager.getValue_async(storageKey, []);
    themeList = themeList.map((themeName) => this.getThemeNameWithPrefix(themeKind, themeName) + ';' + themeName);
    return themeList;
  }

  async getThemeArchive_async(kind, themeName) {
    let themeNameWithPrefix = this.getThemeNameWithPrefix(kind, themeName);
    let zipFile = await LocalStorageManager.getValue_async(themeNameWithPrefix, null);
    if (!zipFile) { return null; }
    let zipArchive = await JSZip.loadAsync(zipFile);
    return zipArchive;
  }

  getThemeNameWithoutPrefix(kind, themeName) {
    let prefix = kind + ':';
    themeName = (themeName.startsWith(prefix) ? themeName.replace(prefix, '') : themeName);
    return themeName;
  }

  getThemeNameWithPrefix(kind, themeName) {
    let prefix = kind + ':';
    themeName = (themeName.startsWith(prefix) ? themeName : prefix + themeName);
    return themeName;
  }

  async importThemeCustom_async(themeKind, zipFile) {
    let zipArchive = await JSZip.loadAsync(zipFile);
    let themeInfoJson = await zipArchive.file('themeInfo.json').async('text');
    let themeInfo = JSON.parse(themeInfoJson);
    let listStorageKey = this._themeStorageKeyFromKind(themeKind);
    let themesList = await LocalStorageManager.getValue_async(listStorageKey, []);
    if (themesList.includes(themeInfo.themeName)) {
      return themeInfo.themeName;
    }
    themesList.push(themeInfo.themeName);
    themesList = [...new Set(themesList)];
    await LocalStorageManager.setValue_async(listStorageKey, themesList);
    let themeNameWithPrefix = this.getThemeNameWithPrefix(themeKind, themeInfo.themeName);
    await LocalStorageManager.setValue_async(themeNameWithPrefix, zipFile);
    return null;

  }

  isCustomTheme(themeName) {
    let isCustomTheme = themeName.startsWith(this.kind.mainTheme + ':')
      || themeName.startsWith(this.kind.renderTemplate + ':')
      || themeName.startsWith(this.kind.renderTheme + ':');
    return isCustomTheme;
  }

  async isThemeKindOf_async(kind, themeName) {
    themeName = this.getThemeNameWithoutPrefix(kind, themeName);
    let listStorageKey = this._themeStorageKeyFromKind(kind);
    let themesList = await LocalStorageManager.getValue_async(listStorageKey, []);
    return themesList.includes(themeName);
  }

  async removeTheme_async(kind, themeName) {
    let themeNameWithoutPrefix = this.getThemeNameWithoutPrefix(kind, themeName);
    let themeNameWithPrefix = this.getThemeNameWithPrefix(kind, themeName);
    let storageKey = this._themeStorageKeyFromKind(ThemeManager.instance.kind.mainTheme);
    let themeCustomList = await LocalStorageManager.getValue_async(storageKey, []);
    themeCustomList = themeCustomList.filter((thName) => thName !== themeNameWithoutPrefix);
    await LocalStorageManager.setValue_async(this._themeStorageKeyFromKind(kind), themeCustomList);
    await browser.storage.local.remove(themeNameWithPrefix);
  }

  async _addCssToZip_async(zipFolder, fileName, cssUrl, themeName) {
    let cssMainText = await Transfer.downloadTextFile_async(cssUrl);
    cssMainText = TextTools.replaceAll(cssMainText, 'url(/themes/' + themeName + '/', 'url([archive]/');
    zipFolder.file(fileName, cssMainText);
  }

  async _loadCustomCss_async(themeName, cssFile, kind) {
    let themeArchive = await this.getThemeArchive_async(kind, themeName);
    let cssText = await themeArchive.file('css/' + cssFile).async('text');

    let urlList = [...new Set(await this._urlListFromTextCss(cssText))];
    urlList = urlList.filter((url) => url.includes('[archive]'));
    for (let url of urlList) {
      let filePath = url.split(']')[1].substring(1);
      let fileBlob = await themeArchive.file(filePath).async('blob');
      let urlField = 'url(' + url + ')';
      let fileUrlField = 'url(' + URL.createObjectURL(fileBlob) + ')';
      cssText = TextTools.replaceAll(cssText, urlField, fileUrlField);
    }
    let cssBlob = new Blob([cssText]);
    let cssUrl = URL.createObjectURL(cssBlob);
    let customCss = { cssFile: cssFile, themeName: themeName, cssBlob: cssBlob, cssUrl: cssUrl };
    this._customCssList.push(customCss);
    return customCss;
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