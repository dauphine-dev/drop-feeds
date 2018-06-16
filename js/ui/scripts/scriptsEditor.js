/*global browser ScriptsManager LocalStorageManager Editor BrowserManager Dialogs Feed DefaultValues EditorConsole*/
/*global scriptCodeKey scriptObjKey scriptType*/
'use strict';
const _matchPattern = (/^(?:(\*|http|https|file|ftp|app):\/\/(\*|(?:\*\.)?[^/*]+|)\/(.*))$/i);
const _jsHighlighterPath = 'resources/highlighters/javascript.json';
class ScriptsEditor { /*exported ScriptsEditor */
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._scriptId = null;
    this._shiftPressed = false;
    this._ctrlPressed = false;
    this._tabSize = 4;
    this._tabChar = ' '.repeat(this._tabSize);
    this._jsEditor = null;
    this._isResizing = false;
    this._lastDownX = 0;
    document.getElementById('saveButton').addEventListener('click', (e) => { this._saveButtonClicked_event(e); });
    document.getElementById('closeButton').addEventListener('click', (e) => { this._closeButtonClicked_event(e); });
    document.getElementById('saveAndCloseButton').addEventListener('click', (e) => { this._saveAndCloseButtonClicked_event(e); });
    document.getElementById('virtualSubscribeScriptButton').addEventListener('click', (e) => { this._virtualSubscribeScriptButton_event(e); });
    document.getElementById('feedTransformerTestScriptButton').addEventListener('click', (e) => { this._feedTransformerTestScriptButton_event(e); });
    document.getElementById('virtualTestScriptButton').addEventListener('click', (e) => { this._virtualTestScriptButton_event(e); });

    document.addEventListener('mousemove', (e) => { this._resizeBarMousemove_event(e); });
    document.addEventListener('mouseup', (e) => { this._resizeBarMouseup_event(e); });
    document.getElementById('resizeBar').addEventListener('mousedown', (e) => { this._resizeBarMousedown_event(e); });

    this._loadEditorScripts();
    window.onload = ((e) => { this._windowOnLoad_event(e); });
  }

  async init_async() {
  }

  async display_async(scriptId) {
    this._scriptId = scriptId;
    await this._loadScript_async(scriptId);
    ScriptsManager.instance.hide();
    document.getElementById('editorRowBox').style.display = 'table-row';
    document.getElementById('fieldsetEditorBox').style.display = 'block';
    document.getElementById('logoTitle').textContent = 'Script editor';
    this._jsEditor.update();
  }

  hide() {
    document.getElementById('editorRowBox').style.display = 'none';
    document.getElementById('fieldsetEditorBox').style.display = 'none';
  }

  async deleteScriptCode_async(scriptId) {
    await browser.storage.local.remove(scriptCodeKey + scriptId);
  }

  _loadEditorScripts() {
    BrowserManager.appendScript('/js/tools/syntaxHighlighter.js', typeof SyntaxHighlighter);
    BrowserManager.appendScript('/js/components/editorMenu.js', typeof EditorMenu);
    BrowserManager.appendScript('/js/components/editor.js', typeof Editor);
  }

  async _windowOnLoad_event() {
    this._jsEditor = new Editor(_jsHighlighterPath, () => { this.save_async(); });
    await this._jsEditor.init_async();
    this._jsEditor.attachEditor(document.getElementById('editor'));
    this._jsEditor.attachMenu(document.getElementById('fieldsetEditorBox'));
  }

  async _loadScript_async(scriptId) {
    const defaultCode = '// Type your javascript here';
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + scriptId, null);
    let scriptCode = await LocalStorageManager.getValue_async(scriptCodeKey + scriptId, defaultCode);
    await this._jsEditor.setText_async(scriptCode);
    await this._jsEditor.console.clear();
    document.getElementById('fieldsetFeedTransformer').style.display = (scriptObj.type == scriptType.feedTransformer ? '' : 'none');
    document.getElementById('fieldsetFeedTransformerHelp').style.display = (scriptObj.type == scriptType.feedTransformer ? '' : 'none');
    document.getElementById('urlMatch').value = scriptObj ? scriptObj.urlMatch : DefaultValues.urlMatch;

    document.getElementById('fieldsetVirtualFeed').style.display = (scriptObj.type == scriptType.virtualFeed ? '' : 'none');
    document.getElementById('fieldsetVirtualFeedHelp').style.display = (scriptObj.type == scriptType.virtualFeed ? '' : 'none');
    document.getElementById('testUrl').value = scriptObj ? (scriptObj.testUrl || '') : '';
  }

  async _saveButtonClicked_event() {
    this.save_async();
  }

  async save_async() {
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + this._scriptId, null);
    let urlMatch = document.getElementById('urlMatch').value;
    scriptObj.urlMatch = urlMatch;
    ScriptsManager.instance.updateInfo(this._scriptId, '.urlMatchPatterns', urlMatch);
    scriptObj.urlRegEx = this.matchPatternToRegExp(urlMatch);
    scriptObj.testUrl = document.getElementById('testUrl').value;
    LocalStorageManager.setValue_async(scriptObjKey + this._scriptId, scriptObj);

    let scriptCode = this._jsEditor.getText();
    await LocalStorageManager.setValue_async(scriptCodeKey + this._scriptId, scriptCode);
  }


  matchPatternToRegExp(pattern) {
    //Code from https://developer.mozilla.org/fr/Add-ons/WebExtensions/Match_patterns
    pattern = pattern.trim();
    if (pattern === '<all_urls>') {
      return (/^(?:https?|file|ftp|app):\/\//);
    }
    const match = _matchPattern.exec(pattern);
    if (!match || pattern === '<none>') {
      return null;
    }
    const [, scheme, host, path,] = match;

    let regExpMatchPattern = new RegExp('^(?:'
      + (scheme === '*' ? 'https?' : escape(scheme)) + '://'
      + (host === '*' ? '[^/]+?' : escape(host).replace(/^\*\./g, '(?:[^/]+?.)?'))
      + (path ? '/' + escape(path).replace(/\*/g, '.*') : '/?')
      + ')$');
    return regExpMatchPattern;
  }

  async _saveAndCloseButtonClicked_event() {
    await this.save_async();
    this._close();
  }

  async _closeButtonClicked_event() {
    this._close();
  }

  _close() {
    ScriptsManager.instance.display();
  }

  async _feedTransformerTestScriptButton_event() {
    await this.save_async();
    let feedTestUrl = document.getElementById('testUrl').value;
    await this.displayUrlMatchToConsole_async(feedTestUrl);
    this._TestScript_async(feedTestUrl);
  }

  async displayUrlMatchToConsole_async(url) {
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + this._scriptId, null);
    let isUrlMatch = Boolean(url.match(scriptObj.urlRegEx) || url == scriptObj.urlMatch);
    this._jsEditor.console.writeLine('url matches to pattern: ' + (isUrlMatch ? 'yes' : 'no'), isUrlMatch ? EditorConsole.messageType.ok : EditorConsole.messageType.error);
  }

  async _virtualTestScriptButton_event() {
    await this.save_async();
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + this._scriptId, null);
    if (scriptObj) {
      this._TestScript_async(scriptObj.virtualUrl);
    }
  }

  async _resizeBarMouseup_event() {
    this._isResizing = false;
  }

  async _resizeBarMousedown_event(event) {
    this._isResizing = true;
    this._lastDownX = event.clientX;
  }

  async _resizeBarMousemove_event(event) {
    if (!this._isResizing) { return; }
    let delta = this._lastDownX - event.clientX;
    this._lastDownX = event.clientX;

    let leftBox = document.getElementById('leftBox');
    leftBox.style.width = Math.max(leftBox.clientWidth - delta, 0) + 'px';
    //console.log('delta:', delta, ' clientWidth:', leftBox.clientWidth);
  }


  async _TestScript_async(feedTestUrl) {
    let feed = await Feed.newByUrl(feedTestUrl);

    let scriptCallbacks = { executed: (v) => { this._onScriptExecuted(v); }, error: (e) => { this._onScriptError(e); } };
    await feed.update_async(scriptCallbacks);
    let displayItemsValue = { itemsTitle: feed.title, titleLink: feed.url, items: feed.info.itemList };
    await browser.runtime.sendMessage({ key: 'displayItems', value: displayItemsValue });
    let openNewTabForce = false, openNewTabBackGroundForce = true;
    BrowserManager.instance.openTab_async(feed.docUrl, openNewTabForce, openNewTabBackGroundForce);
  }

  _onScriptExecuted() {
    this._jsEditor.console.writeLine('script executed.');
  }

  _onScriptError(e) {
    this._writeErrorToConsole(e);
  }

  _writeErrorToConsole(e) {
    let errorText = '(' + Math.max(e.lineNumber - 2, 0) + ', ' + e.columnNumber + ') ' + e.toString();
    this._jsEditor.console.writeLine(errorText, EditorConsole.messageType.error);
  }

  async _virtualSubscribeScriptButton_event() {
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + this._scriptId, null);
    if (scriptObj) {
      await LocalStorageManager.setValue_async('subscribeInfo', { feedTitle: scriptObj.name, feedUrl: scriptObj.virtualUrl });
      await BrowserManager.openPopup_async(Dialogs.subscribeUrl, 778, 500, '');
    }
  }

}
