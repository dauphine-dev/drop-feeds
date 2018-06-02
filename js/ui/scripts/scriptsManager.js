/*global ScriptsEditor LocalStorageManager*/
class ScriptsManager { /* exported ScriptsManager */
  static get instance() {
    if (!this._instance) {
      this._instance = new ScriptsManager();
    }
    return this._instance;
  }

  constructor() {
    this._scriptList = [];
    document.getElementById('createNewScript').addEventListener('click', ScriptsManager._createNewScriptClicked_event);
  }

  async init_async() {
    this._loadScriptList_async();
    this.display();
  }

  display() {
    document.getElementById('scriptEditor').style.display = 'none';
    document.getElementById('scriptManager').style.display = 'block';
    document.getElementById('titlePage').textContent = 'Script manager';
  }

  async _loadScriptList_async() {
    this._scriptList = await LocalStorageManager.getValue_async('scriptList');
    for(let scriptId of this._scriptList) {
      ScriptsManager._createScriptHtmlNode(scriptId);
    }
  }

  static _createScriptHtmlNode(scriptId) {
    let newScriptNode =  document.getElementById('scriptTemplate').cloneNode(true);
    newScriptNode.setAttribute('id', scriptId);
    newScriptNode.style.display = 'block';
    newScriptNode.querySelector('.scriptName').textContent = 'script ' + scriptId;
    newScriptNode.querySelector('.lastEdit').setAttribute('created', Date.now());
    document.getElementById('scriptList').appendChild(newScriptNode);
    newScriptNode.querySelector('.editScriptButton').addEventListener('click', ScriptsManager._editScriptButtonClicked_event);
    newScriptNode.querySelector('.enableScriptButton').addEventListener('click', ScriptsManager._enableScriptButtonClicked_event);
    newScriptNode.querySelector('.infoScriptButton').addEventListener('click', ScriptsManager._infoScriptButtonClicked_event);
    newScriptNode.querySelector('.deleteScriptButton').addEventListener('click', ScriptsManager._deleteScriptButtonClicked_event);
    return newScriptNode;
  }

  static async _createNewScriptClicked_event() {
    let self = ScriptsManager.instance;
    let scriptId = document.querySelectorAll('.scriptEntry').length;
    self._scriptList.push(scriptId);
    await LocalStorageManager.setValue_async('scriptList', self._scriptList);
    ScriptsManager._createScriptHtmlNode(scriptId);
  }

  static async _editScriptButtonClicked_event(event) {
    let scriptId = event.target.parentNode.parentNode.parentNode.getAttribute('id');
    ScriptsEditor.instance.display_async(scriptId);
  }

  static async _enableScriptButtonClicked_event() {
  }

  static async _infoScriptButtonClicked_event() {
  }

  static async _deleteScriptButtonClicked_event() {
  }

}
