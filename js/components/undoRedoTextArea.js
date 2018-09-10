/*global*/
'use strict';
class UndoRedoTextArea { /* exported UndoRedoTextArea */

  constructor() {
    this._undoList = [];
    this._redoList = [];
    this._lastText = null;
  }

  attach(textAreaElement) {
    this._textArea = textAreaElement;
    this._textArea.addEventListener('change', (e) => { this._textAreaChanged_event(e); });
  }

  undo() {
    let undoObj = this._getUndoObj();
    this._applyUndoRedo(undoObj);
  }

  _getUndoObj() {
    if (this._lastText != this._textArea.value) {
      let text = this._lastText;
      this._lastText = this._textArea.value;
      this._redoList.push({ selStart: this._textArea.selectionStart, text: this._textArea.value });
      return { selStart: this._textArea.selectionStart, text: text };
    }

    if (this._undoList.length == 1) {
      return this._undoList[0];
    }

    let undoObj = this._undoList.pop();
    this._redoList.push(undoObj);
    return undoObj;
  }

  redo() {
    if (this._redoList.length == 0) { return; }
    let redoObj = this._getRedoObj();
    this._applyUndoRedo(redoObj);
  }

  _getRedoObj() {
    if (this._lastText != this._textArea.value) { this._pushToUndoList(); }
    let redoObj = this._redoList.pop();
    this._undoList.push(redoObj);
    return redoObj;
  }

  _applyUndoRedo(historyObj) {
    this._lastText = historyObj.text;
    this._textArea.value = this._lastText;
    this._textArea.selectionStart = historyObj.selStart;
    this._textArea.selectionEnd = historyObj.selStart;
  }

  update() {
    this._textArea.dispatchEvent(new Event('change'));
  }

  reset() {
    this._undoList = [];
    this._redoList = [];
    this._pushToUndoList();
  }

  debug(from) {
    if (!from) { from = 'debug'; }
    console.log('from: ', from, '; undoList:', this._undoList.map(o => o.text));
    console.log('from: ', from, '; redoList:', this._redoList.map(o => o.text));
  }

  _pushToUndoList() {
    this._lastText = this._textArea.value;
    this._undoList.push({ selStart: this._textArea.selectionStart, text: this._lastText });
  }

  async _textAreaChanged_event() {
    this._pushToUndoList();
  }
}
