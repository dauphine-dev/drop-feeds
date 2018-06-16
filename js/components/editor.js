/*global BrowserManager TextTools SyntaxHighlighter EditorMenu LocalStorageManager DefaultValues*/
'use strict';
const _cssEditorPath = '/themes/_any/css/editor.css';
const _overflow = {
  vertical: 0,
  horizontal: 1
};

const _messageType = { default: 0, ok: 1, error: 2 };


class EditorConsole { /*exported Console*/
  static get messageType() {
    return _messageType;
  }

  write(text, messageType) {
    let editConsole = document.getElementById('editConsole');
    let style = '';
    let css = '';
    if (!messageType) { messageType = _messageType.default; }
    switch (messageType) {
      case _messageType.default:
        css = ' class="editorConsoleTextDefault" ';
        break;
      case _messageType.ok:
        css = ' class="editorConsoleTextOk" ';
        break;
      case _messageType.error:
        css = ' class="editorConsoleTextError" ';
        break;
      default:
        style = ' style=' + messageType + ' ';
    }
    let html = '<span' + css + style + '>' + text + '</span>';
    editConsole.insertAdjacentHTML('beforeend', html);
    editConsole.scrollTop = editConsole.scrollHeight;
  }

  writeLine(text, messageType) {
    this.write(text + '<br/>', messageType);
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
    this._isResizing = false;
    this._lastDownY = 0;
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
    document.getElementById('editLineNumber').style.fontFamily = value;
    LocalStorageManager.setValue_async('editorFontFamily', value);
  }

  get fontSize() {
    return this._editorFontSize;
  }

  set fontSize(value) {
    this._editorFontSize = value;
    document.getElementById('editTextArea').style.fontSize = value + 'px';
    document.getElementById('editHighlightedCode').style.fontSize = value + 'px';
    document.getElementById('editLineNumber').style.fontSize = value + 'px';
    LocalStorageManager.setValue_async('editorFontSize', value);
  }

  async setText_async(text) {
    let textArea = document.getElementById('editTextArea');
    textArea.value = text;
    this._highlightText();
  }

  update() {
    this._editEditorResize_event();
    this._initScrollBar();
  }

  getText() {
    let text = document.getElementById('editTextArea').value;
    return text;
  }

  _updateLineNumbers(text) {
    let lineNum = TextTools.occurrences(text, '\n') + 1;
    let lineNumberString = '\u00a01\n', i = 1;
    for (i = 2; i < lineNum; i++) {
      lineNumberString += i + '\n';
    }
    if (lineNum > 1) {
      lineNumberString += i;
    }
    document.getElementById('editLineNumber').textContent = lineNumberString;
  }

  _createElements() {
    let editorHtml = '\
    <div id="editMainTable" class="editTableBox">\
      <div class="editRowGroupBox">\
        <div class="editRowBox">\
          <div class="editCellBox editAutoHeight"></div>\
          <div class="editCellBox editAutoHeight"></div>\
        </div>\
        <div class="editRowBox">\
          <div id="editLineNumber" class="editCellBox editorText editBorderTopBottom">&nbsp;&nbsp;</div>\
          <div id ="editEditor" class="editCellBox editRelative100pc editBorderTopBottom editorText">\
            <div id="editHighlightedCode" class="editTextZone editBorderNone"></div>\
            <textarea id="editTextArea" class="editTextZone editBorderNone editorCaret caret"></textarea>\
          </div>\
        </div>\
        <div class="editRowBox">\
          <div class="editCellBox editResizeBar"></div>\
          <div class="editCellBox editResizeBar"></div>\
        </div>\
        <div class="editRowBox">\
        <div class="editCellBox editConsole editConsoleLeft editorConsoleLeft"></div>\
        <div class="editCellBox editConsole editorConsole">\
            <div id="editConsole"></div>\
          </div>\
        </div>\
      </div>\
    </div>\n';

    this._baseElement.insertAdjacentHTML('beforeend', editorHtml);
    let editHighlightedCode = document.getElementById('editHighlightedCode');
    editHighlightedCode.style.overflowX = 'hidden';
    editHighlightedCode.style.overflowY = 'hidden';

    let editTextArea = document.getElementById('editTextArea');
    editTextArea.classList.add('editTextZone');
    editTextArea.classList.add('caret');
    editTextArea.setAttribute('id', 'editTextArea');

    this.fontFamily = this._editorFontFamily;
    this.fontSize = this._editorFontSize;
    this._appendEventListeners();
  }


