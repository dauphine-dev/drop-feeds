/*global DefaultValues LocalStorageManager*/
'use strict';
class ThemeManager { /*exported ThemeManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._themeFolderName = DefaultValues.themeFolderName;
    this._themeBaseFolderUrl = '/themes/';
    this._themesListUrl = '/themes/themes.list';
    this._iconDF32Url = '/themes/_any/img/drop-feeds-32.png';
    this._iconDF96Url = '/themes/_any/img/drop-feeds-96.png';
  }

  async init_async() {
    await this.reload_async();
  }

  async reload_async() {
    this._themeFolderName = await LocalStorageManager.getValue_async('themeFolderName', this._themeFolderName);
  }

  get themeFolderName() {
    return this._themeFolderName;
  }
  set themeFolderName(value) {
    this._themeFolderName = value;
    LocalStorageManager.setValue_async('themeFolderName', value);
  }


  get themeFolderUrl() {
    return this.themeBaseFolderUrl + this._themeFolderName + '/';
  }

  getCssUrl(cssName) {
    let cssUrl = this.themeFolderUrl + 'css/' + cssName;
    return cssUrl;
  }

  getImgUrl(imgName) {
    let icoUrl = this.themeFolderUrl + 'img/' + imgName;
    return icoUrl;
  }

  async setThemeFolderName_async(themeFolderName) {
    this.themeFolderName = themeFolderName;
    await LocalStorageManager.setValue_async('themeFolderName', themeFolderName);
  }

  applyCssToCurrentDocument(cssName) {
    let cssUrl = this.themeFolderUrl + 'css/' + cssName;
    let elCssLink = document.getElementById('cssLink');
    elCssLink.setAttribute('href', cssUrl);
  }

  async refreshAndApplyCss_async(cssName) {
    await this.reload_async();
    this.applyCssToCurrentDocument(cssName);
  }

  get iconDF32Url() {
    return this._iconDF32Url;
  }

  get iconDF96Url() {
    return this._iconDF96Url;
  }

  get themeBaseFolderUrl() {
    return this._themeBaseFolderUrl;
  }

  get themesListUrl() {
    return this._themesListUrl;
  }
}
