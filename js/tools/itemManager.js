/*global browser BrowserManager ItemsPanel ItemsMenu*/
'use strict';
class ItemManager { /*exported ItemManager*/
  static get instance() {
    if (!this._instance) {
      this._instance = new ItemManager();
    }
    return this._instance;
  }

  constructor() {
  }

  addItemClickEvents() {
    let elItemList = document.getElementById('itemsPane').querySelectorAll('.item');
    for (let elItem of elItemList) {
      elItem.addEventListener('click', ItemManager._itemOnClick_event);
    }
  }

  markItemAsRead(elItem) {
    let itemLink = elItem.getAttribute('href');
    browser.history.addUrl({url: itemLink});
    elItem.classList.add('visited');
    ItemsMenu.instance.enableButtonsForSingleElement();
  }

  markItemAsUnread(elItem) {
    let itemLink = elItem.getAttribute('href');
    browser.history.deleteUrl({url: itemLink});
    elItem.classList.remove('visited');
    ItemsMenu.instance.enableButtonsForSingleElement();
  }

  markAllItemsAsRead() {
    let elItemList = document.getElementById('itemsPane').querySelectorAll('.item:not(.visited)');
    for (let elItem of elItemList) {
      let itemLink = elItem.getAttribute('href');
      browser.history.addUrl({url: itemLink});
      elItem.classList.add('visited');
    }
    ItemsMenu.instance.enableButtonsForSingleElement();
  }

  markAllItemsAsUnread() {
    let elItemList = document.getElementById('itemsPane').querySelectorAll('.visited');
    if(!elItemList) { return; }
    for (let elItem of elItemList) {
      let itemLink = elItem.getAttribute('href');
      browser.history.deleteUrl({url: itemLink});
      elItem.classList.remove('visited');
    }
    ItemsMenu.instance.enableButtonsForSingleElement();
  }

  openAllUnreadItems_async() {
    let elItemList = document.getElementById('itemsPane').querySelectorAll('.item:not(.visited)');
    for (let elItem of elItemList) {
      let itemLink = elItem.getAttribute('href');
      BrowserManager.instance.openTab_async(itemLink, true);
      elItem.classList.add('visited');
    }
    ItemsMenu.instance.enableButtonsForSingleElement();
  }

  static _itemOnClick_event(event) {
    ItemsPanel.instance.selectionBarItems.put(event.target);
    let itemLink = event.target.getAttribute('href');
    BrowserManager.instance.openTab_async(itemLink);
    event.target.classList.add('visited');
    ItemsMenu.instance.enableButtonsForSingleElement();
  }
}
