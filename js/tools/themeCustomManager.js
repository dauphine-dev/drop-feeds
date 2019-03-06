/*global browser ThemeManager JSZip ZipTools LocalStorageManager Transfer TextTools*/
'use strict';
class ThemeCustomManager { /*exported ThemeCustomManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._customCssList = [];
  }

  get kind() { return ThemeManager.instance.kind; }

  async exportCustomMainTheme_async(themeName) {
    try {

      let zip = new JSZip();
      let themeInfo = { themeName: themeName };
      let themeInfoJson = JSON.stringify(themeInfo);
      zip.file('themeInfo.json', themeInfoJson);
      let folderCss = zip.folder('css');
      let cssUrlMain = browser.runtime.getURL(ThemeManager.instance.themeBaseFolderUrl + themeName + '/css/main.css');
      //folderCss.file('main.css', ZipTools.getBinaryContent_async(cssUrlMain), { binary: true });
      this._addCssToZip_async(folderCss, 'main.css', cssUrlMain, themeName);
      let cssSidebarUrl = browser.runtime.getURL(ThemeManager.instance.themeBaseFolderUrl + themeName + '/css/sidebar.css');
      //folderCss.file('sidebar.css', ZipTools.getBinaryContent_async(cssSidebarUrl), { binary: true });
      this._addCssToZip_async(folderCss, 'sidebar.css', cssSidebarUrl, themeName);

      let folderImg = zip.folder('img');
      let urlList1 = await this._urlListFromCss_async(cssUrlMain);
      let urlList2 = await this._urlListFromCss_async(cssSidebarUrl);
      let urlList = [...new Set([...urlList1, ...urlList2])];
      for (let url of urlList) {
        let url1 = browser.runtime.getURL(url);
        let filename = url.split('/').pop();
        folderImg.file(filename, ZipTools.getBinaryContent_async(url1), { binary: true });
      }
      let zipBlob = await zip.generateAsync({ type: 'blob' });
      let url = URL.createObjectURL(zipBlob);
      browser.downloads.download({ url: url, filename: 'df-theme.zip', saveAs: true });
    }
    catch (e) {
      console.error(e);
    }
  }

  async importCustomMainTheme_async(zipFile) {
    let zipArchive = await JSZip.loadAsync(zipFile);
    let themeInfoJson = await zipArchive.file('themeInfo.json').async('text');
    let themeInfo = JSON.parse(themeInfoJson);
    let themesList = await LocalStorageManager.getValue_async('themeListMain', []);
    if (themesList.includes(themeInfo.themeName)) {
      return themeInfo.themeName;
    }
    themesList.push(themeInfo.themeName);
    themesList = [...new Set(themesList)];
    LocalStorageManager.setValue_async('themeListMain', themesList);
    LocalStorageManager.setValue_async('theme:' + themeInfo.themeName, zipFile);
    return null;
  }

  async _loadCustomCss_async(themeName, cssFile) {
    let themeArchive = await this.getCustomThemeArchive_async(themeName);
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

  async _addCssToZip_async(zipFolder, fileName, cssUrl, themeName) {
    let cssMainText = await Transfer.downloadTextFile_async(cssUrl);
    cssMainText = TextTools.replaceAll(cssMainText, 'url(/themes/' + themeName + '/', 'url([archive]/');
    zipFolder.file(fileName, cssMainText);
  }

  async getThemeCustomList_async(themeKind) {
    let storageKey = this._themeStorageKeyFromKind(themeKind);
    let themeList = await LocalStorageManager.getValue_async(storageKey, []);
    themeList = themeList.map((themeName) => 'theme:' + themeName + ';' + themeName);
    return themeList;
  }

  _themeStorageKeyFromKind(themeKind) {
    switch (themeKind) {
      case this.kind.mainTheme:
        return 'themeListMain';
      case this.kind.renderTemplate:
        return 'themeListRenderTemplate';
      case this.kind.renderTheme:
        return 'themeListRenderTheme';
    }
  }

  async getCustomThemeArchive_async(themeName) {
    let zipFile = await LocalStorageManager.getValue_async(themeName, null);
    if (!zipFile) { return null; }
    let zipArchive = await JSZip.loadAsync(zipFile);
    return zipArchive;
  }

  async getCssUrl_async(themeName, cssFile) {
    let customCss = this._customCssList.find((customCss) => customCss.themeName == themeName && customCss.cssFile == cssFile);
    if (customCss) { return customCss.cssUrl; }

    this._customCssList = this._customCssList.filter(customCss => customCss.themeName != themeName && customCss.cssFile == cssFile);
    customCss = await this._loadCustomCss_async(themeName, cssFile);
    return customCss.cssUrl;
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

  async removeCustomTheme_async(themeName) {
    themeName = (themeName.startsWith('theme:') ? themeName.replace('theme:', '') : themeName);
    let storageKey = this._themeStorageKeyFromKind(ThemeManager.instance.kind.mainTheme);
    let themeCustomList = await LocalStorageManager.getValue_async(storageKey, []);
    themeCustomList = themeCustomList.filter((thName) => thName !== themeName);
    await LocalStorageManager.setValue_async('themeListMain', themeCustomList);
    await browser.storage.local.remove('theme:' + themeName);
  }

}