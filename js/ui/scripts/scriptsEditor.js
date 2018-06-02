/*global ScriptsManager LocalStorageManager*/
'use strict';
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
    let scriptCode = await LocalStorageManager.getValue_async('script-' + this._scriptId);
    let textArea = document.getElementById('textArea');
    if (!scriptCode) {
      scriptCode = textArea.getAttribute('defaultvalue');
    }
    textArea.value = scriptCode;
  }

  static async _saveButtonClicked_event() {
    let self = ScriptsEditor.instance;
    let scriptCode = document.getElementById('textArea').value;
    LocalStorageManager.setValue_async('script-' + self._scriptId, scriptCode);
  }

  static async _closeButtonClicked_event() {
    ScriptsManager.instance.display();
  }

}
