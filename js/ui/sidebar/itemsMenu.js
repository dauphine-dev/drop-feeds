/*global ItemManager ItemsPanel*/
'use strict';
class ItemsMenu { /*exported ItemsMenu*/
  static get instance() {
    if (!this._instance) {
      this._instance = new ItemsMenu();
    }
    return this._instance;
  }

  constructor() {
    this._buttonsEnabled = false;
    this._buttonsForSingleElementEnabled = false;
    document.getElementById('itemMarkAsReadButton').addEventListener('click', ItemsMenu._itemMarkAsReadButtonClicked_event);
    document.getElementById('itemMarkAsUnreadButton').addEventListener('click', ItemsMenu._itemMarkAsUnreadButtonClicked_event);
    document.getElementById('itemMarkAllAsReadButton').addEventListener('click', ItemsMenu._itemMarkAllAsReadButtonClicked_event);
    document.getElementById('itemMarkAllAsUnreadButton').addEventListener('click', ItemsMenu._itemMarkAllAsUnreadButtonClicked_event);
    document.getElementById('itemOpenUnreadButton').addEventListener('click', ItemsMenu._itemOpenUnreadButtonClicked_event);
  }

  disableButtons() {
    this._buttonsEnabled = false;
    this._buttonsForSingleElementEnabled = false;
    let elButtonList = document.getElementById('itemsPaneToolBar').querySelectorAll('.topMenuItem');
    for (let elButton of elButtonList) {
      elButton.style.filter = 'grayscale(100%)';
      elButton.style.opacity = '0.66';
    }
  }

  enableButtons() {
    this._buttonsEnabled = true;
    document.getElementById('itemMarkAllAsReadButton').style.filter = '';
    document.getElementById('itemMarkAllAsReadButton').style.opacity = '';
    document.getElementById('itemMarkAllAsUnreadButton').style.filter = '';
    document.getElementById('itemMarkAllAsUnreadButton').style.opacity = '';
    document.getElementById('itemOpenUnreadButton').style.filter = '';
    document.getElementById('itemOpenUnreadButton').style.opacity = '';
    let selectedElement = ItemsPanel.instance.selectionBarItems.selectedElement;
    if (selectedElement) {
      document.getElementById('itemMarkAsReadButton').style.filter = '';
      document.getElementById('itemMarkAsReadButton').style.opacity = '';
      document.getElementById('itemMarkAsUnreadButton').style.filter = '';
      document.getElementById('itemMarkAsUnreadButton').style.opacity = '';
    }
  }

  disableButtonsForSingleElement() {
    this._buttonsForSingleElementEnabled = false;
    document.getElementById('itemMarkAsReadButton').style.filter = 'grayscale(100%)';
    document.getElementById('itemMarkAsReadButton').style.opacity = '0.66';
    document.getElementById('itemMarkAsUnreadButton').style.filter = 'grayscale(100%)';
    document.getElementById('itemMarkAsUnreadButton').style.opacity = '0.66';
  }

  enableButtonsForSingleElement() {
    this._buttonsForSingleElementEnabled = true;
    let selectedElement =  ItemsPanel.instance.selectionBarItems.selectedElement;
    if (selectedElement) {
      let isVisited = selectedElement.classList.contains('visited');
      if (isVisited) {
        document.getElementById('itemMarkAsReadButton').style.filter = 'grayscale(100%)';
        document.getElementById('itemMarkAsReadButton').style.opacity = '0.66';
        document.getElementById('itemMarkAsUnreadButton').style.filter = '';
        document.getElementById('itemMarkAsUnreadButton').style.opacity = '';
      } else {
        document.getElementById('itemMarkAsReadButton').style.filter = '';
        document.getElementById('itemMarkAsReadButton').style.opacity = '';
        document.getElementById('itemMarkAsUnreadButton').style.filter = 'grayscale(100%)';
        document.getElementById('itemMarkAsUnreadButton').style.opacity = '0.66';
      }
    }
    else {
      document.getElementById('itemMarkAsReadButton').style.filter = 'grayscale(100%)';
      document.getElementById('itemMarkAsReadButton').style.opacity = '0.66';
      document.getElementById('itemMarkAsUnreadButton').style.filter = 'grayscale(100%)';
      document.getElementById('itemMarkAsUnreadButton').style.opacity = '0.66';
    }
  }

  static async _itemMarkAsReadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!ItemsMenu.instance._buttonsForSingleElementEnabled) { return; }
    let elItem = ItemsPanel.instance.selectionBarItems.selectedElement;
    ItemManager.instance.markItemAsRead(elItem);
  }

  static async _itemMarkAsUnreadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!ItemsMenu.instance._buttonsForSingleElementEnabled) { return; }
    let elItem = ItemsPanel.instance.selectionBarItems.selectedElement;
    ItemManager.instance.markItemAsUnread(elItem);
  }

  static async _itemMarkAllAsReadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!ItemsMenu.instance._buttonsEnabled) { return; }
    ItemManager.instance.markAllItemsAsRead();
  }

  static async _itemMarkAllAsUnreadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!ItemsMenu.instance._buttonsEnabled) { return; }
    ItemManager.instance.markAllItemsAsUnread();
  }

  static async _itemOpenUnreadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!ItemsMenu.instance._buttonsEnabled) { return; }
    ItemManager.instance.openAllUnreadItems_async();
  }
}
