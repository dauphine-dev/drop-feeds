/*global browser BrowserManager ItemsPanel ItemsMenu*/
'use strict';
class ItemManager { /*exported ItemManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
  }

  addItemClickEvents() {
    let elItemList = document.getElementById('itemsPane').querySelectorAll('.item');
    for (let elItem of elItemList) {
      elItem.addEventListener('click', (e) => { this._itemOnClick_event(e); });
      elItem.addEventListener('mouseup', (e) => { this._itemOnMouseUp_event(e); });
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

  async openAllUnreadItems_async() {
    let elItemList = document.getElementById('itemsPane').querySelectorAll('.item:not(.visited)');
    for (let elItem of elItemList) {
      let itemLink = elItem.getAttribute('href');
      await this._openTabItem_async(itemLink, true);
      elItem.classList.add('visited');
    }
    ItemsMenu.instance.enableButtonsForSingleElement();
  }

  setTooltipVisibility(tooltipVisible) {
    let attOldName = tooltipVisible ? 'title1' : 'title';
    let attNewName = tooltipVisible ? 'title' : 'title1';
    let elItemList = document.getElementById('itemsPane').querySelectorAll('.item');
    for (let elItem of elItemList) {
      BrowserManager.renameAttribute(elItem, attOldName, attNewName);
    }
  }

  async _itemOnClick_event(event) {
    ItemsPanel.instance.selectionBarItems.put(event.target);
    let itemLink = event.target.getAttribute('href');
    await this._openTabItem_async(itemLink);
    event.target.classList.add('visited');
    ItemsMenu.instance.enableButtonsForSingleElement();
  }

  async _itemOnMouseUp_event (event) {
    if (event.button == 1) { //middle-click
      ItemsPanel.instance.selectionBarItems.put(event.target);
      let itemLink = event.target.getAttribute('href');
      let openNewTabBackGroundForce = true;
      await this._openTabItem_async(itemLink, null, openNewTabBackGroundForce);
      event.target.classList.add('visited');
      ItemsMenu.instance.enableButtonsForSingleElement();
    }
  }

  async _openTabItem_async(itemLink, openNewTabForce, openNewTabBackGroundForce) {
    await BrowserManager.instance.openTab_async(itemLink, openNewTabForce, openNewTabBackGroundForce);
  }

}
