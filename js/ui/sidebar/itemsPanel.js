/*global DefaultValues BrowserManager FeedRenderer SplitterBar Listener ListenerProviders SideBar ItemsMenu ItemManager SelectionBarItems*/
'use strict';
class ItemsPanel { /*exported ItemsPanel*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    SplitterBar.instance.init_async();
    ItemsMenu.instance.disableButtons();
    this._selectionBarItems = new SelectionBarItems();
    this._mainItemsPane = document.getElementById('mainItemsPane');
    this._itemsPaneTitleBar = document.getElementById('itemsPaneTitleBar');
    this._itemsPaneToolBar = document.getElementById('itemsPaneToolBar');
    this._itemsPane = document.getElementById('itemsPane');
    this._feedItemList = DefaultValues.feedItemList;
    this._feedItemListToolbar = DefaultValues.feedItemListToolbar;
    this._feedItemDescriptionTooltips = DefaultValues.feedItemDescriptionTooltips;
    this._feedItemMarkAsReadOnLeaving = DefaultValues.feedItemMarkAsReadOnLeaving;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemList', (v) => { this._setFeedItemList_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemDescriptionTooltips', (v) => { this._feedItemDescriptionTooltips_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemListToolbar', (v) => { this._feedItemListToolbar_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemMarkAsReadOnLeaving', (v) => { this._feedItemMarkAsReadOnLeaving_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.message, 'displayItems', (v) => { this._displayItems_sbscrb(v); }, false);
  }

  get top() {
    if (this._feedItemList) {
      return this._mainItemsPane.offsetTop;
    }
    else {
      return window.innerHeight;
    }
  }

  set top(value) {
    this._mainItemsPane.style.top = value + 'px';
  }

  get splitterBar() {
    return SplitterBar.instance;
  }

  get itemsMenu() {
    return ItemsMenu.instance;
  }

  get selectionBarItems() {
    return this._selectionBarItems;
  }

  async displayItems_async(itemsTitle, titleLink, items) {
    this._selectionBarItems.hide();
    this._setTitle(itemsTitle, titleLink);
    this._markAllIPreviousItemsAsRead();
    await this._displayItems_async(items);
    ItemManager.instance.addItemClickEvents();
    this.setContentHeight();
  }

  setContentHeight() {
    let height = Math.max(window.innerHeight - this._mainItemsPane.offsetTop - this._itemsPane.offsetTop, 0);
    this._itemsPane.style.height = height + 'px';
  }

  _markAllIPreviousItemsAsRead() {
    if (this._feedItemMarkAsReadOnLeaving) {
      ItemManager.instance.markAllItemsAsRead();
    }
  }

  _setTitle(title, titleLink) {
    let titleHtml = FeedRenderer.renderItemsTitleToHtml(title, titleLink);
    BrowserManager.setInnerHtmlById('itemsTitle', titleHtml);
  }

  async _displayItems_async(itemList) {
    let itemsHtml = await FeedRenderer.renderItemListToHtml_async(itemList, this._feedItemDescriptionTooltips);
    BrowserManager.setInnerHtmlById('itemsPane', itemsHtml, true);

    if (itemsHtml.length > 0) {
      ItemsMenu.instance.enableButtons();
    }
    else {
      ItemsMenu.instance.disableButtons();
    }
  }

  async _setFeedItemList_sbscrb(value) {
    this._feedItemList = value;
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
    this.displayItems_async(value.itemsTitle, value.titleLink, value.items);
  }

  _setVisibility() {
    this._mainItemsPane.style.display = this._feedItemList ? 'block' : 'none';
    SideBar.instance.setContentHeight();
  }

  _setTooltipsVisibility() {
    ItemManager.instance.setTooltipVisibility(this._feedItemDescriptionTooltips);
  }

  _setToolbarVisibility() {
    this._itemsPaneToolBar.style.display = this._feedItemListToolbar ? 'block' : 'none';
  }

}