  _appendEventListeners() {
    window.onresize = (e) => { this._editEditorResize_event(e); };

    let editTextArea = document.getElementById('editTextArea');
    editTextArea.addEventListener('keydown', (e) => { this._textAreaKeydown_event(e); });
    editTextArea.addEventListener('keypress', (e) => { this._textAreaKeypress_event(e); });
    editTextArea.addEventListener('keypress', (e) => { this._textAreaKey_event(e); });
    editTextArea.addEventListener('input', (e) => { this._textAreaKey_event(e); });
    editTextArea.addEventListener('keyup', (e) => { this._textAreaKey_event(e); });

    editTextArea.addEventListener('overflow', (e) => { this._overflow_event(e); });
    editTextArea.addEventListener('underflow', (e) => { this._underflow_event(e); });
    editTextArea.addEventListener('scroll', (e) => { this._scroll_event(e); });

    document.addEventListener('mousemove', (e) => { this._editResizeBarMousemove_event(e); });
    document.addEventListener('mouseup', (e) => { this._editResizeBarMouseup_event(e); });
    let editResizeBarList = document.getElementById('editMainTable').querySelectorAll('.editResizeBar');
    for (let editResizeBar of editResizeBarList) {
      editResizeBar.addEventListener('mousedown', (e) => { this._editResizeBarMousedown_event(e); });
    }


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
      case 'Backspace':
        event.stopPropagation();
        if (this._unIndent()) {
          event.preventDefault();
        }
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

  _initScrollBar() {
    let editTextArea = document.getElementById('editTextArea');
    let hasVerticalScrollbar = (editTextArea.scrollHeight > editTextArea.offsetHeight);
    this._setScrollBar(editTextArea, _overflow.vertical, hasVerticalScrollbar);
    let hasHorizontalScrollbar = (editTextArea.scrollHeight > editTextArea.offsetHeight);
    this._setScrollBar(editTextArea, _overflow.horizontal, hasHorizontalScrollbar);
  }

  _setScrollBar(target, dir, hasScrollbar) {
    let editHighlightedCode = document.getElementById('editHighlightedCode');
    switch (dir) {
      case _overflow.vertical:
        editHighlightedCode.style.overflowY = (hasScrollbar ? 'scroll' : 'hidden');
        editHighlightedCode.scrollTop = target.scrollTop;
        break;
      case _overflow.horizontal:
        editHighlightedCode.style.overflowX = (hasScrollbar ? 'scroll' : 'hidden');
        editHighlightedCode.scrollLeft = target.scrollLeft;
        break;
    }

  }

  async _overflow_event(event) {
    this._setScrollBar(event.target, event.detail, true);
  }

  async _underflow_event(event) {
    this._setScrollBar(event.target, event.detail, false);
  }

  async _scroll_event(event) {
    let editLineNumber = document.getElementById('editLineNumber');
    let editHighlightedCode = document.getElementById('editHighlightedCode');
    editHighlightedCode.scrollTop = event.target.scrollTop;
    event.target.scrollTop = editHighlightedCode.scrollTop; //workaround for when cursor in on max pos
    editLineNumber.scrollTop = editHighlightedCode.scrollTop;

    editHighlightedCode.scrollLeft = event.target.scrollLeft;
    event.target.scrollLeft = editHighlightedCode.scrollLeft; //workaround for when cursor in on max pos
  }

  async _editEditorResize_event() {
    let i = 0;
    let editEditor = document.getElementById('editEditor');
    let editLineNumber = document.getElementById('editLineNumber');
    let editEditorOffsetHeight = editEditor.offsetHeight;
    let editEditorOffsetHeightPrev = 0;
    //workaround to avoid weird resizing...
    while (editEditorOffsetHeight != editEditorOffsetHeightPrev && i++ < 100) {
      editEditorOffsetHeightPrev = editEditorOffsetHeight;
      editLineNumber.style.height = (editEditorOffsetHeight - 5) + 'px';
      editEditorOffsetHeight = editEditor.offsetHeight;
    }
    editLineNumber.style.height = editEditorOffsetHeight + 'px';
  }

  async _editResizeBarMouseup_event() {
    this._isResizing = false;
  }

  async _editResizeBarMousedown_event(event) {
    this._isResizing = true;
    this._lastDownY = event.clientY;
  }

  async _editResizeBarMousemove_event(event) {
    if (!this._isResizing) { return; }
    let delta = this._lastDownY - event.clientY;
    this._lastDownY = event.clientY;
    let editConsole = document.getElementById('editConsole');
    let editLineNumber = document.getElementById('editLineNumber');
    editConsole.style.height = Math.max(editConsole.clientHeight + delta, 0) + 'px';
    editLineNumber.style.height = Math.max(editLineNumber.clientHeight - delta, 0) + 'px';
  }

  _autoIndent() {
    let textArea = document.getElementById('editTextArea');
    let indent = textArea.value.substr(0, textArea.selectionStart).split('\n').pop().match(/^\s*/)[0];
    this._insertText('\n' + indent);
  }

  _unIndent() {
    let editTextArea = document.getElementById('editTextArea');
    let curCaretPosition = editTextArea.selectionStart;
    let tabSizeMinOne = Math.max(this._tabSize - 0, 0);
    let textToDelete = editTextArea.value.substring(Math.max(curCaretPosition - this._tabSize, 0), curCaretPosition);
    if (textToDelete == this._tabChar) {
      let newCaretPosition = Math.max(curCaretPosition - tabSizeMinOne, 0);
      editTextArea.value = editTextArea.value.substring(0, newCaretPosition) + editTextArea.value.substring(curCaretPosition, editTextArea.value.length);
      editTextArea.selectionStart = newCaretPosition;
      editTextArea.selectionEnd = newCaretPosition;
      return true;
    }
    return false;
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
    this._updateLineNumbers(plainText);
  }

  _fixText(text) {
    text = TextTools.replaceAll(text, '<', '&lt;');
    text = TextTools.replaceAll(text, '>', '&gt;');
    return text;
  }


}
