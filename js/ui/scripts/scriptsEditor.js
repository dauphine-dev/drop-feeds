/*global browser ScriptsManager LocalStorageManager Editor BrowserManager*/
/*global scriptCodeKey scriptObjKey scriptType*/
'use strict';
const _jsHighlighterPath = 'resources/highlighters/javascript.json';
class ScriptsEditor { /*exported ScriptsEditor */
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this.scriptId = null;
    this._shiftPressed = false;
    this._ctrlPressed = false;
    this._tabSize = 4;
    this._tabChar = ' '.repeat(this._tabSize);
    this._jsEditor = null;
    document.getElementById('saveButton').addEventListener('click', (e) => { this._saveButtonClicked_event(e); });
    document.getElementById('closeButton').addEventListener('click', (e) => { this._closeButtonClicked_event(e); });
    this._loadEditorScripts();
    window.onload = ((e) => { this._windowOnLoad_event(e); });
  }

  async init_async() {
  }

  _loadEditorScripts() {
    BrowserManager.appendScript('/js/tools/syntaxHighlighter.js', typeof SyntaxHighlighter);
    BrowserManager.appendScript('/js/components/editorMenu.js', typeof EditorMenu);
    BrowserManager.appendScript('/js/components/editor.js', typeof Editor);
  }

  async _windowOnLoad_event() {
    this._jsEditor = new Editor(_jsHighlighterPath);
    await this._jsEditor.init_async();
    this._jsEditor.attach(document.getElementById('editor'));
  }

  async display_async(scriptId) {
    this.scriptId = scriptId;
    await this._loadScript_async(scriptId);
    document.getElementById('scriptManager').style.display = 'none';
    document.getElementById('scriptEditor').style.display = 'block';
    document.getElementById('titlePage').textContent = 'Script editor';
  }

  async _loadScript_async(scriptId) {
    const defaultCode = '// Type your javascript here';
    let scriptCode = await LocalStorageManager.getValue_async(scriptCodeKey + this.scriptId, defaultCode);
    await this._jsEditor.setText_async(scriptCode);

    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + scriptId, null);
    document.getElementById('urlMatch').value = await ScriptsManager.instance.loadUrlMatch_async(this.scriptId);
    document.getElementById('urlMatchSettings').style.display = (scriptObj.type == scriptType.feedTransformer ? '' : 'none');
  }

  async _saveButtonClicked_event() {
    let scriptCode = this._jsEditor.getText();
    await LocalStorageManager.setValue_async(scriptCodeKey + this.scriptId, scriptCode);

    let urlMatch = document.getElementById('urlMatch').value;
    await ScriptsManager.instance.saveUrlMatch_async(this.scriptId, urlMatch);
  }

  async _closeButtonClicked_event() {
    ScriptsManager.instance.display();
  }

  async deleteScriptCode_async(scriptId) {
    await browser.storage.local.remove(scriptCodeKey + scriptId);
  }
}
