/*global browser BrowserManager ItemsLayout ItemsToolBar Listener ListenerProviders DefaultValues RenderItemLayout ItemStatusManager*/
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

  async markItemAsRead(elItem) {
    let itemLink = elItem.getAttribute('href');
    
    // Initialize ItemStatusManager for cross-window storage sync
    await ItemStatusManager.instance.initAsync();
    
    browser.history.addUrl({ url: itemLink });
    elItem.classList.add('visited');
    elItem.classList.add('visitedVisible');
    ItemsToolBar.instance.enableButtonsForSingleElement();
    
    // Store status in sync storage for cross-window synchronization (works even when items not displayed)
    await ItemStatusManager.instance.markItemReadAsync(itemLink);
    
    // Also broadcast via message for immediate UI updates
    browser.runtime.sendMessage({
      key: 'itemMarkedAsRead',
      value: { url: itemLink, timestamp: Date.now() }
    }).catch(e => {
      // Ignore errors if no listeners are present
    });
  }

  async markItemAsUnread(elItem) {
    let itemLink = elItem.getAttribute('href');
    
    // Initialize ItemStatusManager for cross-window storage sync
    await ItemStatusManager.instance.initAsync();
    
    browser.history.deleteUrl({ url: itemLink });
    elItem.classList.remove('visited');
    elItem.classList.remove('visitedVisible');
    ItemsToolBar.instance.enableButtonsForSingleElement();
    
    // Store status in sync storage for cross-window synchronization (works even when items not displayed)
    await ItemStatusManager.instance.markItemUnreadAsync(itemLink);
    
    // Also broadcast via message for immediate UI updates
    browser.runtime.sendMessage({
      key: 'itemMarkedAsUnread',
      value: { url: itemLink, timestamp: Date.now() }
    }).catch(e => {
      // Ignore errors if no listeners are present
    });
  }

  async markAllItemsAsRead() {
    let elItemList = document.getElementById('itemsContentPanel').querySelectorAll('.item:not(.visited)');
    
    // Initialize ItemStatusManager for cross-window storage sync
    await ItemStatusManager.instance.initAsync();
    
    const promises = [];
    for (let elItem of elItemList) {
      try {
        let itemLink = elItem.getAttribute('href');
        browser.history.addUrl({ url: itemLink });
        elItem.classList.add('visited');
        elItem.classList.add('visitedVisible');
        
        // Store status in sync storage for cross-window synchronization
        promises.push(ItemStatusManager.instance.markItemReadAsync(itemLink));
        
        // Also broadcast via message for immediate UI updates
        browser.runtime.sendMessage({
          key: 'itemMarkedAsRead',
          value: { url: itemLink, timestamp: Date.now() }
        }).catch(e => {
          // Ignore errors if no listeners are present
        });
      }
      catch (e) { }
    }
    
    // Wait for all status updates to be saved
    await Promise.all(promises);
    ItemsToolBar.instance.enableButtonsForSingleElement();
  }

  async markAllItemsAsUnread() {
    let elItemList = document.getElementById('itemsContentPanel').querySelectorAll('.visited');
    
    // Initialize ItemStatusManager for cross-window storage sync
    await ItemStatusManager.instance.initAsync();
    
    if (!elItemList) { return; }
    const promises = [];
    for (let elItem of elItemList) {
      let itemLink = elItem.getAttribute('href');
      browser.history.deleteUrl({ url: itemLink });
      elItem.classList.remove('visited');
      elItem.classList.remove('visitedVisible');
      
      // Store status in sync storage for cross-window synchronization
      promises.push(ItemStatusManager.instance.markItemUnreadAsync(itemLink));
    }
    
    // Wait for all status updates to be saved
    await Promise.all(promises);
    ItemsToolBar.instance.enableButtonsForSingleElement();
  }

  /**
   * Check if an item URL is marked as read using storage-based tracking
   * This works even when items are not currently displayed in the UI
   * @param {string} url - Item URL to check
   * @returns {Promise<boolean>} True if item is marked as read
   */
  async isItemReadAsync(url) {
    await ItemStatusManager.instance.initAsync();
    return ItemStatusManager.instance.isItemRead(url);
  }

  /**
   * Apply visited class to items based on storage-based tracking
   * This should be called when displaying new content to ensure correct visual state
   */
  async applyVisitedStateToDisplayedItems() {
    await ItemStatusManager.instance.initAsync();
    
    const elItemList = document.querySelectorAll('#itemsContentPanel .item');
    for (let elItem of elItemList) {
      let itemLink = elItem.getAttribute('href');
      if (!itemLink) continue;
      
      // Check storage-based tracking first
      const isRead = ItemStatusManager.instance.isItemRead(itemLink);
      
      if (isRead && !elItem.classList.contains('visited')) {
        elItem.classList.add('visited');
        elItem.classList.add('visitedVisible');
      } else if (!isRead && elItem.classList.contains('visited')) {
        elItem.classList.remove('visited');
        elItem.classList.remove('visitedVisible');
      }
    }
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
    
    // Broadcast to other windows for cross-window synchronization
    browser.runtime.sendMessage({
      key: 'itemMarkedAsRead',
      value: { url: itemLink, timestamp: Date.now() }
    }).catch(e => {
      // Ignore errors if no listeners are present
    });
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
