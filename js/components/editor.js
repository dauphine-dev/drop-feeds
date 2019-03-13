/*global BrowserManager TextTools SyntaxHighlighter EditorMenu LocalStorageManager DefaultValues TextConsole UndoRedoTextArea*/
'use strict';
const _cssEditorPath = '/themes/_templates/css/editor.css';
const _overflow = {
  vertical: 0,
  horizontal: 1
};

class Editor { /*exported Editor*/
  constructor(syntaxFilePath, highLightCssUrl, saveCallback) {
    this._tabSize = 4;
    this._tabChar = ' '.repeat(this._tabSize);
    this._baseElement = null;
    this._editorFontFamily = DefaultValues.editorFontFamily;
    this._editorFontSize = DefaultValues.editorFontSize;
    this._highlighter = null;
    this._syntaxFilePath = syntaxFilePath;
    this._highLightCssUrl = highLightCssUrl;
    this._saveCallback = saveCallback;
    this._isResizing = false;
    this._lastDownY = 0;
    this._editTextArea = undefined;
    this._editHighlightedCode = undefined;
    this._editorMenu = new EditorMenu(this);
    this._textConsole = new TextConsole();
    this._undoRedo = new UndoRedoTextArea();
  }

  async init_async() {
    this._editorFontFamily = await LocalStorageManager.getValue_async('editorFontFamily', this._editorFontFamily);
    this._editorFontSize = await LocalStorageManager.getValue_async('editorFontSize', this._editorFontSize);
    this.tabSize = await LocalStorageManager.getValue_async('editorTabSize', this._tabSize);
    this._highlighter = new SyntaxHighlighter(this._syntaxFilePath);
    await this._highlighter.init_async();
  }

  get editorConsole() {
    return this._textConsole;
  }

  attach(baseElement) {
    this._baseElement = baseElement;
    this._createElements();
    this._undoRedo.attach(this._editTextArea);
    this._appendCss();
    this.setHighlightCss(this._highLightCssUrl);
  }

  async attachMenu_async(baseElement) {
    await this._editorMenu.attach_async(baseElement);
  }

  attachConsole() {
    this._textConsole.attach(document.getElementById('editConsole'));
  }

  attachConsoleMenu() {
    this._textConsole.attachMenu(document.getElementById('editConsoleMenu'));
  }

  get fontFamily() {
    return this._editorFontFamily;
  }

  set fontFamily(value) {
    this._editorFontFamily = value;
    this._editTextArea.style.fontFamily = value;
    this._editHighlightedCode.style.fontFamily = value;
    this._editLineNumber.style.fontFamily = value;
    LocalStorageManager.setValue_async('editorFontFamily', value);
  }

  get fontSize() {
    return this._editorFontSize;
  }

  set fontSize(value) {
    this._editorFontSize = value;
    this._editTextArea.style.fontSize = value + 'px';
    this._editHighlightedCode.style.fontSize = value + 'px';
    this._editLineNumber.style.fontSize = value + 'px';
    LocalStorageManager.setValue_async('editorFontSize', value);
  }

  get tabSize() {
    return this._tabSize;
  }

  set tabSize(value) {
    this._tabSize = value;
    this._tabChar = ' '.repeat(this._tabSize);
    LocalStorageManager.setValue_async('editorTabSize', value);
  }

  async setText_async(text) {
    this._editTextArea.value = text;
    this._highlightText();
    this._undoRedo.reset();
  }

  update() {
    this._editEditorResize_event();
    this._initScrollBar();
  }

  getText() {
    let text = this._editTextArea.value;
    return text;
  }

  setHighlightCss(cssHighLightUrl) {
    this._highLightCssUrl = cssHighLightUrl;
    let cssHighLight = document.getElementById('cssHighLight');
    if (!cssHighLight) {
      this._addHighlightCss(cssHighLightUrl);
    }
    else {
      this._updateHighlightCss(cssHighLightUrl);
    }
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
    this._editLineNumber.textContent = lineNumberString;
  }

