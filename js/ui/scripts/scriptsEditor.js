/*global browser ScriptsManager LocalStorageManager*/
'use strict';

const _scriptCodeKey = 'scriptCode-';

class ScriptsEditor { /*exported ScriptsEditor */
  static get instance() {
    if (!this._instance) {
      this._instance = new ScriptsEditor();
    }
    return this._instance;
  }

  constructor() {
    this._scriptId = null;
    this._shiftPressed = false;
    this._ctrlPressed = false;
    this._tabSize = 4;
    this._tabChar = ' '.repeat(this._tabSize);
    document.addEventListener('keydown', ScriptsEditor._documentKeyUpDown_event);
    document.addEventListener('keyup', ScriptsEditor._documentKeyUpDown_event);
    document.getElementById('saveButton').addEventListener('click', ScriptsEditor._saveButtonClicked_event);
    document.getElementById('closeButton').addEventListener('click', ScriptsEditor._closeButtonClicked_event);
    document.getElementById('textArea').addEventListener('keydown', ScriptsEditor._textAreaKeydown_event);
  }
  async init_async() {
  }

  async display_async(scriptId) {
    this._scriptId = scriptId;
    await this._loadScript_async();
    document.getElementById('scriptManager').style.display = 'none';
    document.getElementById('scriptEditor').style.display = 'block';
    document.getElementById('titlePage').textContent = 'Script editor';
  }

  async _loadScript_async() {
    let textArea = document.getElementById('textArea');
    let scriptCode = await LocalStorageManager.getValue_async(_scriptCodeKey + this._scriptId, textArea.getAttribute('defaultvalue'));
    textArea.value = scriptCode;
  }

  static async _saveButtonClicked_event() {
    let self = ScriptsEditor.instance;
    let scriptCode = document.getElementById('textArea').value;
    LocalStorageManager.setValue_async(_scriptCodeKey + self._scriptId, scriptCode);
  }

  static async _closeButtonClicked_event() {
    ScriptsManager.instance.display();
  }

  static _documentKeyUpDown_event(event) {
    let self = ScriptsEditor.instance;
    switch (event.key) {
      case 'Shift':
        self._shiftPressed = !self._shiftPressed;
        break;
      case 'Control':
        self._ctrlPressed = !self._ctrlPressed;
    }
  }
  static async _textAreaKeydown_event(event) {
    let self = ScriptsEditor.instance;
    if (event.key === 'Tab') {
      event.preventDefault();
      if (!self._shiftPressed) {
        self._addTab();
      } else {
        self._removeTab();
      }
      return false;
    }
  }

  _addTab() {
    let textarea = document.getElementById('textArea');
    let value = textarea.value;
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    textarea.value = value.substring(0, start) + this._tabChar + value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + this._tabSize;
  }

  _removeTab() {
    let textarea = document.getElementById('textArea');
    let curPos = textarea.selectionStart;
    let lines = textarea.value.split('\n');
    let newValue = '';
    let done = false;
    let cnt = 0;

    for (let i = 0, l = lines.length; i < l; i++) {
      // iterating through each line
      let line = lines[i];
      cnt += line.length;
      if (cnt >= curPos && !done) {
        // cursor is in this line
        let newLine = line.replace(new RegExp('^' + this._tabChar, ''), '');

        if (newLine !== line) {
          // there was a tab at the beginning of the line, replace was successful, cursor must be moved backwards some
          line = newLine;
          curPos -= this._tabSize;
        }

        done = true; // only one substitution per run
      }

      newValue += line + '\n';
    }

    // setting new value
    textarea.value = newValue;

    // putting cursor back to its original position
    textarea.selectionStart = textarea.selectionEnd = curPos;
  }

  static async deleteScriptCode_async(scriptId) {
    await browser.storage.local.remove(_scriptCodeKey + scriptId);
  }
}
