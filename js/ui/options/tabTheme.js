/*global browser BrowserManager LocalStorageManager ThemeManager ThemeCustomManager*/
'use strict';
class TabTheme { /*exported TabTheme*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._tm = ThemeManager.instance;
    this._tcm = ThemeCustomManager.instance;
    this._updateLocalizedStrings();
  }

  async init_async() {
    await this._tm.init_async();
    await this._initThemeDropdown_async(this._tm.kinds.mainTheme, 'mainThemeList', this._tm.mainThemeFolderName);
    await this._initThemeDropdown_async(this._tm.kinds.renderTemplate, 'renderTemplateList', this._tm.renderTemplateFolderName);
    await this._initThemeDropdown_async(this._tm.kinds.renderTheme, 'renderThemeList', this._tm.renderThemeFolderName);
    document.getElementById('customThemeManagerButton').addEventListener('click', (e) => { this._customThemeManagerButtonButtonOnClicked_event(e); });
  }

  _updateLocalizedStrings() {
    document.getElementById('themeTabButton').textContent = browser.i18n.getMessage('optTheme');
    document.getElementById('lblSelectMainTheme').textContent = browser.i18n.getMessage('optSelectMainTheme');
    document.getElementById('lblSelectRenderTemplate').textContent = browser.i18n.getMessage('optSelectRenderTemplate');
    document.getElementById('lblSelectRenderTheme').textContent = browser.i18n.getMessage('optSelectRenderTheme');
    document.getElementById('lblOpenCustomThemeManager').textContent = browser.i18n.getMessage('optOpenCustomThemeManager');
    document.getElementById('customThemeManagerButton').textContent = browser.i18n.getMessage('optThemeManager');
  }

  async _initThemeDropdown_async(themeKind, divId, selectedThemeName) {
    let dropdownId = divId + 'Select';
    let divElement = document.getElementById(divId);
    let htmlDropdown = divElement.innerHTML + await this._createMainThemeListHtml_async(themeKind, dropdownId, selectedThemeName);
    BrowserManager.setInnerHtmlByElement(divElement, htmlDropdown);
    document.getElementById(dropdownId).addEventListener('change', (e) => { this._themeSelectChanged_event(e); });
  }

  async _createMainThemeListHtml_async(themeKind, dropdownId, selectedThemeName) {
    const folder_name = 0;
    const ui_name = 1;
    let themeList = await this._tm.getThemeAllList_async(themeKind);
    let optionList = [];
    for (let themeEntry of themeList) {
      let theme = themeEntry.split(';');
      let selected = theme[folder_name] == selectedThemeName ? 'selected' : '';
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
        await this._tm.setThemeFolderName_async(this._tm.kinds.mainTheme, themeName);
        await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
        break;
      case 'renderTemplateListSelect':
        await this._tm.setThemeFolderName_async(this._tm.kinds.renderTemplate, themeName);
        break;
      case 'renderThemeListSelect':
        await this._tm.setThemeFolderName_async(this._tm.kinds.renderTheme, themeName);
        break;
    }
  }

  async _customThemeManagerButtonButtonOnClicked_event() {
    await browser.tabs.create({ url: '/html/customThemeManager.html', active: true });
  }

}