  _createElements() {
    let editorHtml = `
    <div id="editMainTable" class="editTableBox">
      <div class="editRowGroupBox">
        <div class="editRowBox">
          <div class="editCellBox editAutoHeight"></div>
          <div class="editCellBox editAutoHeight"></div>
        </div>
        <div class="editRowBox">
          <div id="editLineNumber" class="editCellBox editorText editBorderTopBottom">&nbsp;&nbsp;</div>
          <div id ="editEditor" class="editCellBox editRelative100pc editBorderTopBottom editorText">
            <div id="editHighlightedCode" class="editTextZone editBorderNone"></div>
            <textarea id="editTextArea" class="editTextZone editBorderNone editorCaret caret" spellcheck="false"></textarea>
          </div>
        </div>
        <div class="editRowBox">
          <div class="editCellBox editResizeBar"></div>
          <div class="editCellBox editResizeBar"></div>
        </div>
        <div class="editRowBox">
          <div class="editCellBox editConsole editConsoleLeft editorConsoleLeft"></div>
          <div class="editCellBox editConsole editorConsole">
            <div id="editConsole"></div>
            <div id="editConsoleMenu" class="contextMenuStyle" ></div>
          </div>
        </div>
      </div>
    </div>\n`;

    BrowserManager.insertAdjacentHTMLBeforeEnd(this._baseElement, editorHtml);

    this._editLineNumber = document.getElementById('editLineNumber');

    this._editHighlightedCode = document.getElementById('editHighlightedCode');
    this._editHighlightedCode.style.overflowX = 'hidden';
    this._editHighlightedCode.style.overflowY = 'hidden';

    this._editTextArea = document.getElementById('editTextArea');
    this._editTextArea.classList.add('editTextZone');
    this._editTextArea.classList.add('caret');

    this.fontFamily = this._editorFontFamily;
    this.fontSize = this._editorFontSize;
    this._appendEventListeners();
  }


