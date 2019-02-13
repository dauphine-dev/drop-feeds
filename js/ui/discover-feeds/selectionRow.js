'use strict';
class SelectionRow { /*exported SelectionRow*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._selectedElements = [];
    this._lastElementPos = null;
  }

  select(element) {
    if (!element) { return; }
    this._removeAll();
    this._add(element);
  }

  addRemove(element) {
    if (!element) { return; }
    if (!this._selectedElements.includes(element)) {
      this._add(element);
    }
    else {
      this._remove(element);
    }
  }

  extend(element) {
    if (!element) { return; }
    let startPos = this._lastElementPos;
    let endPos = parseInt(element.getAttribute('pos'), 10);
    let rows = document.getElementById('tableContent').rows;
    if (endPos >= startPos) {
      for (let pos = startPos + 1; pos <= endPos; pos++) { this._add(rows[pos]); }
    }
    else {
      for (let pos = startPos - 1; pos >= endPos; pos--) { this._add(rows[pos]); }
    }
  }

  hide() {
    this._removeAll();
    this._selectedElements = [];
  }

  get selectedRows() {
    let selectedRows = [];
    for (let el of this._selectedElements) {
      selectedRows.push(parseInt(el.getAttribute('pos'), 10));
    }
    return selectedRows;
  }

  _removeAll() {
    if (this._selectedElements.length == 0) { return; }
    for (let el of this._selectedElements) {
      el.style.color = '';
      el.classList.remove('SelectionRow');
    }
    this._selectedElements = [];
  }

  _add(element) {
    if (!element) { return; }
    if (element.classList.contains('rowDisabled')) { return; }
    this._lastElementPos = parseInt(element.getAttribute('pos'), 10);
    this._selectedElements.push(element);
    element.style.color = 'var(--main-selection-text-color)';
    element.classList.add('SelectionRow');
  }

  _remove(element) {
    if (!element) { return; }
    element.style.color = '';
    element.classList.remove('SelectionRow');
    this._selectedElements = this._selectedElements.filter(item => item != element);
  }

}
