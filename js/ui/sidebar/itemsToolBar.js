/*global browser ItemManager ItemsLayout CssManager DefaultValues LocalStorageManager*/
'use strict';
class ItemsToolBar { /*exported ItemsToolBar*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._buttonsEnabled = false;
    this._buttonsForSingleElementEnabled = false;
    this._hideReadArticles = DefaultValues.hideReadArticles;
    this._updateLocalizedStrings();
    document.getElementById('itemMarkAsReadButton').addEventListener('click', (e) => { this._itemMarkAsReadButtonClicked_event(e); });
    document.getElementById('itemMarkAsUnreadButton').addEventListener('click', (e) => { this._itemMarkAsUnreadButtonClicked_event(e); });
    document.getElementById('itemMarkAllAsReadButton').addEventListener('click', (e) => { this._itemMarkAllAsReadButtonClicked_event(e); });
    document.getElementById('itemMarkAllAsUnreadButton').addEventListener('click', (e) => { this._itemMarkAllAsUnreadButtonClicked_event(e); });
    document.getElementById('itemOpenUnreadButton').addEventListener('click', (e) => { this._itemOpenUnreadButtonClicked_event(e); });
    document.getElementById('itemHideReadArticlesButton').addEventListener('click', (e) => { this._itemHideReadArticlesButtonClicked_event(e); });
  }

  async init_async() {
    this._hideReadArticles = await LocalStorageManager.getValue_async('hideReadArticles', this._hideReadArticles);
    this._updateHideReadArticles();
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
    CssManager.enableElementById('itemHideReadArticlesButton');
    let selectedElement = ItemsLayout.instance.selectionBarItems.selectedElement;
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
    let selectedElement = ItemsLayout.instance.selectionBarItems.selectedElement;
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
    document.getElementById('itemMarkAsReadButton').setAttribute('title', browser.i18n.getMessage('sbMarkArticleAsRead'));
    document.getElementById('itemMarkAsUnreadButton').setAttribute('title', browser.i18n.getMessage('sbMarkArticleAsUnread'));
    document.getElementById('itemMarkAllAsReadButton').setAttribute('title', browser.i18n.getMessage('sbMarkAllArticlesAsRead'));
    document.getElementById('itemMarkAllAsUnreadButton').setAttribute('title', browser.i18n.getMessage('sbMarkAllArticlesAsUnread'));
    document.getElementById('itemOpenUnreadButton').setAttribute('title', browser.i18n.getMessage('sbOpenUnreadArticlesInNewTabs'));
    document.getElementById('itemHideReadArticlesButton').setAttribute('title', browser.i18n.getMessage('sbItemHideReadArticles'));
  }

  _updateHideReadArticles() {
    LocalStorageManager.setValue_async('hideReadArticles', this._hideReadArticles);
    this._activateButton('itemHideReadArticlesButton', this._hideReadArticles);
    let visibleValue = this._hideReadArticles ? 'display:none !important;' : 'visibility:visible;';
    CssManager.replaceStyle('.visitedVisible', visibleValue);
    ItemsLayout.instance.selectionBarItems.refresh();
  }

  _activateButton(buttonId, activated) {
    let el = document.getElementById(buttonId);
    if (activated) {
      el.classList.add('topMenuItemActivated');
      el.classList.remove('topMenuItemInactivated');
    }
    else {
      el.classList.add('topMenuItemInactivated');
      el.classList.remove('topMenuItemActivated');
    }
  }

  async _itemMarkAsReadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this._buttonsForSingleElementEnabled) { return; }
    let elItem = ItemsLayout.instance.selectionBarItems.selectedElement;
    ItemManager.instance.markItemAsRead(elItem);
  }

  async _itemMarkAsUnreadButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this._buttonsForSingleElementEnabled) { return; }
    let elItem = ItemsLayout.instance.selectionBarItems.selectedElement;
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
    await ItemManager.instance.openAllUnreadItems_async();
  }

  async _itemHideReadArticlesButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this._hideReadArticles = !this._hideReadArticles;
    this._updateHideReadArticles();
  }

}