  _appendEventListeners() {
    window.onresize = (e) => { this._editEditorResize_event(e); };

    this._editTextArea.addEventListener('keydown', (e) => { this._textAreaKeydown_event(e); });
    this._editTextArea.addEventListener('keypress', (e) => { this._textAreaKeypress_event(e); });
    this._editTextArea.addEventListener('keypress', (e) => { this._textAreaKey_event(e); });
    this._editTextArea.addEventListener('input', (e) => { this._textAreaKey_event(e); });
    this._editTextArea.addEventListener('keyup', (e) => { this._textAreaKey_event(e); });

    this._editTextArea.addEventListener('overflow', (e) => { this._overflow_event(e); });
    this._editTextArea.addEventListener('underflow', (e) => { this._underflow_event(e); });
    this._editTextArea.addEventListener('scroll', (e) => { this._scroll_event(e); });

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

  _addHighlightCss(cssHighLightUrl) {
    let cssHighLight = document.createElement('link');
    cssHighLight.setAttribute('id', 'cssHighLight');
    cssHighLight.setAttribute('href', cssHighLightUrl);
    cssHighLight.setAttribute('rel', 'stylesheet');
    cssHighLight.setAttribute('type', 'text/css');
    document.head.appendChild(cssHighLight);
  }

  _updateHighlightCss(cssHighLightUrl) {
    let cssHighLight = document.getElementById('cssHighLight');
    cssHighLight.setAttribute('href', cssHighLightUrl);
  }

  async _textAreaKeydown_event(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
    if (event.ctrlKey) {
      return this._textAreaKeyCtrlPressed(event);
    }
    switch (event.key) {
      case 'Tab':
        event.stopPropagation();
        event.preventDefault();
        this._indent(event.shiftKey);
        break;
      case 'Backspace':
        event.stopPropagation();
        if (this._backIndent()) {
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

  async _textAreaKeypress_event() {
  }

  async _textAreaKeyCtrlPressed(event) {
    let key = event.key.toLowerCase();
    if (key == 's') {
      event.preventDefault();
      this._saveCallback();
      return false;
    }
    else if (key == 'z') {
      this._undoRedo.undo();
      event.preventDefault();
      return false;
    }
    else if (key == 'y') {
      this._undoRedo.redo();
      event.preventDefault();
      return false;
    }
    else if (key == ',' || key == ',') {
      this._undoRedo.debug();
      event.preventDefault();
      return false;
    }

  }

  async _textAreaKey_event() {
    this._highlightText();
  }

  _initScrollBar() {
    let hasVerticalScrollbar = (this._editTextArea.scrollHeight > this._editTextArea.offsetHeight);
    this._setScrollBar(this._editTextArea, _overflow.vertical, hasVerticalScrollbar);
    let hasHorizontalScrollbar = (this._editTextArea.scrollWidth > this._editTextArea.offsetWidth);
    this._setScrollBar(this._editTextArea, _overflow.horizontal, hasHorizontalScrollbar);
  }

  _setScrollBar(target, dir, hasScrollbar) {
    switch (dir) {
      case _overflow.vertical:
        this._editHighlightedCode.style.overflowY = (hasScrollbar ? 'scroll' : 'hidden');
        this._editHighlightedCode.scrollTop = target.scrollTop;
        break;
      case _overflow.horizontal:
        this._editHighlightedCode.style.overflowX = (hasScrollbar ? 'scroll' : 'hidden');
        this._editHighlightedCode.scrollLeft = target.scrollLeft;
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
    this._editHighlightedCode.scrollTop = event.target.scrollTop;
    event.target.scrollTop = this._editHighlightedCode.scrollTop; //workaround for when cursor in on max pos
    this._editLineNumber.scrollTop = this._editHighlightedCode.scrollTop;

    this._editHighlightedCode.scrollLeft = event.target.scrollLeft;
    event.target.scrollLeft = this._editHighlightedCode.scrollLeft; //workaround for when cursor in on max pos
  }

  async _editEditorResize_event() {
    let i = 0;
    let editEditor = document.getElementById('editEditor');
    let editEditorOffsetHeight = editEditor.offsetHeight;
    let editEditorOffsetHeightPrev = 0;
    //workaround to avoid weird resizing...
    while (editEditorOffsetHeight != editEditorOffsetHeightPrev && i++ < 100) {
      editEditorOffsetHeightPrev = editEditorOffsetHeight;
      this._editLineNumber.style.height = (editEditorOffsetHeight - 5) + 'px';
      editEditorOffsetHeight = editEditor.offsetHeight;
    }
    this._editLineNumber.style.height = editEditorOffsetHeight + 'px';
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
    editConsole.style.height = Math.max(editConsole.clientHeight + delta, 0) + 'px';
    this._editLineNumber.style.height = Math.max(this._editLineNumber.clientHeight - delta, 0) + 'px';
  }

  _indent(backward) {
    let selected = this._editTextArea.value.substring(this._editTextArea.selectionStart, this._editTextArea.selectionEnd);
    let lineList = selected.split('\n');
    if (lineList.length <= 1) {
      this._insertText(this._tabChar);
      return;
    }
    let selectionStart = this._editTextArea.selectionStart;
    let selectionEnd = this._editTextArea.selectionEnd;
    if (TextTools.isNullOrEmpty(lineList[lineList.length - 1])) {
      lineList.pop();
      selectionEnd--;
    }
    let value = this._editTextArea.value;
    let before = value.substring(0, selectionStart);
    let after = value.substring(selectionEnd, value.length);

    if (backward) {
      lineList = lineList.map(line => {
        let pos1stNonSpaceChar = (/\S/.exec(line)).index;
        line = (line.substring(pos1stNonSpaceChar - this._tabSize, pos1stNonSpaceChar) == this._tabChar ?
          line.substring(0, pos1stNonSpaceChar - this._tabSize) : '') + line.substring(pos1stNonSpaceChar);
        return line;
      });
    }
    else {
      lineList = lineList.map(line => line = this._tabChar + line);
    }

    selected = lineList.join('\n');
    this._editTextArea.value = (before + selected + after);
    this._editTextArea.selectionStart = selectionStart;
    this._editTextArea.selectionEnd = selectionStart + selected.length;
    this._undoRedo.update();
  }

  _autoIndent() {
    let indent = this._editTextArea.value.substr(0, this._editTextArea.selectionStart).split('\n').pop().match(/^\s*/)[0];
    this._insertText('\n' + indent);
  }

  _backIndent() {
    let curCaretPosition = this._editTextArea.selectionStart;
    let tabSizeMinOne = Math.max(this._tabSize - 0, 0);
    let textToDelete = this._editTextArea.value.substring(Math.max(curCaretPosition - this._tabSize, 0), curCaretPosition);
    if (textToDelete == this._tabChar) {
      let newCaretPosition = Math.max(curCaretPosition - tabSizeMinOne, 0);
      this._editTextArea.value = this._editTextArea.value.substring(0, newCaretPosition) + this._editTextArea.value.substring(curCaretPosition, this._editTextArea.value.length);
      this._editTextArea.selectionStart = newCaretPosition;
      this._editTextArea.selectionEnd = newCaretPosition;
      this._undoRedo.update();
      return true;
    }
    return false;
  }

  _insertText(text) {
    let selectionStart = this._editTextArea.selectionStart;
    let selectionEnd = this._editTextArea.selectionEnd;
    let value = this._editTextArea.value;
    let before = value.substring(0, selectionStart);
    let after = value.substring(selectionEnd, value.length);
    this._editTextArea.value = (before + text + after);
    this._editTextArea.selectionStart = selectionStart + text.length;
    this._editTextArea.selectionEnd = selectionStart + text.length;
    this._undoRedo.update();
  }

  _highlightText() {
    let plainText = this._editTextArea.value;
    plainText = this._fixText(plainText);
    let highlightedText = this._highlighter.highlightText(plainText);
    BrowserManager.setInnerHtmlByElement(this._editHighlightedCode, highlightedText);
    this._updateLineNumbers(plainText);
  }

  _fixText(text) {
    text = TextTools.replaceAll(text, '<', '&lt;');
    text = TextTools.replaceAll(text, '>', '&gt;');
    return text;
  }
}
