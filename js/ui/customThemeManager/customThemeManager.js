/*global ThemeManager ThemeCustomManager BrowserManager LocalStorageManager DefaultValues CssManager*/
'use strict';
const _internal_name = 0;
const _ui_name = 1;
class CustomThemeManager { /*exported CustomThemeManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updateLocalizedStrings();
    document.getElementById('importThemeCustom').addEventListener('click', (e) => { this._importThemeCustomOnClicked_event(e); });
    document.getElementById('inputImportThemeCustom').addEventListener('change', (e) => { this._inputImportThemeCustomChanged_event(e); });
    //Main custom theme
    this._initSelectMainThemeCustom_async();
    document.getElementById('selectMainThemeCustom').addEventListener('change', (e) => { this._selectMainThemeCustomOnChange_event(e); });
    document.getElementById('applyMainThemeCustom').addEventListener('click', (e) => { this._applyMainThemeCustomOnClicked_event(e); });
    document.getElementById('exportMainThemeCustom').addEventListener('click', (e) => { this._exportMainThemeCustomOnClicked_event(e); });
    document.getElementById('renameMainThemeCustom').addEventListener('click', (e) => { this._renameMainThemeCustomOnClicked_event(e); });
    document.getElementById('deleteMainThemeCustom').addEventListener('click', (e) => { this._deleteMainThemeCustomOnClicked_event(e); });
    //Render tab template
    this._initSelectRenderTemplateCustom_async();
    document.getElementById('selectRenderTemplateCustom').addEventListener('change', (e) => { this._selectRenderTemplateCustomOnChange_event(e); });
    document.getElementById('applyRenderTemplateCustom').addEventListener('click', (e) => { this._applyRenderTemplateCustomOnClicked_event(e); });
    document.getElementById('exportRenderTemplateCustom').addEventListener('click', (e) => { this._exportRenderTemplateCustomOnClicked_event(e); });
    document.getElementById('renameRenderTemplateCustom').addEventListener('click', (e) => { this._renameRenderTemplateCustomOnClicked_event(e); });
    document.getElementById('deleteRenderTemplateCustom').addEventListener('click', (e) => { this._deleteRenderTemplateCustomOnClicked_event(e); });
    //Render tab theme
    this._initSelectRenderThemeCustom_async();
    document.getElementById('selectRenderThemeCustom').addEventListener('change', (e) => { this._selectRenderThemeCustomOnChange_event(e); });
    document.getElementById('applyRenderThemeCustom').addEventListener('click', (e) => { this._applyRenderThemeCustomOnClicked_event(e); });
    document.getElementById('exportRenderThemeCustom').addEventListener('click', (e) => { this._exportRenderThemeCustomOnClicked_event(e); });
    document.getElementById('renameRenderThemeCustom').addEventListener('click', (e) => { this._renameRenderThemeCustomOnClicked_event(e); });
    document.getElementById('deleteRenderThemeCustom').addEventListener('click', (e) => { this._deleteRenderThemeCustomOnClicked_event(e); });
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
    let selectElement = document.getElementById('selectMainThemeCustom');
    let enabled = (selectElement.options[selectElement.selectedIndex].type == 'custom');
    CssManager.setElementEnableByIdEx('renameMainThemeCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteMainThemeCustom', null, enabled);
  }

  async _selectMainThemeCustomOnChange_event(event) {
    let themeType = event.target.options[event.target.selectedIndex].type;
    let enabled = (themeType == 'custom');
    CssManager.setElementEnableByIdEx('renameMainThemeCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteMainThemeCustom', null, enabled);
  }

  async _applyMainThemeCustomOnClicked_event() {
    this._applyThemeCustom_async('selectMainThemeCustom', ThemeManager.instance.kind.mainTheme);
    await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
    window.location.reload();
  }

  async _exportMainThemeCustomOnClicked_event() {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById('selectMainThemeCustom');
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeCustomManager.instance.exportThemeCustom_async(ThemeManager.instance.kind.mainTheme, themeName);
  }

  async _renameMainThemeCustomOnClicked_event() {
  }

  async _deleteMainThemeCustomOnClicked_event() {
    await this._deleteThemeCustom_async('selectMainThemeCustom', ThemeCustomManager.instance.kind.mainTheme);
  }

  // Render tab custom template methods
  async _initSelectRenderTemplateCustom_async() {
    let templateBuiltinList = await ThemeManager.instance.getThemeBuiltinList_async(ThemeManager.instance.kind.renderTemplate);
    let templateCustomList = await ThemeCustomManager.instance.getCustomThemeList_async(ThemeManager.instance.kind.renderTemplate);
    this._initSelectOptions('selectRenderTemplateCustom', templateBuiltinList, templateCustomList, ThemeManager.instance.renderTemplateFolderName);
    let selectElement = document.getElementById('selectRenderTemplateCustom');
    let enabled = (selectElement.options[selectElement.selectedIndex].type == 'custom');
    CssManager.setElementEnableByIdEx('renameRenderTemplateCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteRenderTemplateCustom', null, enabled);
  }

  async _selectRenderTemplateCustomOnChange_event(event) {
    let themeType = event.target.options[event.target.selectedIndex].type;
    let enabled = (themeType == 'custom');
    CssManager.setElementEnableByIdEx('renameRenderTemplateCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteRenderTemplateCustom', null, enabled);
  }

  async _applyRenderTemplateCustomOnClicked_event() {
    this._applyThemeCustom_async('selectRenderTemplateCustom', ThemeManager.instance.kind.renderTemplate);
  }

  async _exportRenderTemplateCustomOnClicked_event() {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById('selectRenderTemplateCustom');
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeCustomManager.instance.exportThemeCustom_async(ThemeManager.instance.kind.renderTemplate, themeName);
  }

  async _renameRenderTemplateCustomOnClicked_event() {
  }

  async _deleteRenderTemplateCustomOnClicked_event() {
    await this._deleteThemeCustom_async('selectRenderTemplateCustom', ThemeCustomManager.instance.kind.renderTemplate);
  }

  // Render tab custom theme methods
  async _initSelectRenderThemeCustom_async() {
    let templateBuiltinList = await ThemeManager.instance.getThemeBuiltinList_async(ThemeManager.instance.kind.renderTheme);
    let templateCustomList = await ThemeCustomManager.instance.getCustomThemeList_async(ThemeManager.instance.kind.renderTheme);
    this._initSelectOptions('selectRenderThemeCustom', templateBuiltinList, templateCustomList, ThemeManager.instance.renderThemeFolderName);
    let selectElement = document.getElementById('selectRenderThemeCustom');
    let enabled = (selectElement.options[selectElement.selectedIndex].type == 'custom');
    CssManager.setElementEnableByIdEx('renameRenderThemeCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteRenderThemeCustom', null, enabled);
  }

  async _selectRenderThemeCustomOnChange_event() {
    let themeType = event.target.options[event.target.selectedIndex].type;
    let enabled = (themeType == 'custom');
    CssManager.setElementEnableByIdEx('renameRenderThemeCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteRenderThemeCustom', null, enabled);
  }

  async _applyRenderThemeCustomOnClicked_event() {
    this._applyThemeCustom_async('selectRenderThemeCustom', ThemeManager.instance.kind.renderTheme);
  }

  async _exportRenderThemeCustomOnClicked_event() {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById('selectRenderThemeCustom');
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeCustomManager.instance.exportThemeCustom_async(ThemeManager.instance.kind.renderTheme, themeName);
  }

  async _renameRenderThemeCustomOnClicked_event() {
  }

  async _deleteRenderThemeCustomOnClicked_event() {
    await this._deleteThemeCustom_async('selectRenderThemeCustom', ThemeCustomManager.instance.kind.renderTheme);
  }

  // Misc.
  async _importThemeCustomOnClicked_event() {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    document.getElementById('inputImportThemeCustom').click();
  }

  async _inputImportThemeCustomChanged_event() {
    let zipFile = document.getElementById('inputImportThemeCustom').files[0];
    let importError = await ThemeCustomManager.instance.importThemeCustom_async(zipFile);
    if (importError) {
      switch (importError.error) {
        case 'notValidThemeArchive':
          let moreInfo = (importError.value ? ': ' + importError.value : '');
          BrowserManager.setInnerHtmlById('errorMessage', 'This file is not a valid theme archive' + moreInfo);
          break;
        case 'alreadyExist':
          BrowserManager.setInnerHtmlById('errorMessage', 'A theme already exist with the name: ' + importError.value);
          break;
      }
    }
    else {
      window.location.reload();
    }
  }

  _initSelectOptions(selectId, builtinList, customList, selectedValue) {
    builtinList = builtinList.map((theme) => theme + ' [builtin]');
    customList = customList.map((theme) => theme + ' [custom]');
    let selectElement = document.getElementById(selectId);
    this._addOptionsToSelectElement(selectElement, builtinList, 'builtin');
    this._addOptionsToSelectElement(selectElement, customList, 'custom');
    selectElement.value = selectedValue;
  }

  _addOptionsToSelectElement(selectElement, themeList, themeType) {
    for (let themeEntry of themeList) {
      let option = document.createElement('option');
      let themeNames = themeEntry.split(';');
      option.value = themeNames[_internal_name];
      option.type = themeType;
      BrowserManager.setInnerHtmlByElement(option, themeNames[_ui_name]);
      selectElement.appendChild(option);
    }
  }

  async _applyThemeCustom_async(selectId, themeKind) {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById(selectId);
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeManager.instance.setThemeFolderName_async(themeKind, themeName);
  }

  async _deleteThemeCustom_async(selectId, themeKind) {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById(selectId);
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeCustomManager.instance.removeTheme_async(themeKind, themeName);
    switch (themeKind) {
      case ThemeManager.instance.kind.mainTheme:
        if (themeName == ThemeManager.instance.mainThemeFolderName) {
          ThemeManager.instance.mainThemeFolderName = DefaultValues.mainThemeFolderName;
          await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
        }
        break;
      case ThemeManager.instance.kind.renderTheme:
        if (themeName == ThemeManager.instance.renderThemeFolderName) {
          ThemeManager.instance.renderThemeFolderName = DefaultValues.renderThemeFolderName;
        }
        break;
      case ThemeManager.instance.kind.renderTemplate:
        if (themeName == ThemeManager.instance.renderTemplateFolderName) {
          ThemeManager.instance.renderTemplateFolderName = DefaultValues.renderTemplateFolderName;
        }
        break;
    }
    window.location.reload();
  }
}

CustomThemeManager.instance.init_async();
