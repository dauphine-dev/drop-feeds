/*global browser ThemeManager ThemeCustomManager BrowserManager LocalStorageManager DefaultValues CssManager CustomThemeNameDialog*/
'use strict';
const _internal_name = 0;
const _ui_name = 1;
class CustomThemeManagerUI {
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
    //Script editor theme
    this._initSelectScriptEditorThemeCustom_async();
    document.getElementById('selectScriptEditorThemeCustom').addEventListener('change', (e) => { this._selectScriptEditorThemeCustomOnChange_event(e); });
    document.getElementById('applyScriptEditorThemeCustom').addEventListener('click', (e) => { this._applyScriptEditorThemeCustomOnClicked_event(e); });
    document.getElementById('exportScriptEditorThemeCustom').addEventListener('click', (e) => { this._exportScriptEditorThemeCustomOnClicked_event(e); });
    document.getElementById('renameScriptEditorThemeCustom').addEventListener('click', (e) => { this._renameScriptEditorThemeCustomOnClicked_event(e); });
    document.getElementById('deleteScriptEditorThemeCustom').addEventListener('click', (e) => { this._deleteScriptEditorThemeCustomOnClicked_event(e); });
  }

  async init_async() {
    document.getElementById('title').textContent = browser.i18n.getMessage('cthTitleCustomThemeManager');
    document.getElementById('importThemeCustom').textContent = browser.i18n.getMessage('cthImportThemeCustom');
    document.getElementById('legendMainThemeCustom').textContent = browser.i18n.getMessage('cthLegendMainThemeCustom');
    document.getElementById('legendRenderTemplateCustom').textContent = browser.i18n.getMessage('cthLegendRenderTemplateCustom');
    document.getElementById('legendRenderThemeCustom').textContent = browser.i18n.getMessage('cthLegendRenderThemeCustom');
    document.getElementById('legendScriptEditorThemeCustom').textContent = browser.i18n.getMessage('cthScriptEditorThemeCustom');
    document.getElementById('applyMainThemeCustom').textContent = browser.i18n.getMessage('cthApplyTheme');
    document.getElementById('exportMainThemeCustom').textContent = browser.i18n.getMessage('cthExportMainThemeCustom');
    document.getElementById('renameMainThemeCustom').textContent = browser.i18n.getMessage('cthRenameTheme');
    document.getElementById('deleteMainThemeCustom').textContent = browser.i18n.getMessage('cthDeleteTheme');
    document.getElementById('applyRenderTemplateCustom').textContent = browser.i18n.getMessage('cthApplyTheme');
    document.getElementById('exportRenderTemplateCustom').textContent = browser.i18n.getMessage('cthExportRenderTemplateCustom');
    document.getElementById('renameRenderTemplateCustom').textContent = browser.i18n.getMessage('cthRenameTheme');
    document.getElementById('deleteRenderTemplateCustom').textContent = browser.i18n.getMessage('cthDeleteTheme');
    document.getElementById('applyRenderThemeCustom').textContent = browser.i18n.getMessage('cthApplyTheme');
    document.getElementById('exportRenderThemeCustom').textContent = browser.i18n.getMessage('cthExportRenderThemeCustom');
    document.getElementById('renameRenderThemeCustom').textContent = browser.i18n.getMessage('cthRenameTheme');
    document.getElementById('deleteRenderThemeCustom').textContent = browser.i18n.getMessage('cthDeleteTheme');
    document.getElementById('applyScriptEditorThemeCustom').textContent = browser.i18n.getMessage('cthApplyTheme');
    document.getElementById('exportScriptEditorThemeCustom').textContent = browser.i18n.getMessage('cthExportScriptEditorThemeCustom');
    document.getElementById('renameScriptEditorThemeCustom').textContent = browser.i18n.getMessage('cthRenameTheme');
    document.getElementById('deleteScriptEditorThemeCustom').textContent = browser.i18n.getMessage('cthDeleteTheme');
  }

  _updateLocalizedStrings() {
  }

  // Main custom themes methods
  async _initSelectMainThemeCustom_async() {
    let tm = ThemeManager.instance;
    let mainThemeBuiltinList = await tm.getThemeBuiltinList_async(tm.kind.mainTheme);
    let mainThemeCustomList = await ThemeCustomManager.instance.getCustomThemeList_async(tm.kind.mainTheme);
    let abort = await this._initSelectOptions_async('selectMainThemeCustom', tm.kind.mainTheme, mainThemeBuiltinList, mainThemeCustomList, tm.mainThemeFolderName);
    if (abort) { return; }
    let selectElement = document.getElementById('selectMainThemeCustom');
    let enabled = (selectElement.options[selectElement.selectedIndex].type == 'custom');
    CssManager.setElementEnableByIdEx('renameMainThemeCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteMainThemeCustom', null, enabled);
  }

  async _selectMainThemeCustomOnChange_event(event) {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
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

  async _renameMainThemeCustomOnClicked_event(event) {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById('selectMainThemeCustom');
    let oldName = selectElement.options[selectElement.selectedIndex].value;
    CustomThemeNameDialog.instance.getThemeName(true, event.target, ThemeManager.instance.kind.mainTheme, oldName, null, this.renameCustomTheme_async);
  }

  async _deleteMainThemeCustomOnClicked_event() {
    await this._deleteThemeCustom_async('selectMainThemeCustom', ThemeCustomManager.instance.kind.mainTheme);
  }

  // Render tab custom template methods
  async _initSelectRenderTemplateCustom_async() {
    let tm = ThemeManager.instance;
    let templateBuiltinList = await tm.getThemeBuiltinList_async(tm.kind.renderTemplate);
    let templateCustomList = await ThemeCustomManager.instance.getCustomThemeList_async(tm.kind.renderTemplate);
    let abort = await this._initSelectOptions_async('selectRenderTemplateCustom', tm.kind.renderTemplate, templateBuiltinList, templateCustomList, tm.renderTemplateFolderName);
    if (abort) { return; }
    let selectElement = document.getElementById('selectRenderTemplateCustom');
    let enabled = (selectElement.options[selectElement.selectedIndex].type == 'custom');
    CssManager.setElementEnableByIdEx('renameRenderTemplateCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteRenderTemplateCustom', null, enabled);
  }

  async _selectRenderTemplateCustomOnChange_event(event) {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let themeType = event.target.options[event.target.selectedIndex].type;
    let enabled = (themeType == 'custom');
    CssManager.setElementEnableByIdEx('renameRenderTemplateCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteRenderTemplateCustom', null, enabled);
  }

  async _applyRenderTemplateCustomOnClicked_event() {
    this._applyThemeCustom_async('selectRenderTemplateCustom', ThemeManager.instance.kind.renderTemplate);
    window.location.reload();
  }

  async _exportRenderTemplateCustomOnClicked_event() {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById('selectRenderTemplateCustom');
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeCustomManager.instance.exportThemeCustom_async(ThemeManager.instance.kind.renderTemplate, themeName);
  }

  async _renameRenderTemplateCustomOnClicked_event(event) {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById('selectRenderTemplateCustom');
    let oldName = selectElement.options[selectElement.selectedIndex].value;
    CustomThemeNameDialog.instance.getThemeName(true, event.target, ThemeManager.instance.kind.renderTemplate, oldName, null, this.renameCustomTheme_async);
  }

  async _deleteRenderTemplateCustomOnClicked_event() {
    await this._deleteThemeCustom_async('selectRenderTemplateCustom', ThemeCustomManager.instance.kind.renderTemplate);
  }

  // Render tab custom theme methods
  async _initSelectRenderThemeCustom_async() {
    let tm = ThemeManager.instance;
    let templateBuiltinList = await tm.getThemeBuiltinList_async(tm.kind.renderTheme);
    let templateCustomList = await ThemeCustomManager.instance.getCustomThemeList_async(tm.kind.renderTheme);
    let abort = await this._initSelectOptions_async('selectRenderThemeCustom', tm.kind.renderTheme, templateBuiltinList, templateCustomList, tm.renderThemeFolderName);
    if (abort) { return; }
    let selectElement = document.getElementById('selectRenderThemeCustom');
    let enabled = (selectElement.options[selectElement.selectedIndex].type == 'custom');
    CssManager.setElementEnableByIdEx('renameRenderThemeCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteRenderThemeCustom', null, enabled);
  }

  async _selectRenderThemeCustomOnChange_event() {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let themeType = event.target.options[event.target.selectedIndex].type;
    let enabled = (themeType == 'custom');
    CssManager.setElementEnableByIdEx('renameRenderThemeCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteRenderThemeCustom', null, enabled);
  }

  async _applyRenderThemeCustomOnClicked_event() {
    this._applyThemeCustom_async('selectRenderThemeCustom', ThemeManager.instance.kind.renderTheme);
    window.location.reload();
  }

  async _exportRenderThemeCustomOnClicked_event() {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById('selectRenderThemeCustom');
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeCustomManager.instance.exportThemeCustom_async(ThemeManager.instance.kind.renderTheme, themeName);
  }

  async _renameRenderThemeCustomOnClicked_event(event) {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById('selectRenderThemeCustom');
    let oldName = selectElement.options[selectElement.selectedIndex].value;
    CustomThemeNameDialog.instance.getThemeName(true, event.target, ThemeManager.instance.kind.renderTheme, oldName, null, this.renameCustomTheme_async);
  }

  async _deleteRenderThemeCustomOnClicked_event() {
    await this._deleteThemeCustom_async('selectRenderThemeCustom', ThemeCustomManager.instance.kind.renderTheme);
  }

  // Script editor custom theme methods
  async _initSelectScriptEditorThemeCustom_async() {
    let tm = ThemeManager.instance, tc = ThemeCustomManager.instance;
    let scriptEditorBuiltinList = await tm.getThemeBuiltinList_async(tm.kind.scriptEditorTheme);
    let scriptEditorCustomList = await tc.getCustomThemeList_async(tm.kind.scriptEditorTheme);
    let abort = await this._initSelectOptions_async('selectScriptEditorThemeCustom', tm.kind.scriptEditorTheme, scriptEditorBuiltinList, scriptEditorCustomList, tm.scriptEditorThemeFolderName);
    if (abort) { return; }
    let selectElement = document.getElementById('selectScriptEditorThemeCustom');
    let enabled = (selectElement.options[selectElement.selectedIndex].type == 'custom');
    CssManager.setElementEnableByIdEx('renameScriptEditorThemeCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteScriptEditorThemeCustom', null, enabled);
  }

  async _selectScriptEditorThemeCustomOnChange_event() {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let themeType = event.target.options[event.target.selectedIndex].type;
    let enabled = (themeType == 'custom');
    CssManager.setElementEnableByIdEx('renameScriptEditorThemeCustom', null, enabled);
    CssManager.setElementEnableByIdEx('deleteScriptEditorThemeCustom', null, enabled);
  }

  async _applyScriptEditorThemeCustomOnClicked_event() {
    this._applyThemeCustom_async('selectScriptEditorThemeCustom', ThemeManager.instance.kind.scriptEditorTheme);
    window.location.reload();
  }

  async _exportScriptEditorThemeCustomOnClicked_event() {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById('selectScriptEditorThemeCustom');
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeCustomManager.instance.exportThemeCustom_async(ThemeManager.instance.kind.scriptEditorTheme, themeName);
  }

  async _renameScriptEditorThemeCustomOnClicked_event(event) {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    let selectElement = document.getElementById('selectScriptEditorThemeCustom');
    let oldName = selectElement.options[selectElement.selectedIndex].value;
    CustomThemeNameDialog.instance.getThemeName(true, event.target, ThemeManager.instance.kind.scriptEditorTheme, oldName, null, this.renameCustomTheme_async);
  }

  async _deleteScriptEditorThemeCustomOnClicked_event() {
    await this._deleteThemeCustom_async('selectScriptEditorThemeCustom', ThemeCustomManager.instance.kind.scriptEditorTheme);
  }

  // Misc.
  async importCustomTheme_async(themeName, themKind, fileName, file) {
    let importError = await ThemeCustomManager.instance.importThemeCustom_async(file, themeName);
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

  async renameCustomTheme_async(newName, themKind, oldName) {
    let self = CustomThemeManagerUI.instance;
    let renameError = await ThemeCustomManager.instance.renameCustomTheme_async(themKind, oldName, newName);
    if (renameError) {
      switch (renameError.error) {
        case 'error':
          let moreInfo = (renameError.value ? ': ' + renameError.value : '');
          BrowserManager.setInnerHtmlById('errorMessage', 'Something went wrong' + moreInfo);
          break;
        case 'alreadyExist':
          BrowserManager.setInnerHtmlById('errorMessage', 'A theme already exist with the name: ' + renameError.value);
          break;
      }
    }
    else {
      await self._updateSelectedThemeName_async(newName, themKind, oldName);
      window.location.reload();
    }
  }

  async _importThemeCustomOnClicked_event() {
    BrowserManager.setInnerHtmlById('errorMessage', '&nbsp;');
    document.getElementById('inputImportThemeCustom').click();
  }

  async _inputImportThemeCustomChanged_event() {
    let file = document.getElementById('inputImportThemeCustom').files[0];
    CustomThemeNameDialog.instance.getThemeName(false, document.getElementById('importThemeCustom'),
      ThemeManager.instance.kind.renderTheme, file.name, file, this.importCustomTheme_async);
  }


  async _initSelectOptions_async(selectId, themeKind, builtinList, customList, selectedValue) {
    let abort = false;
    builtinList = builtinList.map((theme) => theme + ' [builtin]');
    customList = customList.map((theme) => theme + ' [custom]');
    let selectElement = document.getElementById(selectId);
    this._addOptionsToSelectElement(selectElement, builtinList, 'builtin');
    this._addOptionsToSelectElement(selectElement, customList, 'custom');
    selectElement.value = selectedValue;
    if (selectElement.selectedIndex < 0) {
      await this._resetThemeName_async(themeKind, selectedValue, true);
      if (themeKind == ThemeManager.instance.kind.mainTheme) {
        await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
      }
      window.location.reload();
      abort = true;
      return abort;
    }
    BrowserManager.setInnerHtmlByElement(selectElement[selectElement.selectedIndex], selectElement[selectElement.selectedIndex].innerText + ' [active]');
    return abort;
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
    await this._resetThemeName_async(themeKind, themeName, false);
    if (themeKind == ThemeManager.instance.kind.mainTheme && themeName == ThemeManager.instance.mainThemeFolderName) {
      await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
    }
    window.location.reload();
  }

  async _resetThemeName_async(themeKind, themeName, force) {
    switch (themeKind) {
      case ThemeManager.instance.kind.mainTheme:
        if (themeName == ThemeManager.instance.mainThemeFolderName || force) {
          await ThemeManager.instance.setMainThemeFolderName_async(DefaultValues.mainThemeFolderName);
        }
        break;
      case ThemeManager.instance.kind.renderTheme:
        if (themeName == ThemeManager.instance.renderThemeFolderName || force) {
          await ThemeManager.instance.setRenderThemeFolderName_async(DefaultValues.renderThemeFolderName);
        }
        break;
      case ThemeManager.instance.kind.renderTemplate:
        if (themeName == ThemeManager.instance.renderTemplateFolderName || force) {
          await ThemeManager.instance.setRenderTemplateFolderName_async(DefaultValues.renderTemplateFolderName);
        }
        break;
      case ThemeManager.instance.kind.scriptEditorTheme:
        if (themeName == ThemeManager.instance.scriptEditorThemeFolderName || force) {
          await ThemeManager.instance.setScriptEditorThemeFolderName_async(DefaultValues.scriptEditorThemeFolderName);
        }
        break;
    }
  }

  async _updateSelectedThemeName_async(newName, themKind, oldName) {
    oldName = ThemeCustomManager.instance.getThemeNameWithPrefix(themKind, oldName);
    newName = ThemeCustomManager.instance.getThemeNameWithPrefix(themKind, newName);
    switch (themKind) {
      case ThemeManager.instance.kind.mainTheme:
        if (ThemeManager.instance.mainThemeFolderName == oldName) {
          await ThemeManager.instance.setMainThemeFolderName_async(newName);
        }
        break;
      case ThemeManager.instance.kind.renderTheme:
        if (ThemeManager.instance.renderThemeFolderName == oldName) {
          await ThemeManager.instance.setRenderThemeFolderName_async(newName);
        }
        break;
      case ThemeManager.instance.kind.renderTemplate:
        if (ThemeManager.instance.renderTemplateFolderName == oldName) {
          await ThemeManager.instance.setRenderTemplateFolderName_async(newName);
        }
        break;
      case ThemeManager.instance.kind.scriptEditorTheme:
        if (ThemeManager.instance.scriptEditorThemeFolderName == oldName) {
          await ThemeManager.instance.setScriptEditorThemeFolderName_async(newName);
        }
        break;
    }
  }

}
CustomThemeManagerUI.instance.init_async();