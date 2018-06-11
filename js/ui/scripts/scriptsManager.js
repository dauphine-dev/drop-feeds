/*global browser BrowserManager CssManager DateTime ScriptsEditor LocalStorageManager DefaultValues Dialogs*/
/*global scriptObjKey scriptListKey scriptType*/
'use strict';

class ScriptsManager { /* exported ScriptsManager */
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._scriptList = [];
    document.getElementById('createNewScript').addEventListener('click', (e) => { this._createNewScriptClicked_event(e); });
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

  newScriptObj() {
    let scriptId = this._findNextScriptId();
    let newScript = {
      id: scriptId,
      name: DefaultValues.userScriptName + ' ' + scriptId,
      enabled: true,
      type: scriptType.feedTransformer,
      urlMatch: DefaultValues.userScriptUrlMatch,
      urlRegEx: ScriptsManager._matchPatternToRegExp(DefaultValues.userScriptUrlMatch),
      virtualUrl: browser.extension.getURL('dropfeeds://' + scriptId),

      lastEdit: Date.now()
    };
    return newScript;
  }

  updateInfo(scriptId, infoClassName, infoValue) {
    let scriptEntry = document.getElementById(scriptId);
    scriptEntry.querySelector(infoClassName).textContent = infoValue;
  }

  _findNextScriptId() {
    let newId = null;
    if (this._scriptList.length > 0) {
      let scriptList = this._scriptList.slice();
      scriptList = scriptList.sort((a, b) => a - b);
      let maxValue = Math.max(...scriptList) + 1;
      for (let i = 1; i <= maxValue; i++) {
        if (scriptList[i - 1] != i) {
          newId = i;
          break;
        }
      }
    }
    if (!newId) { newId = 1; }
    return newId;
  }

