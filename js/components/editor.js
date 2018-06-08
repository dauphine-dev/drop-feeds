/*global BrowserManager TextTools SyntaxHighlighter*/
'use strict';
const _cssEditorPath = '/themes/_any/css/editor.css';
class Editor { /*exported Editor*/
  constructor(syntaxFilePath) {
    this._tabSize = 4;
    this._tabChar = ' '.repeat(this._tabSize);
    this._highlighter = null;
    this._syntaxFilePath = syntaxFilePath;
  }

  async init_async() {
    this._highlighter = new SyntaxHighlighter(this._syntaxFilePath);
    await this._highlighter.init_async();
  }

  attach(baseElement) {
    let editEditorBox = document.createElement('div');
    let editHighlightedCode = document.createElement('div');
    let editTextArea = document.createElement('textarea');

    editEditorBox.setAttribute('id', 'editEditorBox');
    editHighlightedCode.setAttribute('id', 'editHighlightedCode');
    editTextArea.setAttribute('id', 'editTextArea');

    editEditorBox.appendChild(editHighlightedCode);
    editEditorBox.appendChild(editTextArea);
    baseElement.appendChild(editEditorBox);

    document.getElementById('editTextArea').addEventListener('keydown', (e) => { this._textAreaKeydown_event(e); });
    document.getElementById('editTextArea').addEventListener('input', (e) => { this._textAreaKey_event(e); });
    document.getElementById('editTextArea').addEventListener('keyup', (e) => { this._textAreaKey_event(e); });


    let editorCss = document.createElement('link');
    editorCss.setAttribute('href', _cssEditorPath);
    editorCss.setAttribute('rel', 'stylesheet');
    editorCss.setAttribute('type', 'text/css');
    document.head.appendChild(editorCss);
  }

  async setText_async(text) {
    let highlightedCode = document.getElementById('editHighlightedCode');
    let textArea = document.getElementById('editTextArea');
    textArea.value = text;
    let scriptCodeHighlighted = this._highlighter.highlightText(textArea.value);
    BrowserManager.setInnerHtmlByElement(highlightedCode, scriptCodeHighlighted);
  }

  getText() {
    let text = document.getElementById('editTextArea').value;
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
    let textArea = document.getElementById('editTextArea');
    let indent = textArea.value.substr(0, textArea.selectionStart).split('\n').pop().match(/^\s*/)[0];
    this._insertText('\n' + indent);
  }

  _insertText(text) {
    let textArea = document.getElementById('editTextArea');
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
    let plainText = document.getElementById('editTextArea').value;
    plainText = this._fixText(plainText);
    let highlightedText = this._highlighter.highlightText(plainText);
    BrowserManager.setInnerHtmlByElement(document.getElementById('editHighlightedCode'), highlightedText);
  }

  _fixText(text) {
    text = TextTools.replaceAll(text, '<', '&lt;');
    text = TextTools.replaceAll(text, '>', '&gt;');
    return text;
  }
}
