/*global browser BrowserManager Transfer LocalStorageManager ThemeManager*/
'use strict';
class TabTheme { /*exported TabTheme*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updateLocalizedStrings();
  }

  async init_async() {
    await this._initThemeDropdown_async(ThemeManager.instance.mainThemesListUrl, 'mainThemeList');
    await this._initThemeDropdown_async(ThemeManager.instance.renderTemplateListUrl, 'renderTemplateList');
    await this._initThemeDropdown_async(ThemeManager.instance.renderThemeListUrl, 'renderThemeList');
  }

  _updateLocalizedStrings() {
    document.getElementById('lblSelectMainTheme').textContent = browser.i18n.getMessage('optSelectTheme');
  }

  async _initThemeDropdown_async(mainThemesListUrl, divId) {
    let dropdownId = divId + 'Select';
    let divElement = document.getElementById(divId);
    let htmlDropdown = divElement.innerHTML + await this._createMainThemeListHtml_async(mainThemesListUrl, dropdownId);
    BrowserManager.setInnerHtmlByElement(divElement, htmlDropdown);
    document.getElementById(dropdownId).addEventListener('change', (e) => { this._themeSelectChanged_event(e); });
  }

  async _createMainThemeListHtml_async(mainThemesListUrl, dropdownId) {
    const folder_name = 0;
    const ui_name = 1;
    let themeListUrl = browser.runtime.getURL(mainThemesListUrl);
    let themeListText = await Transfer.downloadTextFile_async(themeListUrl);
    let themeList = themeListText.trim().split('\n');
    let selectedThemeName = await ThemeManager.instance.mainThemeFolderName;

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