/*global BrowserManager TextTools SyntaxHighlighter EditorMenu LocalStorageManager DefaultValues*/
'use strict';
const _cssEditorPath = '/themes/_any/css/editor.css';
const _overflow = {
  vertical: 0,
  horizontal: 1
};


class EditorConsole { /*exported Console*/
  write(text, color) {
    let editConsole = document.getElementById('editConsole');
    let style = '';
    if (color) { style = 'style="color: ' + color + '"'; }
    let html = '<span ' +  style + '>' + text + '</span>';
    editConsole.insertAdjacentHTML('beforeend', html);
    editConsole.scrollTop = editConsole.scrollHeight;
  }

  writeLine(text, color) {
    this.write(text + '<br/>', color);
  }

  clear() {
    let editConsole = document.getElementById('editConsole');
    editConsole.textContent = '';
  }
}

class Editor { /*exported Editor*/
  constructor(syntaxFilePath, saveCallback) {
    this._tabSize = 4;
    this._tabChar = ' '.repeat(this._tabSize);
    this._baseElement = null;
    this._editorFontFamily = DefaultValues.editorFontFamily;
    this._editorFontSize = DefaultValues.editorFontSize;
    this._highlighter = null;
    this._syntaxFilePath = syntaxFilePath;
    this._saveCallback = saveCallback;
    this._console = new EditorConsole();
  }

  async init_async() {
    this._editorFontFamily = await LocalStorageManager.getValue_async('editorFontFamily', this._editorFontFamily);
    this._editorFontSize = await LocalStorageManager.getValue_async('editorFontSize', this._editorFontSize);
    this._highlighter = new SyntaxHighlighter(this._syntaxFilePath);
    await this._highlighter.init_async();
  }

  get console() {
    return this._console;
  }

  attachEditor(baseElement) {
    this._baseElement = baseElement;
    this._createElements();
    this._appendCss();
  }

  attachMenu(baseElement) {
    (new EditorMenu(this)).attach(baseElement);
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

  async setText_async(text) {
    let textArea = document.getElementById('editTextArea');
    textArea.value = text;
    this._highlightText();
  }

  getText() {
    let text = document.getElementById('editTextArea').value;
    return text;
  }

  _createElements() {
    let editorHtml = '\
    <div class="editTableBox">\
      <div class="editRowGroupBox">\
        <div class="editRowBox">\
          <div class="editCellBox editAutoHeight">\
          </div>\
        </div>\
        <div class="editRowBox">\
          <div class="editCellBox editRelative100pc">\
            <div id="editHighlightedCode" class="editTextZone editBorderTopBottom editorText">\
            </div>\
            <textarea id="editTextArea" class="editTextZone editBorderTopBottom editorCaret"></textarea>\
          </div>\
        </div>\
        <div class="editRowBox">\
          <div class="editCellBox">\
          <div id="editConsole"></div>\
          </div>\
        </div>\
      </div>\
    </div>';
    this._baseElement.insertAdjacentHTML('beforeend', editorHtml);
    let editHighlightedCode = document.getElementById('editHighlightedCode');
    editHighlightedCode.style.overflowX = 'hidden';
    editHighlightedCode.style.overflowY = 'hidden';
    editHighlightedCode.style.fontFamily = this._editorFontFamily;
    editHighlightedCode.style.fontSize = this._editorFontSize + 'px';

    let editTextArea = document.getElementById('editTextArea');
    editTextArea.classList.add('editTextZone');
    editTextArea.classList.add('caret');
    editTextArea.setAttribute('id', 'editTextArea');
    editTextArea.style.fontFamily = this._editorFontFamily;
    editTextArea.style.fontSize = this._editorFontSize + 'px';

    this._appendEventListeners();
  }


  _appendEventListeners() {

    document.getElementById('editTextArea').addEventListener('keydown', (e) => { this._textAreaKeydown_event(e); });
    document.getElementById('editTextArea').addEventListener('keypress', (e) => { this._textAreaKeypress_event(e); });
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

  async _textAreaKeypress_event(event) {
    if (event.key.toLowerCase() == 's' && event.ctrlKey) {
      event.preventDefault();
      this._saveCallback();
      return false;
    }
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
