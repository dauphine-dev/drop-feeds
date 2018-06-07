/*global BrowserManager TextTools SyntaxHighlighter*/
'use strict';

class Editor {
  static get instance() {
    if (!this._instance) {
      this._instance = new Editor();
    }
    return this._instance;
  }

  constructor() {
console.log('TODO: load css for highlighted syntax dynamically');
    this._tabSize = 4;
    this._tabChar = ' '.repeat(this._tabSize);
    this._highlighter = null;
    document.getElementById('textArea').addEventListener('keydown', (e) => { this._textAreaKeydown_event(e); });
    document.getElementById('textArea').addEventListener('keydown', (e) => { this._textAreaKey_event(e); });
    document.getElementById('textArea').addEventListener('keyup', (e) => { this._textAreaKey_event(e); });
  }

  async init_async(syntaxFilePath) {
    this._highlighter = new SyntaxHighlighter(syntaxFilePath);
    await this._highlighter.init_async();
  }

  async setText_async(text) {
    let highlightedCode = document.getElementById('highlightedCode');
    let textArea = document.getElementById('textArea');
    textArea.value = text;
    let scriptCodeHighlighted = this._highlighter.highlightText(textArea.value);
    BrowserManager.setInnerHtmlByElement(highlightedCode, scriptCodeHighlighted);
  }

  getText() {
    let text = document.getElementById('textArea').value;
    return text;
  }

  async _textAreaKeydown_event(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
    switch (event.key) {
      case 'Tab':
        event.stopPropagation();
        event.preventDefault();
        this._insertText(this._tabChar);
        break;
      case 'Enter':
        event.stopPropagation();
        event.preventDefault();
        this._autoIndent();
        break;
      default:
    }
  }

  async _textAreaKey_event() {
    this._highlightText();
  }

  _autoIndent() {
    let textArea = document.getElementById('textArea');
    let indent = textArea.value.substr(0, textArea.selectionStart).split('\n').pop().match(/^\s*/)[0];
    this._insertText('\n' + indent);
  }

  _insertText(text) {
    let textArea = document.getElementById('textArea');
    let selectionStart = textArea.selectionStart;
    let selectionEnd = textArea.selectionEnd;
    let value = textArea.value;
    let before = value.substring(0, selectionStart);
    let after = value.substring(selectionEnd, value.length);
    textArea.value = (before + text + after);
    textArea.selectionStart = selectionStart + text.length;
    textArea.selectionEnd = selectionStart + text.length;
  }

  _highlightText() {
    let plainText = document.getElementById('textArea').value;
    plainText = this._fixText(plainText);
    let highlightedText = this._highlighter.highlightText(plainText);
    BrowserManager.setInnerHtmlByElement(document.getElementById('highlightedCode'), highlightedText);
  }

  _fixText(text) {
    text = TextTools.replaceAll(text, '<', '&lt;');
    text = TextTools.replaceAll(text, '>', '&gt;');
    return text;
  }
}
window.editor = Editor.instance;