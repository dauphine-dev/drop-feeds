/*global ScriptsEditor*/
class ScriptsManager { /* exported ScriptsManager */
  static get instance() {
    if (!this._instance) {
      this._instance = new ScriptsManager();
    }
    return this._instance;
  }

  constructor() {
    document.getElementById('createNewScript').addEventListener('click', ScriptsManager._createNewScriptClicked_event);
  }

  async init_async() {
  }

  display() {
    document.getElementById('scriptEditor').style.display = 'none';
    document.getElementById('scriptManager').style.display = 'block';
    document.getElementById('titlePage').textContent = 'Script manager';
  }

  static _createScriptHtmlNode(scriptId) {
    let newScriptNode =  document.getElementById('scriptTemplate').cloneNode(true);
    newScriptNode.setAttribute('id', scriptId);
    newScriptNode.style.display = 'block';
    newScriptNode.querySelector('.scriptName').textContent = 'script ' + scriptId;
    newScriptNode.querySelector('.lastEdit').setAttribute('created', Date.now());
    document.getElementById('scriptList').appendChild(newScriptNode);
    return newScriptNode;
  }

  static _scriptId() {
    //Fake id for the develop time. The real Id will come from storage API (I guess)
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    //return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    return s4();
  }

  static async _createNewScriptClicked_event() {
    let scriptId = ScriptsManager._scriptId();
    let newScriptNode = ScriptsManager._createScriptHtmlNode(scriptId);
    newScriptNode.querySelector('.editScriptButton').addEventListener('click', ScriptsManager._editScriptButtonClicked_event);
    newScriptNode.querySelector('.enableScriptButton').addEventListener('click', ScriptsManager._enableScriptButtonClicked_event);
    newScriptNode.querySelector('.infoScriptButton').addEventListener('click', ScriptsManager._infoScriptButtonClicked_event);
    newScriptNode.querySelector('.deleteScriptButton').addEventListener('click', ScriptsManager._deleteScriptButtonClicked_event);
  }


  static async _editScriptButtonClicked_event() {
    ScriptsEditor.instance.display();
  }

  static async _enableScriptButtonClicked_event() {
  }

  static async _infoScriptButtonClicked_event() {
  }

  static async _deleteScriptButtonClicked_event() {
  }

}
