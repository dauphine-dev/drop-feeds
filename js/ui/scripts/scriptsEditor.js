/*global browser BrowserManager ScriptsManager LocalStorageManager SyntaxHighlighter*/
'use strict';

const _scriptCodeKey = 'scriptCode-';
const _urlMatchKey ='urlMatch-';

const _pairPatternClassList = [
  { pattern: /\b(new|var|if|do|function|while|switch|for|foreach|in|continue|break)(?=[^\w])/g, class: 'jsKeyword1' },
  {
    pattern: /\b(catch|class|const|debugger|default|delete|else|export|extends|finally|import|instanceof|return|super|this|throw|try|typeof|void|with|yield|async|await)(?=[^\w])/g,
    class: 'jsKeyword2'
  },
  { pattern: /\b(document|window|Array|String|Object|Number|\$)(?=[^\w])/g, class: 'jsKeyword3' },
  { pattern: /(\/\*.*\*\/)/g, class: 'jsComment' },
  { pattern: /(\/\/.*)/g, class: 'jsComment' },
  { pattern: /'(.*?)'/g, class: 'jsString' }
];

class ScriptsEditor { /*exported ScriptsEditor */
  static get instance() {
    if (!this._instance) {
      this._instance = new ScriptsEditor();
    }
    return this._instance;
  }

  constructor() {
    this._scriptId = null;
    this._shiftPressed = false;
    this._ctrlPressed = false;
    this._tabSize = 4;
    this._tabChar = ' '.repeat(this._tabSize);
    this._jsHighlighter = new SyntaxHighlighter(_pairPatternClassList);
    document.getElementById('saveButton').addEventListener('click', ScriptsEditor._saveButtonClicked_event);
    document.getElementById('closeButton').addEventListener('click', ScriptsEditor._closeButtonClicked_event);
    document.getElementById('textArea').addEventListener('keydown', ScriptsEditor._textAreaKeydown_event);
    document.getElementById('textArea').addEventListener('keyup', ScriptsEditor._textAreaKeyup_event);
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
    //load script code
    let highlightedCode = document.getElementById('highlightedCode');
    let textArea = document.getElementById('textArea');
    const defaultCode = '// Type your javascript here';
    textArea.value = await LocalStorageManager.getValue_async(_scriptCodeKey + this._scriptId, 'defaultCode');
    let scriptCodeHighlighted = this._jsHighlighter.highlightText(textArea.value);
    BrowserManager.setInnerHtmlByElement(highlightedCode, scriptCodeHighlighted);
    //load url match patterns
    document.getElementById('urlMatch').value = await LocalStorageManager.getValue_async(_scriptCodeKey + this._scriptId, '<all_urls>');
  }

  static async _saveButtonClicked_event() {
    let self = ScriptsEditor.instance;
    let scriptCode = document.getElementById('textArea').value;
    LocalStorageManager.setValue_async(_scriptCodeKey + self._scriptId, scriptCode);
    let urlMatch = document.getElementById('urlMatch').value;
    LocalStorageManager.setValue_async(_urlMatchKey + self._scriptId, urlMatch);

  }

  static async _closeButtonClicked_event() {
    ScriptsManager.instance.display();
  }

  static async _textAreaKeydown_event(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
    switch (event.key) {
      case 'Tab':
        event.stopPropagation();
        event.preventDefault();
        ScriptsEditor._insertText(this._tabChar);
        break;
      default:
    }
  }

  static _insertText(text) {
    let textArea = document.getElementById('textArea');
    let selectionStart = textArea.selectionStart;
    let selectionEnd = textArea.selectionEnd;
    let value = textArea.value;
    let before = value.substring(0, selectionStart);
    let after  = value.substring(selectionEnd, value.length);
    textArea.value = (before + text + after);
    textArea.selectionStart = selectionStart + text.length;
    textArea.selectionEnd = selectionStart + text.length;
  }

  static async _textAreaKeyup_event() {
    let self = ScriptsEditor.instance;
    self._highlightText();
  }

  _highlightText() {
    let plainText = document.getElementById('textArea').value;
    let highlightedText = this._jsHighlighter.highlightText(plainText);
    BrowserManager.setInnerHtmlByElement(document.getElementById('highlightedCode'), highlightedText);
  }

  static async deleteScriptCode_async(scriptId) {
    await browser.storage.local.remove(_scriptCodeKey + scriptId);
  }
}
