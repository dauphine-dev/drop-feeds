/*global BrowserManager TextTools SyntaxHighlighter FontManager*/
'use strict';
const _cssEditorPath = '/themes/_any/css/editor.css';
const _fontSizeList = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 22, 24, 26, 28, 32, 36, 40, 48, 56, 64, 72];
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
    this._createElements(baseElement);
    this._appendEventListeners();
    this._appendCss();
  }

  _createElements(baseElement) {
    /*
    <div id="editEditorBox">
      <!-- options elements -->
      <!-- edition elements -->
    </div>
    */
    let editEditorBox = document.createElement('div');
    editEditorBox.setAttribute('id', 'editEditorBox');

    //this._createOptionElements(editEditorBox);

    this._createTextEditionElements(editEditorBox);

    baseElement.appendChild(editEditorBox);

  }

  _createOptionElements(editEditorBox) {
    /*
    <div id="editOptions">
      <div id="fontDiv" >
        <span>Font</span>
        <span>Family:</span>
        <select>
          <option value="serif">serif</option>
          <option value="sans-serif">sans-serif</option>
          <option value="monospace">monospace</option>
        </select>
        <span>Size:</span>
        <select>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
        </select>
      </div>
    */
    let fontDiv = document.createElement('div');
    fontDiv.setAttribute('id', 'fontDiv');

    let spanTitle = document.createElement('span');
    spanTitle.textContent = '#Font';
    fontDiv.appendChild(spanTitle);

    let spanFamily = document.createElement('span');
    spanFamily.textContent = '#Family';
    fontDiv.appendChild(spanFamily);

    let selectFamily = document.createElement('select');
    let fontList = FontManager.instance.getAvailableFontList();
    for (let font of fontList) {
      let option = document.createElement('option');
      option.text = font;
      option.value = font;
      selectFamily.appendChild(option);
    }
    fontDiv.appendChild(selectFamily);

    let spanSize = document.createElement('span');
    spanSize.textContent = '#Size';
    fontDiv.appendChild(spanSize);


    let selectSize = document.createElement('select');
    for (let Size of _fontSizeList) {
      let option = document.createElement('option');
      option.text = Size;
      option.value = Size;
      selectSize.appendChild(option);
    }
    fontDiv.appendChild(selectSize);

    editEditorBox.appendChild(fontDiv);

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
