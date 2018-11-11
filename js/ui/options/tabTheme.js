/*global browser BrowserManager Transfer LocalStorageManager ThemeManager*/
'use strict';
class TabTheme { /*exported TabTheme*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updateLocalizedStrings();
  }

  async init_async() {
    await this._initThemeDropdown_async(ThemeManager.instance.mainThemesListUrl, 'mainThemeList', ThemeManager.instance.mainThemeFolderName);
    await this._initThemeDropdown_async(ThemeManager.instance.renderTemplateListUrl, 'renderTemplateList', ThemeManager.instance.renderTemplateFolderName);
    await this._initThemeDropdown_async(ThemeManager.instance.renderThemeListUrl, 'renderThemeList', ThemeManager.instance.renderThemeFolderName);
  }

  _updateLocalizedStrings() {    
    document.getElementById('themeTabButton').textContent = browser.i18n.getMessage('optTheme');
    document.getElementById('lblSelectMainTheme').textContent = browser.i18n.getMessage('optSelectMainTheme');
    document.getElementById('lblSelectRenderTemplate').textContent = browser.i18n.getMessage('optSelectRenderTemplate');
    document.getElementById('lblSelectRenderTheme').textContent = browser.i18n.getMessage('optSelectRenderTheme');
  }

  async _initThemeDropdown_async(mainThemesListUrl, divId, selectedThemeName) {
    let dropdownId = divId + 'Select';
    let divElement = document.getElementById(divId);
    let htmlDropdown = divElement.innerHTML + await this._createMainThemeListHtml_async(mainThemesListUrl, dropdownId, selectedThemeName);
    BrowserManager.setInnerHtmlByElement(divElement, htmlDropdown);
    document.getElementById(dropdownId).addEventListener('change', (e) => { this._themeSelectChanged_event(e); });
  }

  async _createMainThemeListHtml_async(mainThemesListUrl, dropdownId, selectedThemeName) {
    const folder_name = 0;
    const ui_name = 1;
    let themeListUrl = browser.runtime.getURL(mainThemesListUrl);
    let themeListText = await Transfer.downloadTextFile_async(themeListUrl);
    let themeList = themeListText.trim().split('\n');

    let optionList = [];
    themeList.shift();
    for (let themeEntry of themeList) {
      let theme = themeEntry.split(';');
      let selected = '';
      if (theme[folder_name] == selectedThemeName) { selected = 'selected'; }
      let optionLine = '<option value="' + theme[folder_name] + '" ' + selected + '>' + theme[ui_name] + '</option>\n';
      optionList.push(optionLine);
    }
    let selectOptions = '<select id="' + dropdownId + '">\n' + optionList + '</select>\n';
    return selectOptions;
  }

  async _themeSelectChanged_event(e) {
    let themeName = e.target.value;
    switch (e.target.id) {
      case 'mainThemeListSelect':
        await ThemeManager.instance.setThemeFolderName_async(ThemeManager.instance.kind.mainTheme, themeName);
        await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
        break;
      case 'renderTemplateListSelect':
        await ThemeManager.instance.setThemeFolderName_async(ThemeManager.instance.kind.renderTemplate, themeName);
        break;
      case 'renderThemeListSelect':
        await ThemeManager.instance.setThemeFolderName_async(ThemeManager.instance.kind.renderTheme, themeName);
        break;
    }
  }

}