/*global ItemsPanel ItemsMenu*/
class SelectionBarItems { /*exported SelectionBarItems*/
  constructor() {
    this._electionBarItemsElement = document.getElementById('selectionBarItems');
    this._selectedElement = null;
    this._electionBarItemsElement.style.visibility = 'hidden';
  }

  put(targetElement) {
    this._removeOld();
    this._putNew(targetElement);
  }

  hide() {
    ItemsMenu.instance.disableButtonsForSingleElement();
    this._removeOld();
    this._electionBarItemsElement.style.visibility = 'hidden';
    this._selectedElement = null;
  }

  get selectedElement() {
    return this._selectedElement;
  }

  _removeOld() {
    if (! this._selectedElement) { return; }
    this._selectedElement.removeEventListener('scroll', this._selectedElementOnScrollEvent);
    this._electionBarItemsElement.style.top = '0px';
    this._selectedElement.style.color = '';
  }

  _putNew(selectedElement) {
    this._selectedElement = selectedElement;
    if (! this._selectedElement) { return; }
    this._selectedElement.style.color = 'white';
    this._setTop();
    this._electionBarItemsElement.style.visibility = 'visible';
    ItemsMenu.instance.enableButtonsForSingleElement();
  }

  _selectedElementOnScrollEvent() {
    this._setTop();
  }

  _setTop() {
    let rectTarget = this._selectedElement.getBoundingClientRect();
    let elSelectionBar = this._electionBarItemsElement;
    let y = Math.round(rectTarget.top) - ItemsPanel.instance.top + 6;
    elSelectionBar.style.top = y + 'px';
  }
}
