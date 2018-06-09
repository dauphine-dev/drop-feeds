/*global DefaultValues BrowserManager FeedParser SplitterBar Listener ListenerProviders SideBar ItemsMenu ItemManager SelectionBarItems*/
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
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemList', ItemsPanel._setFeedItemList_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemDescriptionTooltips', ItemsPanel._feedItemDescriptionTooltips_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemListToolbar', ItemsPanel._feedItemListToolbar_sbscrb, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemMarkAsReadOnLeaving', ItemsPanel._feedItemMarkAsReadOnLeaving_sbscrb, true);
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
    let titleHtml = FeedParser.parseItemsTitleToHtml(title, titleLink);
    BrowserManager.setInnerHtmlById('itemsTitle', titleHtml);
  }

  async _displayItems_async(itemList) {
    let itemsHtml = await FeedParser.parseItemListToHtml_async(itemList, this._feedItemDescriptionTooltips);
    BrowserManager.setInnerHtmlById('itemsPane', itemsHtml);
    //itemsHtml.length > 0 ? ItemsMenu.instance.enableButtons() : ItemsMenu.instance.disableButtons();
    if (itemsHtml.length > 0) {
      ItemsMenu.instance.enableButtons();
    }
    else {
      ItemsMenu.instance.disableButtons();
    }
  }

  static _setFeedItemList_sbscrb(value) {
    let self = ItemsPanel.instance;
    self._feedItemList = value;
    self._setVisibility();
  }

  static _feedItemDescriptionTooltips_sbscrb(value) {
    let self = ItemsPanel.instance;
    self._feedItemDescriptionTooltips = value;
    self._setTooltipsVisibility();
  }

  static _feedItemListToolbar_sbscrb(value) {
    let self = ItemsPanel.instance;
    self._feedItemListToolbar = value;
    self._setToolbarVisibility();
  }

  static _feedItemMarkAsReadOnLeaving_sbscrb(value) {
    let self = ItemsPanel.instance;
    self._feedItemMarkAsReadOnLeaving = value;
  }

  _setVisibility() {
    this._mainItemsPane.style.display = this._feedItemList ? 'block' : 'none';
    SideBar.instance.setContentHeight();
  }

  _setTooltipsVisibility() {
    ItemManager.setTooltipVisibility(this._feedItemDescriptionTooltips);
  }

  _setToolbarVisibility() {
    this._itemsPaneToolBar.style.display = this._feedItemListToolbar ? 'block' : 'none';
  }

}