'use strict';
class SelectionBar { /*exported SelectionBar*/
  constructor() {
    this._selectionBarElement = document.getElementById('selectionBar');
    this._selectedElement = null;
    this._selectedElementId = null;
    this._selectionBarElement.style.visibility = 'hidden';
  }

  hide() {
    this._removeOld();
    this._selectionBarElement.style.visibility = 'hidden';
    this._selectedElementId = null;
    this._selectedElement = null;
  }

  put(targetElement) {
    this._removeOld();
    this._putNew(targetElement);
  }

  refresh() {
    this.put(this._selectedElement);
  }


  _selectedElementOnScrollEvent() {
    this.put(this._selectedElement);
  }

  _removeOld() {
    if (! this._selectedElement) { return; }
    this._selectedElement.removeEventListener('scroll', this._selectedElementOnScrollEvent);
    this._selectionBarElement.style.top = '0px';
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
      let y = rectTarget.top + 5;
      this._selectionBarElement.style.top = y + 'px';
      this._selectionBarElement.style.visibility = 'visible';
    }
  }
}