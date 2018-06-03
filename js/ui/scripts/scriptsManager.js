/*global browser ScriptsEditor LocalStorageManager*/
const _scriptObjKey = 'scriptObj-';
const _scriptListKey = 'scriptList';

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
//await browser.storage.local.remove('aaaa');

    this._loadScriptList_async();
    this.display();
  }

  newScriptObj() {
    let scriptId = this._findNextScriptId();
    let newScript = {
      id: scriptId,
      enabled: true,
      created: Date.now()
    };
    return newScript;
  }

  display() {
    document.getElementById('scriptEditor').style.display = 'none';
    document.getElementById('scriptManager').style.display = 'block';
    document.getElementById('titlePage').textContent = 'Script manager';
  }

  async _loadScriptList_async() {
    this._scriptList = await LocalStorageManager.getValue_async(_scriptListKey, this._scriptList);
    for(let scriptId of this._scriptList) {
      let scriptObj = await LocalStorageManager.getValue_async(_scriptObjKey + scriptId, null);
      if (scriptObj) {
        ScriptsManager._createScriptHtmlNode(scriptObj);
      }
    }
  }

  static _createScriptHtmlNode(scriptObj) {
    let newScriptNode =  document.getElementById('scriptTemplate').cloneNode(true);
    newScriptNode.setAttribute('id', scriptObj.id);
    newScriptNode.style.display = 'block';
    ScriptsManager._setEnDisScriptButtonClass(newScriptNode.querySelector('.enDisScriptButton'), scriptObj.enabled);
    newScriptNode.querySelector('.lastEdit').setAttribute('created', scriptObj.created);
    document.getElementById('scriptList').appendChild(newScriptNode);

    newScriptNode.querySelector('.scriptName').addEventListener('keydown', ScriptsManager._scriptNameDivKeydown_event);
    newScriptNode.querySelector('.editScriptButton').addEventListener('click', ScriptsManager._editScriptButtonClicked_event);
    newScriptNode.querySelector('.enDisScriptButton').addEventListener('click', ScriptsManager._enDisScriptButtonClicked_event);
    newScriptNode.querySelector('.infoScriptButton').addEventListener('click', ScriptsManager._infoScriptButtonClicked_event);
    newScriptNode.querySelector('.deleteScriptButton').addEventListener('click', ScriptsManager._deleteScriptButtonClicked_event);
    return newScriptNode;
  }

  static _setEnDisScriptButtonClass(enDisScriptButton, isEnabled) {
    if (isEnabled) {
      enDisScriptButton.classList.remove('disabledScriptButton');
      enDisScriptButton.classList.add('enabledScriptButton');
    }
    else {
      enDisScriptButton.classList.remove('enabledScriptButton');
      enDisScriptButton.classList.add('disabledScriptButton');
    }
  }
  static async _createNewScriptClicked_event() {
    let self = ScriptsManager.instance;
    let newScriptObj = self.newScriptObj();
    ScriptsManager._createScriptHtmlNode(newScriptObj);
    self._scriptList.push(newScriptObj.id);
    await LocalStorageManager.setValue_async(_scriptListKey, self._scriptList);
    await LocalStorageManager.setValue_async(_scriptObjKey + newScriptObj.id, newScriptObj);
  }


  _findNextScriptId() {
    let newId = null;
    if (this._scriptList.length > 0) {
      let scriptList = this._scriptList.slice();
      scriptList = scriptList.sort((a, b) => a - b);
      let maxValue = Math.max(...scriptList) + 1;
      for(let i=1;i<=maxValue;i++)
      {
        if(scriptList[i-1] != i){
          newId = i;
          break;
        }
      }
    }
    if (!newId) { newId = 1; }
    return newId;
  }

  static async _scriptNameDivKeydown_event(event) {
    let self = ScriptsManager.instance;
    if (event.key === 'Enter') {
      event.preventDefault();
      let currentScriptEntry = event.target.parentNode.parentNode;
      self._goToNextScriptEntry(currentScriptEntry);
      return false;

    }
    return true;
  }

  _goToNextScriptEntry(currentScriptEntry) {
    let nextScriptEntry = currentScriptEntry.nextSibling;
    if (nextScriptEntry) {
      nextScriptEntry.querySelector('.scriptName').focus();
    }
    else {
      let scriptEntries = currentScriptEntry.parentNode.querySelectorAll('.scriptEntry');
      if (scriptEntries && scriptEntries[1]) {
        scriptEntries[1].querySelector('.scriptName').focus();
      }
    }
  }

  static async _editScriptButtonClicked_event(event) {
    let scriptId = event.target.parentNode.parentNode.parentNode.getAttribute('id');
    ScriptsEditor.instance.display_async(scriptId);
  }

  static async _enDisScriptButtonClicked_event(event) {
    let currentScriptEntry = event.target.parentNode.parentNode.parentNode;
    let scriptId = parseInt(currentScriptEntry.getAttribute('id'));
    let scriptObj = await LocalStorageManager.getValue_async(_scriptObjKey + scriptId, null);
    if (scriptObj) {
      scriptObj.enabled = !scriptObj.enabled;
      ScriptsManager._setEnDisScriptButtonClass(event.target);
      await LocalStorageManager.setValue_async(_scriptObjKey + scriptId, scriptObj);
    }
  }

  static async _infoScriptButtonClicked_event() {
  }

  static async _deleteScriptButtonClicked_event(event) {
    let self = ScriptsManager.instance;
    //Remove html node
    let currentScriptEntry = event.target.parentNode.parentNode;
    let scriptId = parseInt(currentScriptEntry.getAttribute('id'));
    currentScriptEntry.parentNode.removeChild(currentScriptEntry);
    //Remove script from script list
    let scriptIdIndex = self._scriptList.indexOf(scriptId);
    if (scriptIdIndex > -1) {
      self._scriptList.splice(scriptIdIndex, 1);
    }
    //Update script list in local storage
    await LocalStorageManager.setValue_async(_scriptListKey, self._scriptList);
    //Remove script obj from local storage
    await browser.storage.local.remove(_scriptObjKey + scriptId);
    //Remove script code from local storage
    ScriptsEditor.deleteScriptCode_async(scriptId);
  }
}
