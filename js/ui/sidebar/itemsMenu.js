/*global browser ItemManager ItemsPanel CssManager*/
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
    this._updateLocalizedStrings();
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
      CssManager.disableElement(elButton);
    }
  }

  enableButtons() {
    this._buttonsEnabled = true;
    CssManager.enableElementById('itemMarkAllAsReadButton');
    CssManager.enableElementById('itemMarkAllAsUnreadButton');
    CssManager.enableElementById('itemOpenUnreadButton');
    let selectedElement = ItemsPanel.instance.selectionBarItems.selectedElement;
    if (selectedElement) {
      CssManager.enableElementById('itemMarkAsReadButton');
      CssManager.enableElementById('itemMarkAsUnreadButton');
    }
  }

  disableButtonsForSingleElement() {
    this._buttonsForSingleElementEnabled = false;
    CssManager.disableElementById('itemMarkAsReadButton');
    CssManager.disableElementById('itemMarkAsUnreadButton');
  }

  enableButtonsForSingleElement() {
    this._buttonsForSingleElementEnabled = true;
    let selectedElement =  ItemsPanel.instance.selectionBarItems.selectedElement;
    if (selectedElement) {
      let isVisited = selectedElement.classList.contains('visited');
      if (isVisited) {
        CssManager.disableElementById('itemMarkAsReadButton');
        CssManager.enableElementById('itemMarkAsUnreadButton');
      } else {
        CssManager.enableElementById('itemMarkAsReadButton');
        CssManager.disableElementById('itemMarkAsUnreadButton');
      }
    }
    else {
      CssManager.disableElementById('itemMarkAsReadButton');
      CssManager.disableElementById('itemMarkAsUnreadButton');
    }
  }

  _updateLocalizedStrings() {
    document.getElementById('itemMarkAsReadButton').setAttribute('title', browser.i18n.getMessage('sbMarkAsRead'));
    document.getElementById('itemMarkAsUnreadButton').setAttribute('title', browser.i18n.getMessage('sbMarkAsUnread'));
    document.getElementById('itemMarkAllAsReadButton').setAttribute('title', browser.i18n.getMessage('sbMarkAllAsRead'));
    document.getElementById('itemMarkAllAsUnreadButton').setAttribute('title', browser.i18n.getMessage('sbMarkAllAsUnread'));
    document.getElementById('itemOpenUnreadButton').setAttribute('title', browser.i18n.getMessage('sbOpenUnreadItemsInNewTabs'));
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
