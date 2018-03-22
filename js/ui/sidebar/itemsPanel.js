/*global DefaultValues BrowserManager FeedParser SplitterBar Listener ListenerProviders SideBar*/
'use strict';
class ItemsPanel { /*exported ItemsPanel*/
  static get instance() {
    if (!this._instance) {
      this._instance = new ItemsPanel();
    }
    return this._instance;
  }

  constructor() {
    this._mainItemsPane = document.getElementById('mainItemsPane');
    this._itemsPaneTitleBar = document.getElementById('itemsPaneTitleBar');
    this._itemsPaneToolBar = document.getElementById('itemsPaneToolBar');
    this._itemsPane = document.getElementById('itemsPane');
    this._feedItemList = DefaultValues.feedItemList;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemList', ItemsPanel._setFeedItemList_sbscrb, true);
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

  async displayItems_async(itemsTitle, titleLink, items) {
    this._setTitle(itemsTitle, titleLink);
    await this._displayItems_async(items);
    this._addItemClickEvents();
  }


  setContentHeight() {
    let toRemove = SplitterBar.instance.height + this._itemsPaneTitleBar.offsetHeight + this._itemsPaneToolBar.offsetHeight;
    let height = Math.max(window.innerHeight - this._mainItemsPane.offsetTop - toRemove, 0);
    this._mainItemsPane.style.height = height + 'px';
  }

  _setTitle(title, titleLink) {
    let titleHtml = FeedParser.parseItemsTitleToHtml(title, titleLink);
    BrowserManager.setInnerHtmlById('itemsTitle', titleHtml);
  }

  async _displayItems_async(itemList) {
    let itemsHtml = await FeedParser.parseItemListToHtml_async(itemList);
    BrowserManager.setInnerHtmlById('itemsPane', itemsHtml);
  }

  _addItemClickEvents() {
    let elItemList = document.getElementById('itemsPane').querySelectorAll('.item');
    for (let elItem of elItemList) {
      elItem.addEventListener('click', ItemsPanel._itemOnClick_event);
    }
  }

  static _itemOnClick_event(event) {
    let itemLink = event.target.getAttribute('href');
    event.target.classList.add('visited');
    BrowserManager.instance.openTab_async(itemLink);
  }

  static _setFeedItemList_sbscrb(value) {
    let self = ItemsPanel.instance;
    self._feedItemList = value;
    self._setVisibility();
  }

  _setVisibility() {
    this._mainItemsPane.style.display = this._feedItemList ? 'block' : 'none';
    SideBar.instance.setContentHeight();
  }

}