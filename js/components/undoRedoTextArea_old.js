/*global*/
'use strict';
class UndoRedoTextArea { /* exported UndoRedoTextArea */

  constructor() {
    this._pushIndex = 0;
    this._popIndexFromEnd = 0;
    this._historyList = [];
    this._lastText = null;
  }

  attach(textAreaElement) {
    this._textArea = textAreaElement;
    this._textArea.addEventListener('change', (e) => { this._textAreaChanged_event(e); });
  }

  undo() {
    if (this._lastText != this._textArea.value) { this._pushToHistory(); }
    if (this._popIndexFromEnd < this._pushIndex) {
      this._popIndexFromEnd++;
      this._popIndexFromEnd = Math.min(this._popIndexFromEnd, this._historyList.length - 1);
    }
    let historyObj = this._historyList[this._popIndex] ? this._historyList[this._popIndex] : this._historyList[0];
    this._applyHistoryObj(historyObj);
  }

  redo() {
    if (this._lastText != this._textArea.value) { this._pushToHistory(); }
    if (this._popIndexFromEnd > 0) { this._popIndexFromEnd--; }
    let historyObj = (typeof this._historyList[this._popIndex] !== 'undefined') ? this._historyList[this._popIndex] : this._historyList[this._historyList.length - 1];
    this._applyHistoryObj(historyObj);
  }

  _applyHistoryObj(historyObj) {
    this._lastText = historyObj.text;
    this._textArea.value = this._lastText;
    this._textArea.selectionStart = historyObj.selStart;
    this._textArea.selectionEnd = historyObj.selStart;
  }

  update() {
    this._textArea.dispatchEvent(new Event('change'));
  }

  reset() {
    this._historyList = [];
    this._pushIndex = 0;
    this._popIndexFromEnd = 0;
    this._pushToHistory();
  }

  debug(from) {
    if (!from) { from = 'debug '; }
    console.log('from: ', from, '; pushIndex:', this._pushIndex, '; popIndex:', this._popIndex, '; lastText:', this._lastText, '; historyList:', this._historyList);
  }

  get _popIndex() {
    let endIndex = this._historyList.length - 1;
    let popIndex = endIndex - this._popIndexFromEnd;
    return popIndex;
  }

  _pushToHistory() {
    this._lastText = this._textArea.value;
    this._historyList[this._pushIndex++] = { selStart: this._textArea.selectionStart, text: this._lastText };
    this._popIndexFromEnd = 0;
  }

  async _textAreaChanged_event() {
    this._pushToHistory();
  }
}
