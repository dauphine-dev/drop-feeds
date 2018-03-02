/*global */
'use strict';
class selectionBar { /*exported selectionBar*/
  static get instance() {
    if (!this._instance) {
      this._instance = new selectionBar();
    }
    return this._instance;
  }

  constructor() {
    this._selectedRootElement = null;
    this._selectedRootElementId = null;
    this._selectedElement = null;
    this._selectedElementId = null;
  }

  put(targetElement) {
    this._removeOld();
    this._putNew(targetElement);
  }

  refresh() {
    this.put(this._selectedElement);
  }

  putAtRoot() {
    if (!this._selectedRootElement) {
      this._selectedRootElement = document.getElementById(this._selectedRootElementId);
    }
    this.put(this._selectedRootElement);
  }

  setRootElement(rootElementId) {
    this._removeOld();
    this._selectedRootElementId = rootElementId;
    this._selectedRootElement = null;
  }

  _selectedElementOnScrollEvent() {
    this.put(this._selectedElement);
  }

  _removeOld() {
    if (! this._selectedElement) { return; }
    this._selectedElement.removeEventListener('scroll', this._selectedElementOnScrollEvent);
    document.getElementById('selectionBar').style.top = '0px';
    let prevElLabel = document.getElementById('lbl-' + this._selectedElementId);
    if (prevElLabel) {
      prevElLabel.style.color = '';
    }
  }

  _putNew(selectedElement) {
    this._selectedElement = selectedElement;
    if (! this._selectedElement) { return; }
    this._selectedElementId = selectedElement.getAttribute('id').substring(3);
    let elLabel = document.getElementById('lbl-' + this._selectedElementId);
    if (elLabel) {
      elLabel.style.color = 'white';
      let rectTarget = this._selectedElement.getBoundingClientRect();
      let elSelectionBar = document.getElementById('selectionBar');
      let y = rectTarget.top + 5;
      elSelectionBar.style.top = y + 'px';
    }
  }
}