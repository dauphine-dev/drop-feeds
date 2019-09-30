/*global browser UserScriptsManager LocalStorageManager Editor BrowserManager Dialogs Feed DefaultValues TextConsole*/
/*global scriptCodeKey scriptObjKey scriptType SecurityFilters Listener ListenerProviders ThemeManager*/
'use strict';
const _matchPattern = (/^(?:(\*|http|https|file|ftp|app):\/\/(\*|(?:\*\.)?[^/*]+|)\/(.*))$/i);
const _jsHighlighterPath = 'resources/highlighters/javascript.json';

class UserScriptsEditor { /*exported UserScriptsEditor */
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._scriptId = null;
    this._shiftPressed = false;
    this._ctrlPressed = false;
    this._jsEditor = null;
    this._isResizing = false;
    this._lastDownX = 0;
    this._updateLocalizedStrings();
    SecurityFilters.instance;
    BrowserManager.instance.init_async();
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
    this._highLightCssUrl = undefined;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'scriptEditorThemeFolderName', (v) => { this._setScriptEditorThemeFolderName_sbscrb(v); }, true);
    //window.addEventListener('load', (e) => { this._windowOnLoad_event(e); });  // Doesn't work any more, then...
    //...use this workaround.
    setTimeout(() => { this._windowOnLoad_event(); }, 1000);
  }

  async display_async(scriptId) {
    this._scriptId = scriptId;
    UserScriptsManager.instance.hide();
    document.getElementById('editorRowBox').style.display = 'table-row';
    Array.from(document.getElementById('fieldsetEditorBox').querySelectorAll('.editorMenu')).map(el => el.style.display = 'block');
    document.getElementById('logoTitle').textContent = 'Script editor';
    await this._loadScript_async(scriptId);
    this._jsEditor.update();
  }

  hide() {
    document.getElementById('editorRowBox').style.display = 'none';
    Array.from(document.getElementById('fieldsetEditorBox').querySelectorAll('.editorMenu')).map(el => el.style.display = 'none');
    document.getElementById('fieldsetFeedTransformerHelp').style.display = '';
    document.getElementById('fieldsetVirtualFeedHelp').style.display = '';
  }

  async deleteScriptCode_async(scriptId) {
    await browser.storage.local.remove(scriptCodeKey + scriptId);
  }

  get editorConsole() {
    return this._jsEditor.editorConsole;
  }

  _updateLocalizedStrings() {
    document.getElementById('commandsLegend').textContent = browser.i18n.getMessage('usUScriptCommands');
    document.getElementById('saveButton').textContent = browser.i18n.getMessage('usUScriptSave');
    document.getElementById('closeButton').textContent = browser.i18n.getMessage('usUScriptClose');
    document.getElementById('saveAndCloseButton').textContent = browser.i18n.getMessage('usUScriptSaveAndClose');

    document.getElementById('feedTransformerLegend').textContent = browser.i18n.getMessage('usUScriptFeedTransformer');
    document.getElementById('urlMatchLabel').textContent = browser.i18n.getMessage('usUScriptUrlMatchPatterns');
    document.getElementById('urlMatchHelp').textContent = browser.i18n.getMessage('usUScriptUrlMatchPatternsHelp');
    document.getElementById('testUrlLabel').textContent = browser.i18n.getMessage('usUScriptTestFeedUrl');
    document.getElementById('feedTransformerTestScriptButton').textContent = browser.i18n.getMessage('usUScriptSaveAndTest');

    document.getElementById('feedTransformerInfoLegend').textContent = browser.i18n.getMessage('usUScriptFtInfo');
    document.getElementById('feedTransformerInfoHelp').textContent = browser.i18n.getMessage('usUScriptHelp');
    document.getElementById('feedTransformerInfoHelp').setAttribute('href', '/help/' + BrowserManager.instance.uiLanguage + '/userScripts/feedTransformerHelp.html');
    document.getElementById('feedTransformerInfoExample').textContent = browser.i18n.getMessage('usUScriptExample');

    document.getElementById('virtualFeedLegend').textContent = browser.i18n.getMessage('usUScriptVirtualFeed');
    document.getElementById('virtualTestScriptButton').textContent = browser.i18n.getMessage('usUScriptSaveAndTest');
    document.getElementById('virtualSubscribeScriptButton').textContent = browser.i18n.getMessage('usUScriptSaveAndSubscribe');

    document.getElementById('virtualFeedInfoLegend').textContent = browser.i18n.getMessage('usUScriptVfInfo');
    document.getElementById('virtualFeedInfoHelp').textContent = browser.i18n.getMessage('usUScriptHelp');
    document.getElementById('virtualFeedInfoHelp').setAttribute('href', '/help/' + BrowserManager.instance.uiLanguage + '/userScripts/virtualFeedHelp.html');
    document.getElementById('virtualFeedInfoExample').textContent = browser.i18n.getMessage('usUScriptExample');
  }

  _loadEditorScripts() {
    BrowserManager.appendScript('/js/tools/syntaxHighlighter.js', typeof SyntaxHighlighter);
    BrowserManager.appendScript('/js/components/editorMenu.js', typeof EditorMenu);
    BrowserManager.appendScript('/js/components/textConsole.js', typeof TextConsole);
    BrowserManager.appendScript('/js/components/consoleMenu.js', typeof ConsoleMenu);
    BrowserManager.appendScript('/js/components/undoRedoTextArea.js', typeof UndoRedoTextArea);
    BrowserManager.appendScript('/js/components/editor.js', typeof Editor);
  }

  async _windowOnLoad_event() {
    this._jsEditor = new Editor(_jsHighlighterPath, this._highLightCssUrl, () => { this.save_async(); });
    await this._jsEditor.init_async();
    this._jsEditor.attach(document.getElementById('editor'));
    await this._jsEditor.attachMenu_async(document.getElementById('fieldsetEditorBox'));
    this._jsEditor.attachConsole();
    this._jsEditor.attachConsoleMenu();
  }

  async _loadScript_async(scriptId) {
    const defaultCode = '// Type your javascript here';
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + scriptId, null);
    let scriptCode = await LocalStorageManager.getValue_async(scriptCodeKey + scriptId, defaultCode);
    await this._jsEditor.setText_async(scriptCode);
    await this._jsEditor.editorConsole.clear();
    document.getElementById('fieldsetFeedTransformer').style.display = (scriptObj.type == scriptType.feedTransformer ? '' : 'none');
    document.getElementById('fieldsetFeedTransformerHelp').style.display = (scriptObj.type == scriptType.feedTransformer ? '' : 'none');
    document.getElementById('urlMatch').value = scriptObj ? scriptObj.urlMatch : DefaultValues.urlMatch;

    document.getElementById('fieldsetVirtualFeed').style.display = (scriptObj.type == scriptType.virtualFeed ? '' : 'none');
    document.getElementById('fieldsetVirtualFeedHelp').style.display = (scriptObj.type == scriptType.virtualFeed ? '' : 'none');
    document.getElementById('testUrl').value = scriptObj ? (scriptObj.testUrl || '') : '';
  }

  async _saveButtonClicked_event() {
    await this.save_async();
  }

  async save_async() {
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + this._scriptId, null);
    let urlMatch = document.getElementById('urlMatch').value;
    scriptObj.urlMatch = urlMatch;
    UserScriptsManager.instance.updateInfo(this._scriptId, '.urlMatchPatterns', urlMatch);
    scriptObj.urlRegEx = this.matchPatternToRegExp(urlMatch).source;
    scriptObj.testUrl = document.getElementById('testUrl').value;
    await LocalStorageManager.setValue_async(scriptObjKey + this._scriptId, scriptObj);

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
      return /a^/;
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
    UserScriptsManager.instance.display();
  }

  async _feedTransformerTestScriptButton_event() {
    await this.save_async();
    let feedTestUrl = document.getElementById('testUrl').value;
    await this.displayUrlMatchToConsole_async(feedTestUrl);
    await this._testScript_async(feedTestUrl);
  }

  async displayUrlMatchToConsole_async(url) {
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + this._scriptId, null);
    let isUrlMatch = Boolean(url.match(new RegExp(scriptObj.urlRegEx)) || url == scriptObj.urlMatch);
    this._jsEditor.editorConsole.writeLineEx('url matches to pattern: ' + (isUrlMatch ? 'yes' : 'no'), isUrlMatch ? TextConsole.messageType.ok : TextConsole.messageType.error);
  }

  async _virtualTestScriptButton_event() {
    await this.save_async();
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + this._scriptId, null);
    if (scriptObj) {
      await this._testScript_async(scriptObj.virtualUrl);
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
  }

  async _testScript_async(feedTestUrl) {
    let feed = await Feed.newByUrl(feedTestUrl);

    let scriptData = { id: this._scriptId, executedCallback: (v) => { this._onScriptExecuted(v); }, errorCallback: (e) => { this._onScriptError(e); } };
    await feed.update_async(scriptData);
    let displayItemsValue = { itemsTitle: feed.title, titleLink: feed.url, items: (await feed.getInfo_async()).itemList };
    await browser.runtime.sendMessage({ key: 'displayItems', value: displayItemsValue });
    let openNewTabForce = false, openNewTabBackGroundForce = true;
    BrowserManager.instance.openTab_async(await feed.getDocUrl_async(), openNewTabForce, openNewTabBackGroundForce);
  }

  _onScriptExecuted() {
    this._jsEditor.editorConsole.writeLineEx('script executed.');
  }

  _onScriptError(e) {
    this._writeErrorToConsole(e);
  }

  _writeErrorToConsole(e) {
    let errorText = '(' + Math.max(e.lineNumber - 2, 0) + ', ' + e.columnNumber + ') ' + e.toString();
    this._jsEditor.editorConsole.writeLineEx(errorText, TextConsole.messageType.error);
  }

  async _virtualSubscribeScriptButton_event() {
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + this._scriptId, null);
    if (scriptObj) {
      await Dialogs.openSubscribeDialog_async(scriptObj.name, scriptObj.virtualUrl);
    }
  }

  async _setScriptEditorThemeFolderName_sbscrb() {
    this._highLightCssUrl = await ThemeManager.instance.getCssEditorUrl_async('highlight.css');
    if (this._jsEditor) {
      this._jsEditor.setHighlightCss(this._highLightCssUrl);
    }
  }
}
