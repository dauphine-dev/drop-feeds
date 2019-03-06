/*global ThemeManager ThemeCustomManager BrowserManager LocalStorageManager*/
'use strict';
class ThemeEditor { /*exported ThemeEditor*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    //browser.storage.local.remove('test');
    this._updateLocalizedStrings();
    //Main custom theme
    this._initSelectMainCustomTheme_async();
    document.getElementById('exportMainCustomTheme').addEventListener('click', (e) => { this._exportMainCustomThemeOnClicked_event(e); });
    document.getElementById('importMainCustomTheme').addEventListener('click', (e) => { this._importMainCustomThemeOnClicked_event(e); });
    document.getElementById('inputImportMainCustomTheme').addEventListener('change', (e) => { this._inputImportMainCustomThemeChanged_event(e); });
    document.getElementById('applyMainCustomTheme').addEventListener('click', (e) => { this._applyMainCustomThemeOnClicked_event(e); });
    //Render tab template
    document.getElementById('exportRenderTabCustomTemplate').addEventListener('click', (e) => { this._exportRenderTabCustomTemplateOnClicked_event(e); });
    document.getElementById('importRenderTabCustomTemplate').addEventListener('click', (e) => { this._importRenderTabCustomTemplateOnClicked_event(e); });
    document.getElementById('inputImportRenderTabCustomTemplate').addEventListener('change', (e) => { this._inputImportRenderTabCustomTemplateChanged_event(e); });
    document.getElementById('applyRenderTabCustomTemplate').addEventListener('click', (e) => { this._applyRenderTabCustomTemplateOnClicked_event(e); });
    //Render tab theme
    document.getElementById('exportRenderTabCustomTheme').addEventListener('click', (e) => { this._exportRenderTabCustomThemeOnClicked_event(e); });
    document.getElementById('importRenderTabCustomTheme').addEventListener('click', (e) => { this._importRenderTabCustomThemeOnClicked_event(e); });
    document.getElementById('inputImportRenderTabCustomTheme').addEventListener('change', (e) => { this._inputImportRenderTabCustomThemeChanged_event(e); });
    document.getElementById('applyRenderTabCustomTheme').addEventListener('click', (e) => { this._applyRenderTabCustomThemeOnClicked_event(e); });
  }

  async init_async() {
  }

  _updateLocalizedStrings() {
  }

  async _initSelectMainCustomTheme_async() {
    const internal_name = 0;
    const ui_name = 1;
    let themeBuiltinList = await ThemeManager.instance.getThemeBuiltinList_async(ThemeManager.instance.kind.mainTheme);
    themeBuiltinList = themeBuiltinList.map((theme) => theme + ' [builtin]');
    let themeCustomList = await ThemeCustomManager.instance.getThemeCustomList_async(ThemeManager.instance.kind.mainTheme);
    themeCustomList = themeCustomList.map((theme) => theme + ' [custom]');
    let themeList = [...themeBuiltinList, ...themeCustomList];

    let selectMainCustomTheme = document.getElementById('selectMainCustomTheme');
    for (let themeEntry of themeList) {
      let option = document.createElement('option');
      let themeNames = themeEntry.split(';');
      option.value = themeNames[internal_name];
      BrowserManager.setInnerHtmlByElement(option, themeNames[ui_name]);
      selectMainCustomTheme.appendChild(option);
    }
    selectMainCustomTheme.value = ThemeManager.instance.mainThemeFolderName;
  }

  //Main custom theme events
  async _exportMainCustomThemeOnClicked_event() {
    let selectMainCustomTheme = document.getElementById('selectMainCustomTheme');
    let themeName = selectMainCustomTheme.options[selectMainCustomTheme.selectedIndex].value;
    ThemeCustomManager.instance.exportCustomMainTheme_async(themeName);
  }

  async _importMainCustomThemeOnClicked_event() {
    document.getElementById('inputImportMainCustomTheme').click();
  }

  async _inputImportMainCustomThemeChanged_event() {
    let zipFile = document.getElementById('inputImportMainCustomTheme').files[0];
    let themeNameNotAvailable = await ThemeCustomManager.instance.importCustomMainTheme_async(zipFile);
    if (themeNameNotAvailable) {
      BrowserManager.setInnerHtmlById('errorMessage', 'A theme already exist with the name: ' + themeNameNotAvailable);
      setTimeout(() => { BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;'); }, 2000);
    }
  }

  async _applyMainCustomThemeOnClicked_event() {
    let selectMainCustomTheme = document.getElementById('selectMainCustomTheme');
    let themeName = selectMainCustomTheme.options[selectMainCustomTheme.selectedIndex].value;
    await ThemeManager.instance.setThemeFolderName_async(ThemeManager.instance.kind.mainTheme, themeName);
    await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
  }

}

ThemeEditor.instance.init_async();
