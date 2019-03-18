/*global browser BrowserManager ItemsLayout ItemsToolBar Listener ListenerProviders DefaultValues RenderItemLayout*/
'use strict';
class ItemManager { /*exported ItemManager*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._feedItemRenderInSidebar = DefaultValues.feedItemRenderInSidebar;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemRenderInSidebar', (v) => { this._renderItemLayoutEnabled_async(v); }, true);
  }

  addItemClickEvents() {
    let elItemList = document.getElementById('itemsContentPanel').querySelectorAll('.item');
    for (let elItem of elItemList) {
      elItem.addEventListener('click', (e) => { this._itemOnClick_event(e); });
      elItem.addEventListener('mousedown', (e) => { this._itemOnMouseDown_event(e); });
      elItem.addEventListener('mouseup', (e) => { this._itemOnMouseUp_event(e); });
    }
  }

  markItemAsRead(elItem) {
    let itemLink = elItem.getAttribute('href');
    browser.history.addUrl({ url: itemLink });
    elItem.classList.add('visited');
    elItem.classList.add('visitedVisible');    
    ItemsToolBar.instance.enableButtonsForSingleElement();
  }

  markItemAsUnread(elItem) {
    let itemLink = elItem.getAttribute('href');
    browser.history.deleteUrl({ url: itemLink });
    elItem.classList.remove('visited');
    elItem.classList.remove('visitedVisible');    
    ItemsToolBar.instance.enableButtonsForSingleElement();
  }

  markAllItemsAsRead() {
    let elItemList = document.getElementById('itemsContentPanel').querySelectorAll('.item:not(.visited)');
    for (let elItem of elItemList) {
      try {
        let itemLink = elItem.getAttribute('href');
        browser.history.addUrl({ url: itemLink });
        elItem.classList.add('visited');
        elItem.classList.add('visitedVisible');
      }
      catch (e) { }
    }
    ItemsToolBar.instance.enableButtonsForSingleElement();
  }

  markAllItemsAsUnread() {
    let elItemList = document.getElementById('itemsContentPanel').querySelectorAll('.visited');
    if (!elItemList) { return; }
    for (let elItem of elItemList) {
      let itemLink = elItem.getAttribute('href');
      browser.history.deleteUrl({ url: itemLink });
      elItem.classList.remove('visited');
      elItem.classList.remove('visitedVisible');    
    }
    ItemsToolBar.instance.enableButtonsForSingleElement();
  }

  async openAllUnreadItems_async() {
    let elItemList = document.getElementById('itemsContentPanel').querySelectorAll('.item:not(.visited)');
    for (let elItem of elItemList) {
      let itemLink = elItem.getAttribute('href');
      await this.openItem_async(itemLink, true);
      elItem.classList.add('visited');
      elItem.classList.add('visitedVisible');
    }
    ItemsToolBar.instance.enableButtonsForSingleElement();
  }

  setTooltipVisibility(tooltipVisible) {
    let attOldName = tooltipVisible ? 'title1' : 'title';
    let attNewName = tooltipVisible ? 'title' : 'title1';
    let elItemList = document.getElementById('itemsContentPanel').querySelectorAll('.item');
    for (let elItem of elItemList) {
      BrowserManager.renameAttribute(elItem, attOldName, attNewName);
    }
  }

  async _itemOnClick_event(event) {
    ItemsLayout.instance.selectionBarItems.put(event.target);
    let itemLink = event.target.getAttribute('href');
    let itemNum = event.target.getAttribute('num') - 1;
    let openNewTabForce = false, openNewTabBackGroundForce = false;
    await this.openItem_async(itemLink, openNewTabForce, openNewTabBackGroundForce, itemNum);
    event.target.classList.add('visited');
    event.target.classList.add('visitedVisible');    
    ItemsToolBar.instance.enableButtonsForSingleElement();
  }

  async _itemOnMouseDown_event (event) {
    event.preventDefault();
  }

  async _itemOnMouseUp_event(event) {
    if (event.button == 1) { //middle-click
      ItemsLayout.instance.selectionBarItems.put(event.target);
      let itemLink = event.target.getAttribute('href');
      let itemNum = event.target.getAttribute('num') - 1;
      let openNewTabForce = true, openNewTabBackGroundForce = true;
      await this.openItem_async(itemLink, openNewTabForce, openNewTabBackGroundForce, itemNum);
      event.target.classList.add('visited');
      event.target.classList.add('visitedVisible');
      ItemsToolBar.instance.enableButtonsForSingleElement();
    }
  }

  async _openTabItem_async(itemLink, openNewTabForce, openNewTabBackGroundForce) {
    await BrowserManager.instance.openTab_async(itemLink, openNewTabForce, openNewTabBackGroundForce);
  }

  async openItem_async(itemLink, openNewTabForce, openNewTabBackGroundForce, itemNum) {
    if (this._feedItemRenderInSidebar) {
      let item = ItemsLayout.instance.itemList[itemNum];
      browser.history.addUrl({ url: itemLink });
      RenderItemLayout.instance.displayItem(item);
    } 
    if (!this._feedItemRenderInSidebar || openNewTabForce || openNewTabBackGroundForce) {
      await this._openTabItem_async(itemLink, openNewTabForce, openNewTabBackGroundForce);
    }
  }

  async _renderItemLayoutEnabled_async(value) {
    this._feedItemRenderInSidebar = value;
  }

}
