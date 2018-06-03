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
    document.getElementById('saveButton').addEventListener('click', ScriptsEditor._saveButtonClicked_event);
    document.getElementById('closeButton').addEventListener('click', ScriptsEditor._closeButtonClicked_event);
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

  static async deleteScriptCode_async(scriptId) {
    await browser.storage.local.remove(_scriptCodeKey + scriptId);
  }
}
