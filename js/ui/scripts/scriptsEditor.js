/*global ScriptsManager*/
'use strict';
class ScriptsEditor { /*exported ScriptsEditor */
  static get instance() {
    if (!this._instance) {
      this._instance = new ScriptsEditor();
    }
    return this._instance;
  }

  constructor() {
    document.getElementById('saveButton').addEventListener('click', ScriptsEditor._saveButtonClicked_event);
    document.getElementById('closeButton').addEventListener('click', ScriptsEditor._closeButtonClicked_event);
  }
  async init_async() {
  }

  display() {
    document.getElementById('scriptManager').style.display = 'none';
    document.getElementById('scriptEditor').style.display = 'block';
    document.getElementById('titlePage').textContent = 'Script editor';
  }

  static async _saveButtonClicked_event() {

  }

  static async _closeButtonClicked_event() {
    ScriptsManager.instance.display();
  }

}
