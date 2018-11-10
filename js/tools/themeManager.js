/*global browser DefaultValues LocalStorageManager*/
'use strict';
const _themeKind = {'mainTheme':1, 'renderTemplate':2, 'renderTheme':3};
class ThemeManager { /*exported ThemeManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._mainThemeFolderName = DefaultValues.mainThemeFolderName;
    this._renderTemplateFolderName = DefaultValues.renderTemplateFolderName;
    this._renderThemeFolderName = DefaultValues.mainThemeFolderName;
    this._themeBaseFolderUrl = '/themes/';
    this._mainThemesListUrl = '/themes/themes.list';
    this._renderTemplateListUrl = '/themes/_renderTab/_templates/template.list';
    this._renderThemeListUrl = '/themes/_renderTab/themes.list';
    this._iconDF32Url = '/themes/_templates/img/drop-feeds-32.png';
    this._iconDF96Url = '/themes/_templates/img/drop-feeds-96.png';
  }

  async init_async() {
    await this._update_async();
    await this.reload_async();
  }

  async reload_async() {
    this._mainThemeFolderName = await LocalStorageManager.getValue_async('mainThemeFolderName', this._mainThemeFolderName);
    this._renderTemplateFolderName = await LocalStorageManager.getValue_async('renderTemplateFolderName', this._renderTemplateFolderName);
    this._renderThemeFolderName = await LocalStorageManager.getValue_async('renderThemeFolderName', this._renderThemeFolderName);
  }

  async _update_async() {
    let themeFolderName = await LocalStorageManager.getValue_async('themeFolderName', null);
    if (themeFolderName) {
      LocalStorageManager.setValue_async('mainThemeFolderName', themeFolderName);
      LocalStorageManager.setValue_async('renderThemeFolderName', themeFolderName);
      if (themeFolderName == 'sage_sc') {
        LocalStorageManager.setValue_async('renderTemplateFolderName', 'two_columns');
      }
      else {
        LocalStorageManager.setValue_async('renderTemplateFolderName', 'one_column');
      }
      browser.storage.local.remove('themeFolderName');
    }
  }

  get kind() {
    return _themeKind;
  }

  get mainThemeFolderName() {
    return this._mainThemeFolderName;
  }

  set mainThemeFolderName(value) {
    this._mainThemeFolderName = value;
    LocalStorageManager.setValue_async('mainThemeFolderName', value);
  }

  get renderTemplateFolderName() {
    return this._renderTemplateFolderName;
  }
  
  set renderTemplateFolderName(value) {
    this._renderTemplateFolderName = value;
    LocalStorageManager.setValue_async('renderTemplateFolderName', value);
  }

  get renderThemeFolderName() {
    return this._renderThemeFolderName;
  }
  
  set renderThemeFolderName(value) {
    this._renderThemeFolderName = value;
    LocalStorageManager.setValue_async('renderThemeFolderName', value);
  }

  get themeFolderUrl() {
    return this.themeBaseFolderUrl + this._mainThemeFolderName + '/';
  }

  getRenderCssTemplateUrl() {
    let cssTemplateUrl = this.themeBaseFolderUrl + '_renderTab/_templates/' + this._renderTemplateFolderName + '/css/template.css';
    return cssTemplateUrl;
  }

  getRenderCssUrl() {
    let cssRenderUrl = this.themeBaseFolderUrl + '_renderTab/' + this._renderThemeFolderName + '/css/style.css';
    return cssRenderUrl;
  }

  getImgUrl(imgName) {
    let icoUrl = this.themeFolderUrl + 'img/' + imgName;
    return icoUrl;
  }

  async setThemeFolderName_async(themeKind, themeFolderName) {
    switch (themeKind) {
      case _themeKind.mainTheme:
        this.mainThemeFolderName = themeFolderName;
        break;
      case _themeKind.renderTemplate:
        this.renderTemplateFolderName = themeFolderName;
        break;
      case _themeKind.renderTheme:
        this.renderThemeFolderName = themeFolderName;
        break;
    }
  }

  applyCssToCurrentDocument(cssName) {
    let elCssLink = document.getElementById('cssLink');
    if (elCssLink) {
      let cssUrl = this.themeFolderUrl + 'css/' + cssName;
      elCssLink.setAttribute('href', cssUrl);
    }

    let elCssMain = document.getElementById('cssMain');
    if (elCssMain) {
      let cssUrlMain = this.themeFolderUrl + 'css/main.css';
      elCssMain.setAttribute('href', cssUrlMain);
    }
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

  get mainThemesListUrl() {
    return this._mainThemesListUrl;
  }

  get renderTemplateListUrl() {
    return this._renderTemplateListUrl;
  }

  get renderThemeListUrl() {
    return this._renderThemeListUrl;
  }


}
