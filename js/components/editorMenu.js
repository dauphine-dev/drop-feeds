/*global FontManager*/
'use strict';
class EditorMenu { /*exported EditorMenu*/
  constructor(parentEditor) {
    this._parentEditor = parentEditor;
  }

  attach(baseElement) {
    this._createElements(baseElement);
    this._appendEventListeners();
  }

  _createElements(baseElement) {
    /*
    <fieldset id="editFieldsetFont">
      <legend>#Font</legend>
      <span>#Family&nbsp;</span>
      <select id="editSelectFontFamily">
        <option value="monospace">monospace (monospace)</option>
        <option value="sans-serif">sans-serif (sans-serif)</option>
        <option value="serif">serif (serif)</option>
      </select>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span>#Size&nbsp;</span>
      <select id="editSelectFontSize">
        <option value="10">10</option>
        <option value="11">11</option>
        <option value="12">12</option>
      </select>
    </fieldset>
    */


    let editFieldsetFont = document.createElement('fieldset');
    editFieldsetFont.setAttribute('id', 'editFieldsetFont');
    let legendFont = document.createElement('legend');
    legendFont.textContent = '#Font';
    editFieldsetFont.appendChild(legendFont);

    let spanFamily = document.createElement('span');
    spanFamily.textContent = '#Family' + '\xa0';
    editFieldsetFont.appendChild(spanFamily);

    let editSelectFontFamily = document.createElement('select');
    editSelectFontFamily.setAttribute('id', 'editSelectFontFamily');
    let fontList = FontManager.instance.getAvailableFontList();
    for (let font of fontList) {
      let option = document.createElement('option');
      option.text = font.family + ' (' + font.fallback + ')';
      option.value = '"' + font.family + '", "' + font.fallback  + '"';
      editSelectFontFamily.appendChild(option);
    }
    editSelectFontFamily.value = this._parentEditor.fontFamily;

    editFieldsetFont.appendChild(editSelectFontFamily);


    let spanSpace = document.createElement('span');
    spanSpace.innerText = '\xa0\xa0\xa0\xa0';
    editFieldsetFont.appendChild(spanSpace);


    let spanSize = document.createElement('span');
    spanSize.textContent = '#Size' + '\xa0';
    editFieldsetFont.appendChild(spanSize);

    let editSelectFontSize = document.createElement('select');
    editSelectFontSize.setAttribute('id', 'editSelectFontSize');
    for (let Size of FontManager.instance.fontSizeList) {
      let option = document.createElement('option');
      option.text = Size;
      option.value = Size;
      editSelectFontSize.appendChild(option);
    }
    editSelectFontSize.value = this._parentEditor.fontSize;
    editFieldsetFont.appendChild(editSelectFontSize);

    baseElement.appendChild(editFieldsetFont);

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