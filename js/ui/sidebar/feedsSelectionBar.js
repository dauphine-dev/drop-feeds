'use strict';
class FeedsSelectionBar { /*exported FeedsSelectionBar*/
  constructor() {
    this._selectionBarElement = document.getElementById('feedsSelectionBar');
    this._selectedElement = null;
    this._selectedElementId = null;
    this._selectedElementIsFolder = null;
    this._selectionBarElement.style.visibility = 'hidden';
  }

  hide() {
    this._removeOld();
    this._selectionBarElement.style.visibility = 'hidden';
    this._selectedElementId = null;
    this._selectedElement = null;
    this._selectedElementIsFolder = null;
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
    let selectedElementId = this._selectedElementId;
    if (this._selectedElementIsFolder) {
      selectedElementId = 'lbl-' + this._selectedElementId;
    }
    let prevElLabel = document.getElementById(selectedElementId);
    if (prevElLabel) {
      prevElLabel.style.color = '';
    }
  }

  _putNew(selectedElement) {
    this._selectedElement = selectedElement;
    if (! this._selectedElement) { return; }
    let targetElement = this._getTargetElement(selectedElement);
    if (targetElement) {
      targetElement.style.color = 'var(--main-selection-text-color)';
      let rectTarget = this._selectedElement.getBoundingClientRect();
      let y = rectTarget.top + 5;
      this._selectionBarElement.style.top = y + 'px';
      this._selectionBarElement.style.visibility = 'visible';
    }
  }

  _getTargetElement(selectedElement) {
    let selectedElementRawId = selectedElement.getAttribute('id');
    this._selectedElementId = selectedElementRawId;
    let idTargetElement = selectedElementRawId;
    this._selectedElementIsFolder = false;
    if (selectedElementRawId.startsWith('dv-')) {
      this._selectedElementId = selectedElementRawId.substring(3);
      idTargetElement = 'lbl-' + this._selectedElementId;
      this._selectedElementIsFolder = true;
    }
    let elLabel = document.getElementById(idTargetElement);
    return elLabel;
  }
}