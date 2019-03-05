/*global browser ThemeManager JSZip ZipTools Transfer LocalStorageManager*/
'use strict';
class ThemeEditor { /*exported ThemeEditor*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updateLocalizedStrings();
    document.getElementById('aaa').addEventListener('click', (e) => { this._aaaOnClicked_event(e); });
    document.getElementById('bbb').addEventListener('click', (e) => { this._bbbOnClicked_event(e); });
    document.getElementById('inputBbb').addEventListener('change', (e) => { this._inputBbbChanged_event(e); });
    document.getElementById('ccc').addEventListener('click', (e) => { this._cccOnClicked_event(e); });
  }

  async init_async() {
  }

  _updateLocalizedStrings() {
  }

  async _aaaOnClicked_event() {
    this.mainThemeToZip_async('legacy');
  }

  async _bbbOnClicked_event() {
    document.getElementById('inputBbb').click();
  }

  async _cccOnClicked_event() {
    let themesList = await this.getStoredThemeList_async();
    console.log(themesList);
    let theme = await this.getStoredThemeArchive_async(themesList[0]);
    console.log(theme);
  }

  async _inputBbbChanged_event() {
    let themesList = await LocalStorageManager.getValue_async('themesList', []);
    let zipFile = document.getElementById('inputBbb').files[0];
    let themeName = zipFile.name.split('.').slice(0, -1).join('.');
    themesList.push(themeName);
    themesList = [...new Set(themesList)];
    LocalStorageManager.setValue_async('themesList', themesList);
    LocalStorageManager.setValue_async('theme:' + themeName, zipFile);
  }

  async getStoredThemeList_async() {
    return await LocalStorageManager.getValue_async('themesList', []);
  }


  async getStoredThemeArchive_async(themeName) {
    let zipFile = await LocalStorageManager.getValue_async('theme:' + themeName, null);
    if (!zipFile) { return null; }
    let zipArchive = await JSZip.loadAsync(zipFile);
    //let mainCssText = await zipArchive.file('css/main.css').async('text');
    //console.log('mainCssText:\n', mainCssText);
    return zipArchive;
  }

  async mainThemeToZip_async(themeName) {
    let zip = new JSZip();
    let folderCss = zip.folder('css');
    let folderImg = zip.folder('img');

    let cssUrlMain = browser.runtime.getURL(ThemeManager.instance.themeBaseFolderUrl + themeName + '/css/main.css');
    folderCss.file('main.css', ZipTools.getBinaryContent_async(cssUrlMain), { binary: true });

    let cssSidebarUrl = browser.runtime.getURL(ThemeManager.instance.themeBaseFolderUrl + themeName + '/css/sidebar.css');
    folderCss.file('sidebar.css', ZipTools.getBinaryContent_async(cssSidebarUrl), { binary: true });


    let urlList1 = await this.urlListFromCss_async(cssUrlMain);
    let urlList2 = await this.urlListFromCss_async(cssSidebarUrl);
    let urlList = [...new Set([...urlList1, ...urlList2])];

    urlList.forEach((url) => {
      let url1 = browser.runtime.getURL(url);
      let filename = url.split('/').pop();
      folderImg.file(filename, ZipTools.getBinaryContent_async(url1), { binary: true });
    });

    let zipBlob = await zip.generateAsync({ type: 'blob' });
    let url = URL.createObjectURL(zipBlob);
    browser.downloads.download({ url: url, filename: themeName + '.zip', saveAs: true });
  }

  async urlListFromCss_async(cssUrl) {
    cssUrl = browser.runtime.getURL(cssUrl);
    let ccsText = await Transfer.downloadTextFile_async(cssUrl);
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

  zipToMainTheme() {

  }
}
ThemeEditor.instance.init_async();
