/*global DefaultValues BrowserManager FeedRenderer SplitterBar Listener ListenerProviders LocalStorageManager */
/*global SideBar ItemsToolBar ItemManager ItemsSelectionBar RenderItemLayout FeedsTreeView */
'use strict';
class ItemsLayout { /*exported ItemsLayout*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._splitterBar1 = new SplitterBar('splitterBar1');
    ItemsToolBar.instance.init_async();
    ItemsToolBar.instance.disableButtons();
    this._selectionBarItems = new ItemsSelectionBar();
    this._itemLayoutCell = document.getElementById('itemLayoutCell');
    this._itemsPaneTitleBar = document.getElementById('itemsPaneTitleBar');
    this._itemsPaneToolBar = document.getElementById('itemsPaneToolBar');
    this._itemsContentPanel = document.getElementById('itemsContentPanel');
    this._feedItemListVisible = DefaultValues.feedItemList;
    this._visible = false;
    this._feedItemListToolbar = DefaultValues.feedItemListToolbar;
    this._feedItemDescriptionTooltips = DefaultValues.feedItemDescriptionTooltips;
    this._feedItemMarkAsReadOnLeaving = DefaultValues.feedItemMarkAsReadOnLeaving;
    this._itemList = [];
    Listener.instance.subscribe(ListenerProviders.message, 'displayItems', (v) => { this._displayItems_sbscrb(v); }, false);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemList', (v) => { this._setFeedItemList_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemDescriptionTooltips', (v) => { this._feedItemDescriptionTooltips_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemListToolbar', (v) => { this._feedItemListToolbar_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemMarkAsReadOnLeaving', (v) => { this._feedItemMarkAsReadOnLeaving_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedsContentHeightItemsOpened', (v) => { this._feedsContentHeightRenderOpened_async(v); }, true);
    this._itemsContentPanel.addEventListener('scroll', (e) => { this._contentOnScroll_event(e); });
  }

  async init_async() {
    let itemsContentHeightRenderClosed = await LocalStorageManager.getValue_async('itemsContentHeightRenderClosed', window.innerHeight / 3);
    let itemsContentHeightRenderOpened = await LocalStorageManager.getValue_async('itemsContentHeightRenderOpened', window.innerHeight / 3);
    setTimeout(() => { 
      this._setVisibility();
      this._setToolbarVisibility();
      let itemsContentHeight = RenderItemLayout.instance.visible ? itemsContentHeightRenderOpened : itemsContentHeightRenderClosed;
      ItemsLayout.instance.setContentHeight(itemsContentHeight); 
    }, 15);
  }

  get visible() {
    return this._feedItemListVisible;
  }

  get top() {
    let top = window.innerHeight;
    if (this._feedItemListVisible) {
      top = this._splitterBar1.top;
    }
    return top;
  }

  get element() {
    return this._itemsContentPanel;
  }

  get splitterBar1() {
    return this._splitterBar1;
  }

  get itemsMenu() {
    return ItemsToolBar.instance;
  }

  get selectionBarItems() {
    return this._selectionBarItems;
  }

  get itemList() {
    return this._itemList;
  }

  async displayItems_async(itemsTitle, titleLink, items) {
    this._selectionBarItems.hide();
    this._setTitle(itemsTitle, titleLink);
    this._markAllIPreviousItemsAsRead();
    await this._displayItems_async(items);
    ItemManager.instance.addItemClickEvents();
    this.resize();
  }

  resize() {
    let rec = this._itemsContentPanel.getBoundingClientRect();
    let height = Math.max(RenderItemLayout.instance.top - rec.top, 0);
    BrowserManager.setElementHeight(this._itemsContentPanel, height);
    document.getElementById('itemLayoutCell').style.width  = window.innerWidth + 'px';
    document.getElementById('itemsPaneTitleBar').style.width  = window.innerWidth + 'px';
    document.getElementById('itemsPaneToolBar').style.width  = window.innerWidth + 'px';
    this._itemsContentPanel.style.width  = window.innerWidth + 'px';

    this._resizeBackgroundDiv();
    ItemsLayout.instance.selectionBarItems.refresh();
  }

  setContentHeight(height) {
    BrowserManager.setElementHeight(this._itemsContentPanel, height);
    let rectContent = this._itemsContentPanel.getBoundingClientRect();  
    let maxHeight = Math.max(window.innerHeight - rectContent.top - RenderItemLayout.instance.splitterBar2.element.offsetHeight - 1, 0);
    if (this._itemsContentPanel.offsetHeight  > maxHeight) {
      height = maxHeight;
      BrowserManager.setElementHeight(this._itemsContentPanel, height);
    }
    if (RenderItemLayout.instance.visible) {
      LocalStorageManager.setValue_async('itemsContentHeightRenderOpened', height);
    }
    else {
      LocalStorageManager.setValue_async('itemsContentHeightRenderClosed', height);
    }
    this._resizeBackgroundDiv();
    ItemsLayout.instance.selectionBarItems.refresh();
    return height;
  }

  increaseContentHeight(offset) {
    let prevOffsetHeight = this._itemsContentPanel.offsetHeight;
    let height = Math.max(this._itemsContentPanel.offsetHeight + offset, 0);
    this.setContentHeight(height);
    let delta = this._itemsContentPanel.offsetHeight - prevOffsetHeight;
    return delta;
  }

  _resizeBackgroundDiv() {
    let rec = this._itemLayoutCell.getBoundingClientRect();
    let itemLayoutBackgroundEl = document.getElementById('itemLayoutBackground');
    itemLayoutBackgroundEl.style.left = rec.left + 'px';
    itemLayoutBackgroundEl.style.width = rec.width + 'px';
    itemLayoutBackgroundEl.style.top = rec.top + 'px';
    itemLayoutBackgroundEl.style.height = rec.height + 'px';
  }

  _markAllIPreviousItemsAsRead() {
    if (this._feedItemListVisible && this._feedItemMarkAsReadOnLeaving) {
      ItemManager.instance.markAllItemsAsRead();
    }
  }

  _setTitle(title, titleLink) {
    let titleHtml = FeedRenderer.renderItemsTitleToHtml(title, titleLink);
    BrowserManager.setInnerHtmlById('itemsTitle', titleHtml);
  }

  async _displayItems_async(itemList) {
    this._itemList = itemList;
    let itemsHtml = await FeedRenderer.renderItemListToHtml_async(itemList, this._feedItemDescriptionTooltips);
    BrowserManager.setInnerHtmlById('itemsContentPanel', itemsHtml);

    if (itemsHtml.length > 0) {
      ItemsToolBar.instance.enableButtons();
    }
    else {
      ItemsToolBar.instance.disableButtons();
    }
    RenderItemLayout.instance.clear();
  }

  async _setFeedItemList_sbscrb(value) {
    this._feedItemListVisible = value;
    this._setVisibility();
  }

  async _feedItemDescriptionTooltips_sbscrb(value) {
    this._feedItemDescriptionTooltips = value;
    this._setTooltipsVisibility();
  }

  async _feedItemListToolbar_sbscrb(value) {
    this._feedItemListToolbar = value;
    this._setToolbarVisibility();
  }

  async _feedItemMarkAsReadOnLeaving_sbscrb(value) {
    this._feedItemMarkAsReadOnLeaving = value;
  }

  async _displayItems_sbscrb(value) {
    await this.displayItems_async(value.itemsTitle, value.titleLink, value.items);
  }

  _setVisibility() {
    let prevVisible = this._visible;
    this._visible = this._feedItemListVisible;
    if (!prevVisible && this._visible && this._feedsContentHeightRenderOpened) {
      FeedsTreeView.instance.setContentHeight(this._feedsContentHeightRenderOpened);
    }
    this._itemLayoutCell.style.display = this._visible ? 'table-cell' : 'none';
    document.getElementById('itemLayoutBackground').style.display = this._visible ? 'block' : 'none';
    this._splitterBar1.visible = this._visible;
    SideBar.instance.resize();
    setTimeout(() => { SideBar.instance.resize(); }, 20);    
    RenderItemLayout.instance.setVisibility();
  }

  _setTooltipsVisibility() {
    ItemManager.instance.setTooltipVisibility(this._feedItemDescriptionTooltips);
  }

  _setToolbarVisibility() {
    this._itemsPaneToolBar.style.display = this._feedItemListToolbar ? 'block' : 'none';
  }
  
  async _contentOnScroll_event(){
    ItemsLayout.instance.selectionBarItems.refresh();
  }

  _feedsContentHeightRenderOpened_async(value) {
    this._feedsContentHeightRenderOpened = value;
  }

}