  async _loadScriptList_async() {
    this._scriptList = await LocalStorageManager.getValue_async(scriptListKey, this._scriptList);
    for (let scriptId of this._scriptList) {
      let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + scriptId, null);
      if (scriptObj) {
        this._createScriptHtmlNode(scriptObj);
      }
    }
  }

  _createScriptHtmlNode(scriptObj) {
    let newScriptEntry = document.getElementById('scriptTemplate').cloneNode(true);
    newScriptEntry.setAttribute('id', scriptObj.id);
    newScriptEntry.style.display = 'block';
    newScriptEntry.querySelector('.scriptName').textContent = scriptObj.name;
    this._setEnDisScriptButtonClass(newScriptEntry, scriptObj.enabled);
    newScriptEntry.querySelector('.urlMatchPatterns').textContent = scriptObj.urlMatch;
    newScriptEntry.querySelector('.urlMatchPatterns').style.display = (scriptObj.type == scriptType.feedTransformer ? 'inline-block' : 'none');
    newScriptEntry.querySelector('.subscribeScriptButton').style.display = (scriptObj.type == scriptType.virtualFeed ? 'inline-block' : 'none');
    newScriptEntry.querySelector('.lastEdit').setAttribute('lastEdit', scriptObj.lastEdit);
    newScriptEntry.querySelector('.lastEdit').textContent = DateTime.getDateDiff(Date.now(), scriptObj.lastEdit);
    newScriptEntry.querySelector('.scriptTypeSelect').options[scriptObj.type].selected = true;

    document.getElementById('scriptList').appendChild(newScriptEntry);

    newScriptEntry.querySelector('.scriptName').addEventListener('keydown', (e) => { this._scriptNameDivKeydown_event(e); });
    newScriptEntry.querySelector('.scriptName').addEventListener('focus', (e) => { this._scriptNameDivFocus_event(e); });
    newScriptEntry.querySelector('.scriptName').addEventListener('blur', (e) => { this._scriptNameDivBlur_event(e); });
    newScriptEntry.querySelector('.editScriptButton').addEventListener('click', (e) => { this._editScriptButtonClicked_event(e); });
    newScriptEntry.querySelector('.enDisScriptButton').addEventListener('click', (e) => { this._enDisScriptButtonClicked_event(e); });
    newScriptEntry.querySelector('.scriptTypeSelect').addEventListener('change', (e) => { this._scriptTypeChanged_event(e); });
    newScriptEntry.querySelector('.subscribeScriptButton').addEventListener('click', (e) => { this._subscribeScriptButton_event(e); });
    newScriptEntry.querySelector('.deleteScriptButton').addEventListener('click', (e) => { this._deleteScriptButtonClicked_event(e); });
    return newScriptEntry;
  }

  _setEnDisScriptButtonClass(scriptEntry, isEnabled) {
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

  async _createNewScriptClicked_event() {
    let scriptObj = this.newScriptObj();
    this._createScriptHtmlNode(scriptObj);
    this._scriptList.push(scriptObj.id);
    await LocalStorageManager.setValue_async(scriptListKey, this._scriptList);
    await LocalStorageManager.setValue_async(scriptObjKey + scriptObj.id, scriptObj);
  }

  async _scriptNameDivKeydown_event(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      let currentScriptEntry = event.target.parentNode.parentNode;
      this._goToNextScriptEntry(currentScriptEntry);
      return false;

    }
    return true;
  }

  async _scriptNameDivFocus_event(event) {
    BrowserManager.selectAllText(event.target);
  }

  async _scriptNameDivBlur_event(event) {
    window.getSelection().removeAllRanges();
    let currentScriptEntry = event.target.parentNode.parentNode;
    let scriptName = event.target.textContent;
    this._updateScriptObj_async(currentScriptEntry, 'name', scriptName);

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

  async _editScriptButtonClicked_event(event) {
    let scriptId = event.target.parentNode.parentNode.parentNode.getAttribute('id');
    ScriptsEditor.instance.display_async(scriptId);
  }

  async _enDisScriptButtonClicked_event(event) {
    let currentScriptEntry = event.target.parentNode.parentNode.parentNode;
    let enabled = await this._updateScriptObj_async(currentScriptEntry, 'enabled', null, true);
    this._setEnDisScriptButtonClass(currentScriptEntry, enabled);
  }

  async _updateScriptObj_async(scriptEntry, propertyName, value, toggle) {
    let scriptId = parseInt(scriptEntry.getAttribute('id'));
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + scriptId, null);
    if (scriptObj) {
      if (toggle) {
        value = !scriptObj[propertyName];
      }
      scriptObj[propertyName] = value;
      await LocalStorageManager.setValue_async(scriptObjKey + scriptId, scriptObj);
    }
    return value;
  }

  _scriptTypeChanged_event(event) {
    let currentScriptEntry = event.target.parentNode.parentNode.parentNode;
    let type = event.target.selectedIndex;
    this._updateScriptObj_async(currentScriptEntry, 'type', type);
    currentScriptEntry.querySelector('.urlMatchPatterns').style.display = (type == scriptType.feedTransformer ? 'inline-block' : 'none');
    currentScriptEntry.querySelector('.subscribeScriptButton').style.display = (type == scriptType.virtualFeed ? 'inline-block' : 'none');
  }

  async _subscribeScriptButton_event(event) {
    let currentScriptEntry = event.target.parentNode.parentNode.parentNode;
    let scriptId = parseInt(currentScriptEntry.getAttribute('id'));
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + scriptId, null);
    if (scriptObj) {
      await LocalStorageManager.setValue_async('subscribeInfo', { feedTitle: scriptObj.name, feedUrl: scriptObj.virtualUrl });
      await BrowserManager.openPopup_async(Dialogs.subscribeUrl, 778, 500, '');
    }
  }

  async _deleteScriptButtonClicked_event(event) {
    //Remove html node
    let currentScriptEntry = event.target.parentNode.parentNode;
    let scriptId = parseInt(currentScriptEntry.getAttribute('id'));
    currentScriptEntry.parentNode.removeChild(currentScriptEntry);
    //Remove script from script list
    let scriptIdIndex = this._scriptList.indexOf(scriptId);
    if (scriptIdIndex > -1) {
      this._scriptList.splice(scriptIdIndex, 1);
    }
    //Update script list in local storage
    await LocalStorageManager.setValue_async(scriptListKey, this._scriptList);
    //Remove script obj from local storage
    await browser.storage.local.remove(scriptObjKey + scriptId);
    //Remove script code from local storage
    ScriptsEditor.instance.deleteScriptCode_async(scriptId);
  }
}
