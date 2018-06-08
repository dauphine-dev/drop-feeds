/*global BrowserManager TextTools SyntaxHighlighter*/
'use strict';
const _cssEditorPath = '/themes/_any/css/editor.css';
const _overflow = {
  vertical: 0,
  horizontal: 1
};

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
    editEditorBox.setAttribute('id', 'editEditorBox');

    let editHighlightedCode = document.createElement('div');
    editHighlightedCode.setAttribute('id', 'editHighlightedCode');
    editHighlightedCode.classList.add('editTextZone');
    editHighlightedCode.classList.add('font');
    editHighlightedCode.style.overflowX = 'hidden';
    editHighlightedCode.style.overflowY = 'hidden';
    editEditorBox.appendChild(editHighlightedCode);

    let editTextArea = document.createElement('textarea');
    editTextArea.classList.add('editTextZone');
    editTextArea.classList.add('font');
    editTextArea.classList.add('cursor');
    editTextArea.setAttribute('id', 'editTextArea');
    editEditorBox.appendChild(editTextArea);

    baseElement.appendChild(editEditorBox);

    document.getElementById('editTextArea').addEventListener('keydown', (e) => { this._textAreaKeydown_event(e); });
    document.getElementById('editTextArea').addEventListener('keypress', (e) => { this._textAreaKey_event(e); });
    document.getElementById('editTextArea').addEventListener('input', (e) => { this._textAreaKey_event(e); });
    document.getElementById('editTextArea').addEventListener('keyup', (e) => { this._textAreaKey_event(e); });

    document.getElementById('editTextArea').addEventListener('overflow', (e) => { this._overflow_event(e); });
    document.getElementById('editTextArea').addEventListener('underflow', (e) => { this._underflow_event(e); });
    document.getElementById('editTextArea').addEventListener('scroll', (e) => { this._scroll_event(e); });


    let editorCss = document.createElement('link');
    editorCss.setAttribute('href', _cssEditorPath);
    editorCss.setAttribute('rel', 'stylesheet');
    editorCss.setAttribute('type', 'text/css');
    document.head.appendChild(editorCss);
  }

  async setText_async(text) {
    let textArea = document.getElementById('editTextArea');
    textArea.value = text;
    this._highlightText();
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
    this._highlightText();
  }

  async _textAreaKey_event() {
    this._highlightText();
  }

  async _overflow_event(event) {
    let editHighlightedCode = document.getElementById('editHighlightedCode');
    switch (event.detail) {
      case _overflow.vertical:
        editHighlightedCode.style.overflowY = 'scroll';
        editHighlightedCode.scrollTop = event.target.scrollTop;
        break;
      case _overflow.horizontal:
        editHighlightedCode.style.overflowX = 'scroll';
        editHighlightedCode.scrollLeft = event.target.scrollLeft;
        break;
    }
  }

  async _underflow_event(event) {
    let editHighlightedCode = document.getElementById('editHighlightedCode');
    switch (event.detail) {
      case _overflow.vertical:
        editHighlightedCode.scrollTop = event.target.scrollTop;
        editHighlightedCode.style.overflowY = 'hidden';
        break;
      case _overflow.horizontal:
        editHighlightedCode.scrollLeft = event.target.scrollLeft;
        editHighlightedCode.style.overflowX = 'hidden';
        break;
    }
  }

  async _scroll_event(event) {
    let editHighlightedCode = document.getElementById('editHighlightedCode');
    editHighlightedCode.scrollTop = event.target.scrollTop;
    event.target.scrollTop = editHighlightedCode.scrollTop; //workaround for when cursor in on max pos

    editHighlightedCode.scrollLeft = event.target.scrollLeft;
    event.target.scrollLeft = editHighlightedCode.scrollLeft; //workaround for when cursor in on max pos
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
