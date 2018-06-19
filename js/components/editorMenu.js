/*global browser FontManager*/
'use strict';
class EditorMenu { /*exported EditorMenu*/
  constructor(parentEditor) {
    this._parentEditor = parentEditor;
  }

  attach(baseElement) {
    this._createElements(baseElement);
    this._appendEventListeners();
    this._updateLocalizedStrings();
  }

  _createElements(baseElement) {
    let htmlString = '\
    <fieldset id="editFieldsetFont">\
      <legend id="editFontLegend">#Font</legend>\
      <span id="editFontFamily">#Family&nbsp;</span>\
      <select id="editSelectFontFamily">\
      </select>\
      <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>\
      <span id="editFontSize">#Size&nbsp;</span>\
      <select id="editSelectFontSize">\
      </select>\
    </fieldset>';
    baseElement.insertAdjacentHTML('beforeend', htmlString);

    //Add fonts family
    let editSelectFontFamily = document.getElementById('editSelectFontFamily');
    let fontList = FontManager.instance.getAvailableFontList();
    for (let font of fontList) {
      let option = document.createElement('option');
      option.text = font.family + ' (' + font.fallback + ')';
      option.value = '"' + font.family + '", "' + font.fallback  + '"';
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
  }

  _updateLocalizedStrings() {
    document.getElementById('editFontLegend').textContent = browser.i18n.getMessage('usUScriptFont');
    document.getElementById('editFontFamily').textContent = browser.i18n.getMessage('usUScriptFamily');
    document.getElementById('editFontSize').textContent = browser.i18n.getMessage('usUScriptSize');
  }

  _appendEventListeners() {
    document.getElementById('editFieldsetFont').addEventListener('change', (e) => { this._editFieldsetFontChange_event(e); });
    document.getElementById('editSelectFontSize').addEventListener('change', (e) => { this._editSelectFontSizeChange_event(e); });
  }

  async _editFieldsetFontChange_event(event) {
    event.stopPropagation();
    this._parentEditor.fontFamily = event.target.value;
  }

  async _editSelectFontSizeChange_event(event) {
    event.stopPropagation();
    this._parentEditor.fontSize = event.target.value;
  }

}