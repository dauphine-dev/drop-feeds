/*global browser ScriptsManager LocalStorageManager Editor*/
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
    this._jsHighlighter = null;
    document.getElementById('saveButton').addEventListener('click', (e) => { this._saveButtonClicked_event(e); });
    document.getElementById('closeButton').addEventListener('click', (e) => { this._closeButtonClicked_event(e); });
  }
  async init_async() {
    this._jsEditor = new Editor('resources/highlighters/javascript.json');
    await this._jsEditor.init_async();
  }

  async display_async(scriptId) {
    this._scriptId = scriptId;
    await this._loadScript_async();
    document.getElementById('scriptManager').style.display = 'none';
    document.getElementById('scriptEditor').style.display = 'block';
    document.getElementById('titlePage').textContent = 'Script editor';
  }

  async _loadScript_async() {
    const defaultCode = '// Type your javascript here';
    let scriptCode = await LocalStorageManager.getValue_async(_scriptCodeKey + this._scriptId, defaultCode);
    await this._jsEditor.setText_async(scriptCode);

    document.getElementById('urlMatch').value = await ScriptsManager.loadUrlMatch_async(this._scriptId);
  }

  async _saveButtonClicked_event() {
    let scriptCode = this._jsEditor.getText();
    await LocalStorageManager.setValue_async(_scriptCodeKey + this._scriptId, scriptCode);

    let urlMatch = document.getElementById('urlMatch').value;
    await ScriptsManager.saveUrlMatch_async(this._scriptId, urlMatch);
  }

  async _closeButtonClicked_event() {
    ScriptsManager.instance.display();
  }

  static async deleteScriptCode_async(scriptId) {
    await browser.storage.local.remove(_scriptCodeKey + scriptId);
  }
}
