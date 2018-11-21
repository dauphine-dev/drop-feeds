/*global browser DefaultValues LocalStorageManager Listener ListenerProviders*/
'use strict';
const _themeKind = {'mainTheme':1, 'renderTemplate':2, 'renderTheme':3};
class ThemeManager { /*exported ThemeManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._themeBaseFolderUrl = '/themes/';
    this._mainThemesListUrl = '/themes/themes.list';
    this._renderTemplateListUrl = '/themes/_renderTab/_templates/template.list';
    this._renderThemeListUrl = '/themes/_renderTab/themes.list';
    this._iconDF32Url = '/themes/_templates/img/drop-feeds-32.png';
    this._iconDF96Url = '/themes/_templates/img/drop-feeds-96.png';

    this._mainThemeFolderName = DefaultValues.mainThemeFolderName;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'mainThemeFolderName', (v) => this._setMainThemeFolderName_sbscrb(v), true);
    this._renderTemplateFolderName = DefaultValues.renderTemplateFolderName;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'renderTemplateFolderName', (v) => this._setRenderTemplateFolderName_sbscrb(v), true);
    this._renderThemeFolderName = DefaultValues.mainThemeFolderName;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'renderThemeFolderName', (v) => this._setRenderThemeFolderName_sbscrb(v), true);

  }

  async init_async() {
    await this._update_async();
  }

  async _setMainThemeFolderName_sbscrb(value) {
    this._mainThemeFolderName = value;
  }

  async _setRenderTemplateFolderName_sbscrb(value) {
    this._renderTemplateFolderName = value;
  }

  async _setRenderThemeFolderName_sbscrb(value) {
    this._renderThemeFolderName = value;
  }

  async _update_async() {
    let themeFolderName = await LocalStorageManager.getValue_async('themeFolderName', null);
    if (themeFolderName) {
      LocalStorageManager.setValue_async('mainThemeFolderName', themeFolderName);
      LocalStorageManager.setValue_async('renderThemeFolderName', themeFolderName);
      if (themeFolderName == 'sage_sc') {
        LocalStorageManager.setValue_async('renderTemplateFolderName', 'one_column');
      }
      else {
        LocalStorageManager.setValue_async('renderTemplateFolderName', 'two_columns');
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
    LocalStorageManager.setValue_async('mainThemeFolderName', value);
  }

  get renderTemplateFolderName() {
    return this._renderTemplateFolderName;
  }
  
  set renderTemplateFolderName(value) {
    LocalStorageManager.setValue_async('renderTemplateFolderName', value);
  }

  get renderThemeFolderName() {
    return this._renderThemeFolderName;
  }
  
  set renderThemeFolderName(value) {
    LocalStorageManager.setValue_async('renderThemeFolderName', value);
  }

  get mainThemeFolderUrl() {
    return this.themeBaseFolderUrl + this._mainThemeFolderName + '/';
  }

  getRenderCssTemplateUrl(isError) {
    let cssTemplateUrl = this.themeBaseFolderUrl + '_renderTab/_templates/' + (isError ? '_error' : this._renderTemplateFolderName) + '/css/template.css';
    return cssTemplateUrl;
  }

  getRenderXslTemplateUrl(isError) {
    let cssTemplateUrl = this.themeBaseFolderUrl + '_renderTab/_templates/' + (isError ? '_error' : this._renderTemplateFolderName) + '/xsl/template.xsl';
    return cssTemplateUrl;
  }


  getRenderCssUrl() {
    let cssRenderUrl = this.themeBaseFolderUrl + '_renderTab/' + this._renderThemeFolderName + '/css/style.css';
    return cssRenderUrl;
  }

  getImgUrl(imgName) {
    let icoUrl = this.mainThemeFolderUrl + 'img/' + imgName;
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

  async applyCssToCurrentDocument_async() {
    this._mainThemeFolderName = await LocalStorageManager.getValue_async('mainThemeFolderName', this._mainThemeFolderName);
    let elCssLink = document.getElementById('cssLink');
    if (elCssLink) {
      let cssUrl = this.mainThemeFolderUrl + 'css/sidebar.css';
      elCssLink.setAttribute('href', cssUrl);
    }

    let elCssMain = document.getElementById('cssMain');
    if (elCssMain) {
      let cssUrlMain = this.mainThemeFolderUrl + 'css/main.css';
      elCssMain.setAttribute('href', cssUrlMain);
    }
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
