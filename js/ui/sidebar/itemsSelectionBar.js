/*global ItemsMenu*/
'use strict';
class ItemsSelectionBar { /*exported ItemsSelectionBar*/
  constructor() {
    this._selectionBarItemsElement = document.getElementById('itemsSelectionBar');
    this._selectedElement = null;
    this._selectionBarItemsElement.style.visibility = 'hidden';
  }

  put(targetElement) {
    this._removeOld();
    this._putNew(targetElement);
  }

  hide() {
    ItemsMenu.instance.disableButtonsForSingleElement();
    this._removeOld();
    this._selectionBarItemsElement.style.visibility = 'hidden';
    this._selectedElement = null;
  }

  get selectedElement() {
    return this._selectedElement;
  }

  refresh() {
    this.put(this._selectedElement);
  }

  _removeOld() {
    if (! this._selectedElement) { return; }
    this._selectedElement.removeEventListener('scroll', this._selectedElementOnScrollEvent);
    this._selectionBarItemsElement.style.top = '0px';
    this._selectedElement.style.color = '';
  }

  _putNew(selectedElement) {
    this._selectedElement = selectedElement;
    if (! this._selectedElement) { return; }
    this._selectedElement.style.color = 'var(--main-selection-text-color)';
    let y = this._setTop();
    let elItemsPaneTitleBar = document.getElementById('itemsPaneTitleBar');
    let minTop  = elItemsPaneTitleBar.offsetTop + elItemsPaneTitleBar.clientHeight;
    this._selectionBarItemsElement.style.visibility = ( y >= minTop ? 'visible' : 'hidden');
    ItemsMenu.instance.enableButtonsForSingleElement();    
  }

  _selectedElementOnScrollEvent() {
    this._setTop();
  }

  _setTop() {
    let rectTarget = this._selectedElement.getBoundingClientRect();
    let y = Math.round(rectTarget.top + 6);
    this._selectionBarItemsElement.style.top = y + 'px';
    return y;
  }
}
