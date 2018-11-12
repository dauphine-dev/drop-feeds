/*global DefaultValues BrowserManager FeedRenderer SplitterBar Listener ListenerProviders LocalStorageManager */
/*global SideBar ItemsToolBar ItemManager ItemsSelectionBar RenderItemLayout CssManager */
'use strict';
class ItemsLayout { /*exported ItemsLayout*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._splitterBar1 = new SplitterBar('splitterBar1');
    ItemsToolBar.instance.disableButtons();
    this._selectionBarItems = new ItemsSelectionBar();
    this._itemLayoutCell = document.getElementById('itemLayoutCell');
    this._itemsPaneTitleBar = document.getElementById('itemsPaneTitleBar');
    this._itemsPaneToolBar = document.getElementById('itemsPaneToolBar');
    this._itemsContentPanel = document.getElementById('itemsContentPanel');
    this._feedItemList = DefaultValues.feedItemList;
    this._feedItemListToolbar = DefaultValues.feedItemListToolbar;
    this._feedItemDescriptionTooltips = DefaultValues.feedItemDescriptionTooltips;
    this._feedItemMarkAsReadOnLeaving = DefaultValues.feedItemMarkAsReadOnLeaving;
  }

  async init_async() {
    let itemsContentHeight = await LocalStorageManager.getValue_async('itemsContentHeight', window.innerHeight / 3);
    if (itemsContentHeight) {
      this.setContentHeight(itemsContentHeight);
    }
    Listener.instance.subscribe(ListenerProviders.message, 'displayItems', (v) => { this._displayItems_sbscrb(v); }, false);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemList', (v) => { this._setFeedItemList_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemDescriptionTooltips', (v) => { this._feedItemDescriptionTooltips_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemListToolbar', (v) => { this._feedItemListToolbar_sbscrb(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemMarkAsReadOnLeaving', (v) => { this._feedItemMarkAsReadOnLeaving_sbscrb(v); }, true);
    this._itemsContentPanel.addEventListener('scroll', (e) => { this._contentOnScroll_event(e); });
  }

  get top() {
    let top = RenderItemLayout.instance.top;
    if (this._feedItemList) {
      top = this._splitterBar1.top;
    }
    return top;
  }

  get itemsMenu() {
    return ItemsToolBar.instance;
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
    this.resize();
  }

  resize() {
    let rec = this._itemsContentPanel.getBoundingClientRect();
    let height = Math.max(RenderItemLayout.instance.top - rec.top, 0);
    //this._itemsContentPanel.style.height = height + 'px';
    CssManager.replaceStyle('.itemsContentHeight', '  height:' + height + 'px;');
    this._itemsContentPanel.style.width  = window.innerWidth + 'px';
    this._resizeBackgroundDiv();
    ItemsLayout.instance.selectionBarItems.refresh();
  }

  setContentHeight(height) {
    //this._itemsContentPanel.style.height =  height + 'px;';
    CssManager.replaceStyle('.itemsContentHeight', '  height:' + height + 'px;');

    
    let rectContent = this._itemsContentPanel.getBoundingClientRect();
    let maxHeight = Math.max(window.innerHeight - rectContent.top - document.getElementById('splitterBar2').offsetHeight, 0);
    if (this._itemsContentPanel.offsetHeight  > maxHeight) {
      //this._itemsContentPanel.style.height =  maxHeight + 'px;';
      CssManager.replaceStyle('.itemsContentHeight', '  height:' + height + 'px;');

    }
    LocalStorageManager.setValue_async('itemsContentHeight', height);
    this._resizeBackgroundDiv();
    
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
    BrowserManager.setInnerHtmlById('itemsContentPanel', itemsHtml, true);

    if (itemsHtml.length > 0) {
      ItemsToolBar.instance.enableButtons();
    }
    else {
      ItemsToolBar.instance.disableButtons();
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
    this._itemLayoutCell.style.display = this._feedItemList ? 'block' : 'none';
    SideBar.instance.resize();
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
}