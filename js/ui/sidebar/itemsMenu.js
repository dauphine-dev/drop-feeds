/*global browser ItemManager ItemsPanel CssManager*/
'use strict';
class ItemsMenu { /*exported ItemsMenu*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._buttonsEnabled = false;
    this._buttonsForSingleElementEnabled = false;
    this._updateLocalizedStrings();
    document.getElementById('itemMarkAsReadButton').addEventListener('click', (e) => { this._itemMarkAsReadButtonClicked_event(e); });
    document.getElementById('itemMarkAsUnreadButton').addEventListener('click', (e) => { this._itemMarkAsUnreadButtonClicked_event(e); });
    document.getElementById('itemMarkAllAsReadButton').addEventListener('click', (e) => { this._itemMarkAllAsReadButtonClicked_event(e); });
    document.getElementById('itemMarkAllAsUnreadButton').addEventListener('click', (e) => { this._itemMarkAllAsUnreadButtonClicked_event(e); });
    document.getElementById('itemOpenUnreadButton').addEventListener('click', (e) => { this._itemOpenUnreadButtonClicked_event(e); });
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

  async _itemMarkAsReadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this._buttonsForSingleElementEnabled) { return; }
    let elItem = ItemsPanel.instance.selectionBarItems.selectedElement;
    ItemManager.instance.markItemAsRead(elItem);
  }

  async _itemMarkAsUnreadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this._buttonsForSingleElementEnabled) { return; }
    let elItem = ItemsPanel.instance.selectionBarItems.selectedElement;
    ItemManager.instance.markItemAsUnread(elItem);
  }

  async _itemMarkAllAsReadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this._buttonsEnabled) { return; }
    ItemManager.instance.markAllItemsAsRead();
  }

  async _itemMarkAllAsUnreadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this._buttonsEnabled) { return; }
    ItemManager.instance.markAllItemsAsUnread();
  }

  async _itemOpenUnreadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this._buttonsEnabled) { return; }
    ItemManager.instance.openAllUnreadItems_async();
  }
}
