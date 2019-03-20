/*global browser DefaultValues LocalStorageManager Listener ListenerProviders Transfer ThemeCustomManager*/
'use strict';
const _themeKinds = { mainTheme: 'mainTheme', renderTemplate: 'renderTemplate', renderTheme: 'renderTheme', scriptEditorTheme: 'scriptEditorTheme' };
class ThemeManager { /*exported ThemeManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._themeBaseFolderUrl = '/themes/';
    this._mainThemesListUrl = '/themes/themes.list';
    this._renderTemplateListUrl = '/themes/_renderTab/_templates/template.list';
    this._renderThemeListUrl = '/themes/_renderTab/themes.list';
    this._scriptEditorThemeListUrl = '/themes/_editor/themes.list';
    this._iconDF08Url = '/themes/_templates/img/drop-feeds-08.png';
    this._iconDF16Url = '/themes/_templates/img/drop-feeds-16.png';
    this._iconDF32Url = '/themes/_templates/img/drop-feeds-32.png';
    this._iconDF48Url = '/themes/_templates/img/drop-feeds-48.png';
    this._iconDF64Url = '/themes/_templates/img/drop-feeds-64.png';
    this._iconDF96Url = '/themes/_templates/img/drop-feeds-96.png';

    this._mainThemeFolderName = DefaultValues.mainThemeFolderName;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'mainThemeFolderName', (v) => this._setMainThemeFolderName_sbscrb(v), true);
    this._renderTemplateFolderName = DefaultValues.renderTemplateFolderName;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'renderTemplateFolderName', (v) => this._setRenderTemplateFolderName_sbscrb(v), true);
    this._renderThemeFolderName = DefaultValues.renderThemeFolderName;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'renderThemeFolderName', (v) => this._setRenderThemeFolderName_sbscrb(v), true);
    this._scriptEditorThemeFolderName = DefaultValues.scriptEditorThemeFolderName;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'scriptEditorThemeFolderName', (v) => this._setScriptEditorThemeFolderName_sbscrb(v), true);
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

  async _setScriptEditorThemeFolderName_sbscrb(value) {
    this._scriptEditorThemeFolderName = value;
  }

  async _update_async() {
    let themeFolderName = await LocalStorageManager.getValue_async('themeFolderName', null);
    if (themeFolderName) {
      await LocalStorageManager.setValue_async('mainThemeFolderName', themeFolderName);
      await LocalStorageManager.setValue_async('renderThemeFolderName', themeFolderName);
      if (themeFolderName == 'sage_sc') {
        await LocalStorageManager.setValue_async('renderTemplateFolderName', 'one_column');
      }
      else {
        await LocalStorageManager.setValue_async('renderTemplateFolderName', 'two_columns');
      }
      await browser.storage.local.remove('themeFolderName');
    }
  }

  get kinds() { return _themeKinds; }

  get mainThemeFolderName() { return this._mainThemeFolderName; }

  async setMainThemeFolderName_async(value) {
    await LocalStorageManager.setValue_async('mainThemeFolderName', value);
  }

  get renderTemplateFolderName() { return this._renderTemplateFolderName; }

  async setRenderTemplateFolderName_async(value) {
    await LocalStorageManager.setValue_async('renderTemplateFolderName', value);
  }

  get renderThemeFolderName() { return this._renderThemeFolderName; }

  async setRenderThemeFolderName_async(value) {
    await LocalStorageManager.setValue_async('renderThemeFolderName', value);
  }

  async setScriptEditorThemeFolderName_async(value) {
    await LocalStorageManager.setValue_async('scriptEditorThemeFolderName', value);
  }

  get scriptEditorThemeFolderName() { return this._scriptEditorThemeFolderName; }

  get mainThemeFolderUrl() { return this.themeBaseFolderUrl + this._mainThemeFolderName + '/'; }

  get scriptEditorThemeFolderUrl() { return this.themeBaseFolderUrl + '_editor/' + this._scriptEditorThemeFolderName; }

  async getRenderCssTemplateUrl_async(isError) {
    //let cssTemplateUrl = this.themeBaseFolderUrl + '_renderTab/_templates/' + (isError ? '_error' : this._renderTemplateFolderName) + '/css/template.css';
    if (isError) {
      let cssTemplateUrl = this.themeBaseFolderUrl + '_renderTab/_templates/_error/css/template.css';
      return cssTemplateUrl;
    }
    if (ThemeCustomManager.instance.isCustomTheme(this._renderTemplateFolderName)) {
      let cssTemplateUrl = await ThemeCustomManager.instance.getCustomCssUrl_async(this._renderTemplateFolderName, 'template.css', this.kinds.renderTemplate, 'css');
      if (!cssTemplateUrl) {
        cssTemplateUrl = this.themeBaseFolderUrl + '_renderTab/_templates/' + DefaultValues.renderTemplateFolderName + '/css/template.css';
      }
      return cssTemplateUrl;
    }
    let cssTemplateUrl = this.themeBaseFolderUrl + '_renderTab/_templates/' + this._renderTemplateFolderName + '/css/template.css';
    return cssTemplateUrl;
  }

  async getRenderXslTemplateUrl_async(isError) {
    if (isError) {
      let xslTemplateUrl = this.themeBaseFolderUrl + '_renderTab/_templates/_error/xsl/template.xsl';
      return xslTemplateUrl;
    }
    if (ThemeCustomManager.instance.isCustomTheme(this._renderTemplateFolderName)) {
      let xslTemplateUrl = await ThemeCustomManager.instance.getCustomCssUrl_async(this._renderTemplateFolderName, 'template.xsl', this.kinds.renderTemplate, 'xsl');
      if (!xslTemplateUrl) {
        xslTemplateUrl = this.themeBaseFolderUrl + '_renderTab/_templates/' + DefaultValues.renderTemplateFolderName + '/xsl/template.xsl';
      }
      return xslTemplateUrl;
    }
    let xslTemplateUrl = this.themeBaseFolderUrl + '_renderTab/_templates/' + this._renderTemplateFolderName + '/xsl/template.xsl';
    return xslTemplateUrl;
  }

  async getRenderCssUrl_async() {
    //let cssRenderUrl = this.themeBaseFolderUrl + '_renderTab/' + this._renderThemeFolderName + '/css/style.css';
    let cssRenderUrl = '';
    if (ThemeCustomManager.instance.isCustomTheme(this._renderThemeFolderName)) {
      cssRenderUrl = await ThemeCustomManager.instance.getCustomCssUrl_async(this._renderThemeFolderName, 'style.css', this.kinds.renderTheme, 'css');
      if (!cssRenderUrl) {
        cssRenderUrl = this.themeBaseFolderUrl + '_renderTab/' + DefaultValues.renderThemeFolderName + '/css/style.css';
      }
    }
    else {
      cssRenderUrl = this.themeBaseFolderUrl + '_renderTab/' + this._renderThemeFolderName + '/css/style.css';
    }
    return cssRenderUrl;
  }

  getBaseFolderForThemeKind(themeKind, themeName) {
    let baseFolder = '';
    switch (themeKind) {
      case this.kinds.mainTheme:
        baseFolder = 'themes/' + themeName;
        break;
      case this.kinds.renderTheme:
        baseFolder = 'themes/_renderTab/' + themeName;
        break;
      case this.kinds.renderTemplate:
        baseFolder = 'themes/_renderTab/_templates/' + themeName;
        break;
      case this.kinds.scriptEditorTheme:
        baseFolder = 'themes/_editor/' + themeName;
        break;

    }
    return baseFolder;
  }

  getThemeFolderForThemeKind(themeKind) {
    let themeFolder = '';
    switch (themeKind) {
      case this.kinds.mainTheme:
        themeFolder = this._mainThemeFolderName;
        break;
      case this.kinds.renderTheme:
        themeFolder = this._renderThemeFolderName;
        break;
      case this.kinds.renderTemplate:
        themeFolder = this._renderTemplateFolderName;
        break;
      case this.kinds.scriptEditorTheme:
        themeFolder = this._scriptEditorThemeFolderName;
        break;

    }
    return themeFolder;
  }

  getBaseAndThemeFolderForThemeKind(themeKind) {
    let baseAndThemeFolder = '';
    switch (themeKind) {
      case this.kinds.mainTheme:
        baseAndThemeFolder = 'themes/' + this._mainThemeFolderName;
        break;
      case this.kinds.renderTheme:
        baseAndThemeFolder = 'themes/_renderTab/' + this._renderThemeFolderName;
        break;
      case this.kinds.renderTemplate:
        baseAndThemeFolder = 'themes/_renderTab/_templates/' + this._renderTemplateFolderName;
        break;
      case this.kinds.scriptEditorTheme:
        baseAndThemeFolder = 'themes/_editor/' + this._scriptEditorThemeFolderName;
        break;

    }
    return baseAndThemeFolder;
  }

  async getThemeResourceUrl_async(themeKind, targetResource) {
    let baseThemeFolder = this.getBaseAndThemeFolderForThemeKind(themeKind);
    let themeName = this.getThemeFolderForThemeKind(themeKind);
    let resourceUrl = baseThemeFolder + '/' + targetResource;
    if (ThemeCustomManager.instance.isCustomTheme(themeName)) {
      resourceUrl = await ThemeCustomManager.instance.getThemeResourceUrl_async(themeKind, targetResource);
    }
    return resourceUrl;

  }


  getRenderSubscribeButtonCssUrl() {
    let cssSubscribeButtonUrl = this.themeBaseFolderUrl + '_renderTab/_templates/_any/css/subscribeButton.css';
    return cssSubscribeButtonUrl;
  }

  getImgUrl(imgName) {
    let icoUrl = this.mainThemeFolderUrl + 'img/' + imgName;
    return icoUrl;
  }

  async setThemeFolderName_async(themeKind, themeFolderName) {
    switch (themeKind) {
      case _themeKinds.mainTheme:
        await this.setMainThemeFolderName_async(themeFolderName);
        break;
      case _themeKinds.renderTemplate:
        await this.setRenderTemplateFolderName_async(themeFolderName);
        break;
      case _themeKinds.renderTheme:
        await this.setRenderThemeFolderName_async(themeFolderName);
        break;
      case _themeKinds.scriptEditorTheme:
        await this.setScriptEditorThemeFolderName_async(themeFolderName);
        break;
    }
  }

  async applyCssToCurrentDocument_async() {
    this._mainThemeFolderName = await LocalStorageManager.getValue_async('mainThemeFolderName', this._mainThemeFolderName);
    let elCssLink = document.getElementById('cssLink');
    if (elCssLink) {
      let cssUrl = await this._getCssUrl_async('sidebar.css');
      elCssLink.setAttribute('href', cssUrl);
    }

    let elCssMain = document.getElementById('cssMain');
    if (elCssMain) {
      let cssUrlMain = await this._getCssUrl_async('main.css');
      elCssMain.setAttribute('href', cssUrlMain);
    }

    let elCssHighlight = document.getElementById('cssHighLight');
    if (elCssHighlight) {
      let cssHighLight = await this.getCssEditorUrl_async('highlight.css');
      elCssHighlight.setAttribute('href', cssHighLight);
    }

  }

  async _getCssUrl_async(cssFile) {
    let cssUrl = '';
    if (ThemeCustomManager.instance.isCustomTheme(this._mainThemeFolderName)) {
      cssUrl = await ThemeCustomManager.instance.getCustomCssUrl_async(this._mainThemeFolderName, cssFile, this.kinds.mainTheme, 'css');
      if (!cssUrl) {
        cssUrl = this.themeBaseFolderUrl + DefaultValues.mainThemeFolderName + '/css/' + cssFile;
      }
    }
    else {
      cssUrl = this.mainThemeFolderUrl + 'css/' + cssFile;
    }
    return cssUrl;
  }

  async getCssEditorUrl_async(cssFile) {
    let cssUrl = '';
    if (ThemeCustomManager.instance.isCustomTheme(this._scriptEditorThemeFolderName)) {
      cssUrl = await ThemeCustomManager.instance.getCustomCssUrl_async(this._scriptEditorThemeFolderName, cssFile, this.kinds.scriptEditorTheme, 'css');
      if (!cssUrl) {
        cssUrl = this.themeBaseFolderUrl + '_editor/' + DefaultValues.scriptEditorThemeFolderName + '/css/' + cssFile;
      }
    }
    else {
      cssUrl = this.scriptEditorThemeFolderUrl + '/css/' + cssFile;
    }
    return cssUrl;
  }


  async getThemeBuiltinList_async(themeKind) {
    let themeListUrl = this._themeUrlFromKind(themeKind);
    themeListUrl = browser.runtime.getURL(themeListUrl);
    let themeListText = await Transfer.downloadTextFile_async(themeListUrl);
    let themeList = themeListText.trim().split('\n');
    themeList.shift();
    return themeList;
  }

  async getThemeAllList_async(themeKind) {
    let themeList1 = await this.getThemeBuiltinList_async(themeKind);
    let themeList2 = await ThemeCustomManager.instance.getCustomThemeList_async(themeKind);
    let themeList = [...themeList1, ...themeList2];
    return themeList;
  }

  _themeUrlFromKind(themeKind) {
    switch (themeKind) {
      case _themeKinds.mainTheme:
        return this.mainThemesListUrl;
      case _themeKinds.renderTemplate:
        return this.renderTemplateListUrl;
      case _themeKinds.renderTheme:
        return this.renderThemeListUrl;
      case _themeKinds.scriptEditorTheme:
        return this.scriptEditorThemeListUrl;
    }
  }

  get iconDF08Url() { return this._iconDF08Url; }

  get iconDF16Url() { return this._iconDF16Url; }

  get iconDF32Url() { return this._iconDF32Url; }

  get iconDF48Url() { return this._iconDF48Url; }

  get iconDF64Url() { return this._iconDF64Url; }

  get iconDF96Url() { return this._iconDF96Url; }

  get themeBaseFolderUrl() { return this._themeBaseFolderUrl; }

  get mainThemesListUrl() { return this._mainThemesListUrl; }

  get renderTemplateListUrl() { return this._renderTemplateListUrl; }

  get renderThemeListUrl() { return this._renderThemeListUrl; }

  get scriptEditorThemeListUrl() { return this._scriptEditorThemeListUrl; }


}
