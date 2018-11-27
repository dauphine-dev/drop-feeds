'use strict';
class SelectionRaw { /*exported SelectionRaw*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._selectedElement = null;
  }

  put(targetElement) {
    this._removeOld();
    this._putNew(targetElement);
  }

  hide() {
    this._removeOld();
    this._selectedElement = null;
  }

  get selectedElement() {
    return this._selectedElement;
  }

  get selectedRaw() {
    let selectedRaw = null;
    if (this._selectedElement) {
      selectedRaw = this._selectedElement.getAttribute('pos');
    }
    return selectedRaw;
  }

  _removeOld() {
    if (! this._selectedElement) { return; }
    this._selectedElement.style.color = '';
    this._selectedElement.classList.remove('selectionRaw');
  }

  _putNew(selectedElement) {
    this._selectedElement = selectedElement;
    if (! this._selectedElement) { return; }
    this._selectedElement.style.color = 'var(--main-selection-text-color)';
    this._selectedElement.classList.add('selectionRaw');
  }

}
