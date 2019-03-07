/*global ThemeManager ThemeCustomManager BrowserManager LocalStorageManager*/
'use strict';
class ThemeEditor { /*exported ThemeEditor*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    /*
    browser.storage.local.remove('undefinedList');
    browser.storage.local.remove('theme:sage_sc1');
    */
    this._updateLocalizedStrings();
    //Main custom theme
    this._initSelectMainThemeCustom_async();
    document.getElementById('deleteMainThemeCustom').addEventListener('click', (e) => { this._deleteMainThemeCustomOnClicked_event(e); });
    document.getElementById('exportMainThemeCustom').addEventListener('click', (e) => { this._exportMainThemeCustomOnClicked_event(e); });
    document.getElementById('importMainThemeCustom').addEventListener('click', (e) => { this._importMainThemeCustomOnClicked_event(e); });
    document.getElementById('inputImportMainThemeCustom').addEventListener('change', (e) => { this._inputImportMainThemeCustomChanged_event(e); });
    document.getElementById('applyMainThemeCustom').addEventListener('click', (e) => { this._applyMainThemeCustomOnClicked_event(e); });
    //Render tab template
    this._initSelectRenderTemplateCustom_async();
    document.getElementById('deleteRenderTemplateCustom').addEventListener('click', (e) => { this._deleteRenderTemplateCustomOnClicked_event(e); });
    document.getElementById('exportRenderTemplateCustom').addEventListener('click', (e) => { this._exportRenderTemplateCustomOnClicked_event(e); });
    document.getElementById('importRenderTemplateCustom').addEventListener('click', (e) => { this._importRenderTemplateCustomOnClicked_event(e); });
    document.getElementById('inputImportRenderTemplateCustom').addEventListener('change', (e) => { this._inputImportRenderTemplateCustomChanged_event(e); });
    document.getElementById('applyRenderTemplateCustom').addEventListener('click', (e) => { this._applyRenderTemplateCustomOnClicked_event(e); });
    //Render tab theme
    this._initSelectRenderThemeCustom_async();
    document.getElementById('deleteRenderThemeCustom').addEventListener('click', (e) => { this._deleteRenderThemeCustomOnClicked_event(e); });
    document.getElementById('exportRenderThemeCustom').addEventListener('click', (e) => { this._exportRenderThemeCustomOnClicked_event(e); });
    document.getElementById('importRenderThemeCustom').addEventListener('click', (e) => { this._importRenderThemeCustomOnClicked_event(e); });
    document.getElementById('inputImportRenderThemeCustom').addEventListener('change', (e) => { this._inputImportRenderThemeCustomChanged_event(e); });
    document.getElementById('applyRenderThemeCustom').addEventListener('click', (e) => { this._applyRenderThemeCustomOnClicked_event(e); });
  }

  async init_async() {
  }

  _updateLocalizedStrings() {
  }

  // Main custom themes methods
  async _initSelectMainThemeCustom_async() {
    let mainThemeBuiltinList = await ThemeManager.instance.getThemeBuiltinList_async(ThemeManager.instance.kind.mainTheme);
    let mainThemeCustomList = await ThemeCustomManager.instance.getCustomThemeList_async(ThemeManager.instance.kind.mainTheme);
    this._initSelectOptions('selectMainThemeCustom', mainThemeBuiltinList, mainThemeCustomList, ThemeManager.instance.mainThemeFolderName);
  }

  async _deleteMainThemeCustomOnClicked_event() {
    await this._deleteThemeCustom_async('selectMainThemeCustom', ThemeCustomManager.instance.kind.mainTheme);
  }

  async _exportMainThemeCustomOnClicked_event() {
    let selectElement = document.getElementById('selectMainThemeCustom');
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeCustomManager.instance.exportThemeCustom_async(ThemeManager.instance.kind.mainTheme, themeName);
  }

  async _importMainThemeCustomOnClicked_event() {
    document.getElementById('inputImportMainThemeCustom').click();
  }

  async _inputImportMainThemeCustomChanged_event() {
    this._importThemeCustom_async('inputImportMainThemeCustom', ThemeManager.instance.kind.mainTheme);
  }

  async _applyMainThemeCustomOnClicked_event() {
    this._applyThemeCustom_async('selectMainThemeCustom', ThemeManager.instance.kind.mainTheme);
    await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
    window.location.reload();
  }

  // Render tab custom template methods
  async _initSelectRenderTemplateCustom_async() {
    let templateBuiltinList = await ThemeManager.instance.getThemeBuiltinList_async(ThemeManager.instance.kind.renderTemplate);
    let templateCustomList = await ThemeCustomManager.instance.getCustomThemeList_async(ThemeManager.instance.kind.renderTemplate);
    this._initSelectOptions('selectRenderTemplateCustom', templateBuiltinList, templateCustomList, ThemeManager.instance.renderTemplateFolderName);
  }

  async _deleteRenderTemplateCustomOnClicked_event() {
    await this._deleteThemeCustom_async('selectRenderTemplateCustom', ThemeCustomManager.instance.kind.renderTemplate);
  }

  async _exportRenderTemplateCustomOnClicked_event() {
    let selectElement = document.getElementById('selectRenderTemplateCustom');
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeCustomManager.instance.exportThemeCustom_async(ThemeManager.instance.kind.renderTemplate, themeName);
  }

  async _importRenderTemplateCustomOnClicked_event() {
    document.getElementById('inputImportRenderTemplateCustom').click();
  }

  async _inputImportRenderTemplateCustomChanged_event() {
    this._importThemeCustom_async('inputImportRenderTemplateCustom', ThemeManager.instance.kind.renderTemplate);
  }

  async _applyRenderTemplateCustomOnClicked_event() {
    this._applyThemeCustom_async('selectRenderTemplateCustom', ThemeManager.instance.kind.renderTemplate);
  }

  // Render tab custom theme methods
  async _initSelectRenderThemeCustom_async() {
    let templateBuiltinList = await ThemeManager.instance.getThemeBuiltinList_async(ThemeManager.instance.kind.renderTheme);
    let templateCustomList = await ThemeCustomManager.instance.getCustomThemeList_async(ThemeManager.instance.kind.renderTheme);
    this._initSelectOptions('selectRenderThemeCustom', templateBuiltinList, templateCustomList, ThemeManager.instance.renderThemeFolderName);
  }

  async _deleteRenderThemeCustomOnClicked_event() {
    await this._deleteThemeCustom_async('selectRenderThemeCustom', ThemeCustomManager.instance.kind.renderTheme);
  }

  async _exportRenderThemeCustomOnClicked_event() {
    let selectElement = document.getElementById('selectRenderThemeCustom');
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeCustomManager.instance.exportThemeCustom_async(ThemeManager.instance.kind.renderTheme, themeName);
  }

  async _importRenderThemeCustomOnClicked_event() {
    document.getElementById('inputImportRenderThemeCustom').click();
  }

  async _inputImportRenderThemeCustomChanged_event() {
    this._importThemeCustom_async('inputImportRenderThemeCustom', ThemeManager.instance.kind.renderTheme);
  }

  async _applyRenderThemeCustomOnClicked_event() {
    this._applyThemeCustom_async('selectRenderThemeCustom', ThemeManager.instance.kind.renderTheme);
  }

  // Misc.
  _initSelectOptions(selectId, builtinList, customList, selectedValue) {
    const internal_name = 0;
    const ui_name = 1;
    builtinList = builtinList.map((theme) => theme + ' [builtin]');
    customList = customList.map((theme) => theme + ' [custom]');
    let themeList = [...builtinList, ...customList];

    let selectOptions = document.getElementById(selectId);
    for (let themeEntry of themeList) {
      let option = document.createElement('option');
      let themeNames = themeEntry.split(';');
      option.value = themeNames[internal_name];
      BrowserManager.setInnerHtmlByElement(option, themeNames[ui_name]);
      selectOptions.appendChild(option);
    }
    selectOptions.value = selectedValue;
  }

  async _importThemeCustom_async(inputImportId, themeKind) {
    let zipFile = document.getElementById(inputImportId).files[0];
    let themeNameNotAvailable = await ThemeCustomManager.instance.importThemeCustom_async(themeKind, zipFile);
    if (themeNameNotAvailable) {
      BrowserManager.setInnerHtmlById('errorMessage', 'A theme already exist with the name: ' + themeNameNotAvailable);
      setTimeout(() => { BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;'); }, 2000);
    }
    else {
      window.location.reload();
    }
  }

  async _applyThemeCustom_async(selectId, themeKind) {
    let selectElement = document.getElementById(selectId);
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeManager.instance.setThemeFolderName_async(themeKind, themeName);
  }

  async _deleteThemeCustom_async(selectId, themeKind) {
    let selectElement = document.getElementById(selectId);
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeCustomManager.instance.removeTheme_async(themeKind, themeName);
    window.location.reload();
  }

}

ThemeEditor.instance.init_async();
