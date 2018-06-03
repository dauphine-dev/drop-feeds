/*global browser BrowserManager CssManager DateTime ScriptsEditor LocalStorageManager*/
const _scriptObjKey = 'scriptObj-';
const _scriptListKey = 'scriptList';
const _scriptType = {
  feedTransformer: 0,
  virtualFeed: 1
};

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
      name: 'New script',
      enabled: true,
      type: _scriptType.feedTransformer,
      lastEdit: Date.now()
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
    let newScriptEntry =  document.getElementById('scriptTemplate').cloneNode(true);
    newScriptEntry.setAttribute('id', scriptObj.id);
    newScriptEntry.style.display = 'block';
    newScriptEntry.querySelector('.scriptName').textContent = scriptObj.name;
    ScriptsManager._setEnDisScriptButtonClass(newScriptEntry, scriptObj.enabled);
    newScriptEntry.querySelector('.lastEdit').setAttribute('lastEdit', scriptObj.lastEdit);
    newScriptEntry.querySelector('.lastEdit').textContent = DateTime.getDateDiff(Date.now(), scriptObj.lastEdit);
    newScriptEntry.querySelector('.scriptTypeSelect').options[scriptObj.type].selected = true;

    document.getElementById('scriptList').appendChild(newScriptEntry);

    newScriptEntry.querySelector('.scriptName').addEventListener('keydown', ScriptsManager._scriptNameDivKeydown_event);
    newScriptEntry.querySelector('.scriptName').addEventListener('focus', ScriptsManager._scriptNameDivFocus_event);
    newScriptEntry.querySelector('.scriptName').addEventListener('blur', ScriptsManager._scriptNameDivBlur_event);
    newScriptEntry.querySelector('.editScriptButton').addEventListener('click', ScriptsManager._editScriptButtonClicked_event);
    newScriptEntry.querySelector('.enDisScriptButton').addEventListener('click', ScriptsManager._enDisScriptButtonClicked_event);
    newScriptEntry.querySelector('.scriptTypeSelect').addEventListener('change', ScriptsManager._scriptTypeChanged_event);
    newScriptEntry.querySelector('.deleteScriptButton').addEventListener('click', ScriptsManager._deleteScriptButtonClicked_event);
    return newScriptEntry;
  }

  static _setEnDisScriptButtonClass(scriptEntry, isEnabled) {
    let enDisScriptButton = scriptEntry.querySelector('.enDisScriptButton');
    if (isEnabled) {
      CssManager.enableElement(scriptEntry);
      enDisScriptButton.classList.remove('disabledScriptButton');
      enDisScriptButton.classList.add('enabledScriptButton');
    }
    else {
      CssManager.disableElement(scriptEntry);
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

  static async _scriptNameDivFocus_event(event) {
    BrowserManager.selectAllText(event.target);
  }

  static async _scriptNameDivBlur_event(event) {
    window.getSelection().removeAllRanges();
    let currentScriptEntry = event.target.parentNode.parentNode;
    let scriptName = event.target.textContent;
    ScriptsManager._updateScriptObj_async(currentScriptEntry, 'name', scriptName);

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
    let enabled = await ScriptsManager._updateScriptObj_async(currentScriptEntry, 'enabled', null, true);
    ScriptsManager._setEnDisScriptButtonClass(currentScriptEntry, enabled);
  }

  static async _updateScriptObj_async(scriptEntry, propertyName, value, toggle) {
    let scriptId = parseInt(scriptEntry.getAttribute('id'));
    let scriptObj = await LocalStorageManager.getValue_async(_scriptObjKey + scriptId, null);
    if (scriptObj) {
      if (toggle) {
        value = !scriptObj[propertyName];
      }
      scriptObj[propertyName] = value;
      await LocalStorageManager.setValue_async(_scriptObjKey + scriptId, scriptObj);
    }
    return value;
  }

  static async _scriptTypeChanged_event(event) {
    let currentScriptEntry = event.target.parentNode.parentNode.parentNode;
    let type = event.target.selectedIndex;
    ScriptsManager._updateScriptObj_async(currentScriptEntry, 'type', type);
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
