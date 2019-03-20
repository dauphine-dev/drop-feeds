/*global browser BrowserManager FontManager ThemeManager ThemeCustomManager*/
'use strict';
class EditorMenu { /*exported EditorMenu*/
  constructor(parentEditor) {
    this._parentEditor = parentEditor;
  }

  async attach_async(baseElement) {
    await this._createElements_async(baseElement);
    this._appendEventListeners();
    this._updateLocalizedStrings();
  }

  async _createElements_async(baseElement) {
    let htmlString = `
    <fieldset id="editFieldsetFont" class="editorMenu">
      <legend id="editFontLegend">#Font</legend>
      <span id="editFontFamily">#Family</span>&nbsp;
      <select id="editSelectFontFamily">
      </select>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span id="editFontSize">#Size</span>&nbsp;
      <select id="editSelectFontSize">
      </select>
      <span id="editTabSize">#Tab size</span>&nbsp;
      <input id="editInputTabSize" step="1" min="1" max="99" type="number" size="2" value="4" style="width: 35px;">
    </fieldset>
    <fieldset id="editFieldsetTheme" class="editorMenu">
      <legend id="editThemeLegend">#Theme</legend>
      <select id="editSelectTheme">
      </select>
    </fieldset>`;

    BrowserManager.insertAdjacentHTMLBeforeEnd(baseElement, htmlString);

    document.getElementById('editFieldsetFont').style.display = 'none';
    document.getElementById('editFieldsetTheme').style.display = 'none';

    //Add fonts family
    let editSelectFontFamily = document.getElementById('editSelectFontFamily');
    let fontList = FontManager.instance.getAvailableFontList();
    for (let font of fontList) {
      let option = document.createElement('option');
      option.text = font.family + ' (' + font.fallback + ')';
      option.value = '"' + font.family + '", "' + font.fallback + '"';
      editSelectFontFamily.appendChild(option);
    }
    editSelectFontFamily.value = this._parentEditor.fontFamily;

    //Add fonts size
    let editSelectFontSize = document.getElementById('editSelectFontSize');
    for (let Size of FontManager.instance.fontSizeList) {
      let option = document.createElement('option');
      option.text = Size;
      option.value = Size;
      editSelectFontSize.appendChild(option);
    }
    editSelectFontSize.value = this._parentEditor.fontSize;

    //Add editor theme
    const internal_name = 0;
    const ui_name = 1;
    let editSelectTheme = document.getElementById('editSelectTheme');
    let tm = ThemeManager.instance, tc = ThemeCustomManager.instance;
    let themeEditorBuiltinList = await tm.getThemeBuiltinList_async(tm.kinds.scriptEditorTheme);
    themeEditorBuiltinList = themeEditorBuiltinList.map((theme) => theme + ' [builtin]');
    let themeEditorCustomList = await tc.getCustomThemeList_async(tm.kinds.scriptEditorTheme);
    themeEditorCustomList = themeEditorCustomList.map((theme) => theme + ' [custom]');
    let themeEditorList = [...themeEditorBuiltinList, ...themeEditorCustomList];
    for (let themeEntry of themeEditorList) {
      let themeNames = themeEntry.split(';');
      let option = document.createElement('option');
      option.text = themeNames[ui_name];
      option.value = themeNames[internal_name];
      editSelectTheme.appendChild(option);
    }
    editSelectTheme.value = tm.scriptEditorThemeFolderName;
  }

  _updateLocalizedStrings() {
    document.getElementById('editFontLegend').textContent = browser.i18n.getMessage('usUScriptFont');
    document.getElementById('editFontFamily').textContent = browser.i18n.getMessage('usUScriptFamily');
    document.getElementById('editFontSize').textContent = browser.i18n.getMessage('usUScriptSize');
    document.getElementById('editTabSize').textContent = browser.i18n.getMessage('usUScriptTabSize');
    document.getElementById('editThemeLegend').textContent = browser.i18n.getMessage('usUScriptTheme');
  }

  _appendEventListeners() {
    document.getElementById('editFieldsetFont').addEventListener('change', (e) => { this._editFieldsetFontChange_event(e); });
    document.getElementById('editSelectFontSize').addEventListener('change', (e) => { this._editSelectFontSizeChange_event(e); });
    document.getElementById('editInputTabSize').addEventListener('change', (e) => { this._editInputTabSizeChange_event(e); });
    document.getElementById('editSelectTheme').addEventListener('change', (e) => { this._editSelectThemeChange_event(e); });
  }

  async _editFieldsetFontChange_event(event) {
    event.stopPropagation();
    this._parentEditor.fontFamily = event.target.value;
  }

  async _editSelectFontSizeChange_event(event) {
    event.stopPropagation();
    this._parentEditor.fontSize = event.target.value;
  }

  async _editInputTabSizeChange_event(event) {
    event.stopPropagation();
    this._parentEditor.tabSize = event.target.value;
  }

  async _editSelectThemeChange_event(event) {
    event.stopPropagation();
    let selectElement = document.getElementById('editSelectTheme');
    let themeName = selectElement.options[selectElement.selectedIndex].value;
    await ThemeManager.instance.setThemeFolderName_async(ThemeManager.instance.kinds.scriptEditorTheme, themeName);
  }

}