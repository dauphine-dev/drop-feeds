/*global BrowserManager TextTools SyntaxHighlighter EditorMenu LocalStorageManager DefaultValues*/
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
    this._editorFontFamily = DefaultValues.editorFontFamily;
    this._editorFontSize = DefaultValues.editorFontSize;
    this._highlighter = null;
    this._syntaxFilePath = syntaxFilePath;
  }


  async init_async() {
    this._editorFontFamily =  await LocalStorageManager.getValue_async('editorFontFamily', this._editorFontFamily);
    this._editorFontSize =  await LocalStorageManager.getValue_async('editorFontSize', this._editorFontSize);
    this._highlighter = new SyntaxHighlighter(this._syntaxFilePath);
    await this._highlighter.init_async();
  }

  attach(baseElement) {
    this._createElements(baseElement);
    this._appendEventListeners();
    this._appendCss();
  }

  get fontFamily() {
    return this._editorFontFamily;
  }

  set fontFamily(value) {
    this._editorFontFamily = value;
    document.getElementById('editTextArea').style.fontFamily = value;
    document.getElementById('editHighlightedCode').style.fontFamily = value;
    LocalStorageManager.setValue_async('editorFontFamily', value);
  }

  get fontSize() {
    return this._editorFontSize;
  }

  set fontSize(value) {
    this._editorFontSize = value;
    document.getElementById('editTextArea').style.fontSize = value + 'px';
    document.getElementById('editHighlightedCode').style.fontSize = value + 'px';
    LocalStorageManager.setValue_async('editorFontSize', value);
  }

  _createElements(baseElement) {
    /*
    <div id="editEditorBox">
      <!-- editor menu -->
      <!-- edition elements -->
    </div>
    */
    let editEditorBox = document.createElement('div');
    editEditorBox.setAttribute('id', 'editEditorBox');
    (new EditorMenu(this)).attach(baseElement);
    this._createTextEditionElements(editEditorBox);
    baseElement.appendChild(editEditorBox);
  }

  _createTextEditionElements(editEditorBox) {
    /*
    <div id="editHighlightedCode" class="editTextZone font" style="overflow-x: scroll; overflow-y: hidden;">
      <span class="jsComment">//&nbsp;Type&nbsp;your&nbsp;javascript&nbsp;here</span>
    </div>
    <textarea class="editTextZone font cursor" id="editTextArea"></textarea>
    */
    let editHighlightedCode = document.createElement('div');
    editHighlightedCode.setAttribute('id', 'editHighlightedCode');
    editHighlightedCode.classList.add('editTextZone');
    editHighlightedCode.style.overflowX = 'hidden';
    editHighlightedCode.style.overflowY = 'hidden';
    editHighlightedCode.style.fontFamily = this._editorFontFamily;
    editHighlightedCode.style.fontSize = this._editorFontSize + 'px';
    editEditorBox.appendChild(editHighlightedCode);

    let editTextArea = document.createElement('textarea');
    editTextArea.classList.add('editTextZone');
    editTextArea.classList.add('caret');
    editTextArea.setAttribute('id', 'editTextArea');
    editTextArea.style.fontFamily = this._editorFontFamily;
    editTextArea.style.fontSize = this._editorFontSize + 'px';
    editEditorBox.appendChild(editTextArea);

  }

  _appendEventListeners() {
    document.getElementById('editTextArea').addEventListener('keydown', (e) => { this._textAreaKeydown_event(e); });
    document.getElementById('editTextArea').addEventListener('keypress', (e) => { this._textAreaKey_event(e); });
    document.getElementById('editTextArea').addEventListener('input', (e) => { this._textAreaKey_event(e); });
    document.getElementById('editTextArea').addEventListener('keyup', (e) => { this._textAreaKey_event(e); });

    document.getElementById('editTextArea').addEventListener('overflow', (e) => { this._overflow_event(e); });
    document.getElementById('editTextArea').addEventListener('underflow', (e) => { this._underflow_event(e); });
    document.getElementById('editTextArea').addEventListener('scroll', (e) => { this._scroll_event(e); });
  }

  _appendCss() {
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
