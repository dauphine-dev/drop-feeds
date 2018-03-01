/*global */
'use strict';
//----------------------------------------------------------------------
let selectionBar = {
  _selectedRootElement: null,
  _selectedRootElementId: null,
  _selectedElement: null,
  _selectedElementId: null,
  //------------------------------
  put(targetElement) {
    selectionBar._removeOld();
    selectionBar._putNew(targetElement);
  },
  //------------------------------
  refresh() {
    selectionBar.put(selectionBar._selectedElement);
  },
  //------------------------------
  putAtRoot() {
    if (!selectionBar._selectedRootElement) {
      selectionBar._selectedRootElement = document.getElementById(selectionBar._selectedRootElementId);
    }
    selectionBar.put(selectionBar._selectedRootElement);
  },
  //------------------------------
  setSelectedRootElement(rootElementId) {
    selectionBar._removeOld();
    selectionBar._selectedRootElementId = rootElementId;
    selectionBar._selectedRootElement = null;
  },
  //------------------------------
  _selectedElementOnScrollEvent() {
    selectionBar.put(selectionBar._selectedElement);
  },
  //------------------------------
  _removeOld() {
    if (! selectionBar._selectedElement) { return; }
    selectionBar._selectedElement.removeEventListener('scroll', selectionBar._selectedElementOnScrollEvent);
    document.getElementById('selectionBar').style.top = '0px';
    let prevElLabel = document.getElementById('lbl-' + selectionBar._selectedElementId);
    if (prevElLabel) {
      prevElLabel.style.color = '';
    }
  },
  //------------------------------
  _putNew(selectedElement) {
    selectionBar._selectedElement = selectedElement;
    if (! selectionBar._selectedElement) { return; }
    selectionBar._selectedElementId = selectedElement.getAttribute('id').substring(3);
    let elLabel = document.getElementById('lbl-' + selectionBar._selectedElementId);
    if (elLabel) {
      elLabel.style.color = 'white';
      let rectTarget = selectionBar._selectedElement.getBoundingClientRect();
      let elSelectionBar = document.getElementById('selectionBar');
      let y = rectTarget.top + 5;
      elSelectionBar.style.top = y + 'px';
    }
  }
  //------------------------------
};