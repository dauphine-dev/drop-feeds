/* global browser DefaultValues LocalStorageManager*/
'use strict';
class RenderPage {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._hideReadArticles = DefaultValues.hideReadArticlesTwoPanels;
    this._delKeySwicthReadArticles = DefaultValues.delKeySwicthReadArticles;
    this._addEventAndUpdateReadStartForAllTr();
    this._updateLocalizedStrings();
    document.addEventListener('keyup', (e) => { this.rowOnkeyUpEvent(e); });
    document.addEventListener('mousemove', (e) => { this.splitterBarMousemove_event(e); });
    document.addEventListener('mouseup', (e) => { this.splitterBarMouseup_event(e); });
    document.getElementById('splitterBar').addEventListener('mousedown', (e) => { this.splitterBarMousedown_event(e); });
    document.getElementById('itemMarkAsReadButton').addEventListener('click', (e) => { this.itemMarkAsReadButtonMousedown_event(e); });
    document.getElementById('itemMarkAsUnreadButton').addEventListener('click', (e) => { this.itemMarkAsUnreadButtonMousedown_event(e); });
    document.getElementById('itemMarkAllAsReadButton').addEventListener('click', (e) => { this.itemMarkAllAsReadButtonMousedown_event(e); });
    document.getElementById('itemMarkAllAsUnreadButton').addEventListener('click', (e) => { this.itemMarkAllAsUnreadButtonMousedown_event(e); });
    document.getElementById('itemOpenUnreadButton').addEventListener('click', (e) => { this.itemOpenUnreadButtonMousedown_event(e); });
    document.getElementById('itemHideReadArticlesButton').addEventListener('click', (e) => { this.itemHideReadArticlesButtonMousedown_event(e); });
    document.getElementById('itemDelKeySwicthReadArticlesButton').addEventListener('click', (e) => { this.itemDelKeySwicthReadArticlesButtonMousedown_event(e); });

  }

  async init_async() {
    this._hideReadArticles = await LocalStorageManager.getValue_async('hideReadArticlesTwoPanels', this._hideReadArticles);
    this._delKeySwicthReadArticles = await LocalStorageManager.getValue_async('delKeySwicthReadArticlesTwoPanels', this._delKeySwicthReadArticles);
    this._activateButton('itemDelKeySwicthReadArticlesButton', this._delKeySwicthReadArticles);
    this._updateHideReadArticles();
  }

  _updateLocalizedStrings() {
    document.getElementById('itemMarkAsReadButton').setAttribute('title', browser.i18n.getMessage('sbMarkArticleAsRead'));
    document.getElementById('itemMarkAsUnreadButton').setAttribute('title', browser.i18n.getMessage('sbMarkArticleAsUnread'));
    document.getElementById('itemMarkAllAsReadButton').setAttribute('title', browser.i18n.getMessage('sbMarkAllArticlesAsRead'));
    document.getElementById('itemMarkAllAsUnreadButton').setAttribute('title', browser.i18n.getMessage('sbMarkAllArticlesAsUnread'));
    document.getElementById('itemOpenUnreadButton').setAttribute('title', browser.i18n.getMessage('sbOpenUnreadArticlesInNewTabs'));
    document.getElementById('itemHideReadArticlesButton').setAttribute('title', browser.i18n.getMessage('sbItemHideReadArticles'));
    document.getElementById('itemDelKeySwicthReadArticlesButton').setAttribute('title', browser.i18n.getMessage('sbItemDelKeySwicthReadArticles'));
  }

  _addEventAndUpdateReadStartForAllTr() {
    let trList = document.querySelectorAll('tr');
    for (let tr of trList) {
      if (tr.cells[0].tagName == 'TH') continue;
      tr.addEventListener('click', (e) => { this.rowOnclickEvent(e); });
      let url = tr.cells[0].childNodes[0].getAttribute('url');
      this.storageGet(url, 'unread').then((state) => {
        if (state == 'read') { tr.classList.add('read'); } else { tr.classList.remove('read'); }
      });
    }
  }

  rowOnclickEvent(e) {
    let tr = this.getTr(e.target);
    this.selectRow(tr);
    this.displayItem(tr.cells[0].childNodes[0].textContent);
    if (e.target.cellIndex == 2) {
      this.switchRawReadState(tr);
    }
    else {
      if (!this._delKeySwicthReadArticles) {
        this.setRawAsRead(tr);
      }
    }
  }

  rowOnkeyUpEvent(e) {
    if (e.defaultPrevented) { return; }
    let dir = 0;
    let switchRawReadState = false;
    e.preventDefault();
    switch (e.key) {
      case 'ArrowDown':
        dir = 1;
        break;
      case 'ArrowUp':
        dir = -1;
        break;
      case 'Delete':
        switchRawReadState = true;
        break;
      default:
        return;
    }

    let currentTr = this.getCurrentTr();
    if (!currentTr) { return; }

    if (dir) {
      let nextTr = this.getNexTr(currentTr, dir);
      if (nextTr) {
        //this.selectTr(nextTr, (e.target.cellIndex == 2));
        this.selectTr(nextTr);
      }
    }

    if (switchRawReadState) {
      this.switchRawReadState(currentTr);
    }
  }

  getCurrentTr() {
    return document.querySelectorAll('#topPanel table tbody tr.selected')[0];
  }

  getNexTr(currentTr, dir) {
    //let trList = document.querySelectorAll('#topPanel table tbody tr:not(.trHidden)');
    let trList = document.querySelectorAll('#topPanel table tbody tr');
    const nextIndex = Array.prototype.indexOf.call(trList, currentTr) + dir;
    let nextTr = undefined;
    if (nextIndex) {
      nextTr = trList[nextIndex];
    }
    return nextTr;
  }

  selectTr(nextTr, switchRawReadState) {
    this.selectRow(nextTr);
    this.displayItem(nextTr.cells[0].childNodes[0].textContent);
    if (switchRawReadState) {
      this.switchRawReadState(nextTr);
    }
    else {
      if (!this._delKeySwicthReadArticles) {
        this.setRawAsRead(nextTr);
      }
    }
  }

  getTr(target) {
    let tr = target;
    while (tr && tr.tagName != 'TR') {
      tr = tr.parentNode;
    }
    return tr;
  }

  setRawAsRead(tr) {
    tr.classList.add('read');
    let itemLink = tr.cells[0].childNodes[0].getAttribute('url');
    this.storageSet(itemLink, 'read');
  }

  setRawAsUnread(tr) {
    tr.classList.remove('read');
    let itemLink = tr.cells[0].childNodes[0].getAttribute('url');
    this.storageSet(itemLink, 'unread');
  }

  switchRawReadState(tr) {
    if (tr.classList.contains('read')) {
      this.setRawAsUnread(tr);
    }
    else {
      this.setRawAsRead(tr);
    }
  }

  selectRow(selectedTr) {
    let trList = document.querySelectorAll('tr');
    for (let tr of trList) {
      tr.classList.remove('selected');
    }
    selectedTr.classList.add('selected');
    this._updateHideReadArticles();
  }

  displayItem(itemNumber) {
    let itemList = document.getElementsByClassName('item');
    for (let item of itemList) {
      item.classList.remove('displayBlock');
    }
    document.getElementById('item' + itemNumber).classList.add('displayBlock');
  }

  async splitterBarMouseup_event() {
    this._isResizing = false;
  }

  async splitterBarMousedown_event(event) {
    this._isResizing = true;
    this._lastDownY = event.clientY;
  }

  async splitterBarMousemove_event(event) {
    if (!this._isResizing) { return; }
    let delta = event.clientY - this._lastDownY;
    this._lastDownY = event.clientY;
    this.resizeTopPanel(delta);
  }

  resizeTopPanel(delta) {
    let topPanel = document.getElementById('topPanel');
    let maxHeigh = (window.innerHeight - document.getElementById('channelHead').offsetHeight - document.getElementById('splitterBar').offsetHeight) - 1;
    topPanel.style.height = Math.min(Math.max(topPanel.offsetHeight + delta, 0), maxHeigh) + 'px';
  }

  async storageGet(valueName, defaultValue) {
    let value = defaultValue;
    let storedValue = (await browser.storage.local.get(valueName))[valueName];
    if (typeof storedValue != 'undefined') {
      value = storedValue;
    }
    return value;
  }

  async storageSet(valueName, value) {
    await browser.storage.local.set({ [valueName]: value });
  }

  async itemMarkAsReadButtonMousedown_event(e) {
    e.stopPropagation();
    e.preventDefault();
    let tr = this.getCurrentTr();
    if (!tr) { return; }
    this.setRawAsRead(tr);
  }

  async itemMarkAsUnreadButtonMousedown_event(e) {
    e.stopPropagation();
    e.preventDefault();
    let tr = this.getCurrentTr();
    if (!tr) { return; }
    this.setRawAsUnread(tr);
  }

  async itemMarkAllAsReadButtonMousedown_event(e) {
    e.stopPropagation();
    e.preventDefault();
    let trList = document.querySelectorAll('#topPanel table tbody tr:not(.tableHeader)');
    for (const tr of trList) {
      this.setRawAsRead(tr);
    }
  }

  async itemMarkAllAsUnreadButtonMousedown_event(e) {
    e.stopPropagation();
    e.preventDefault();
    let trList = document.querySelectorAll('#topPanel table tbody tr:not(.tableHeader)');
    for (const tr of trList) {
      this.setRawAsUnread(tr);
    }
  }

  async itemOpenUnreadButtonMousedown_event(e) {
    e.stopPropagation();
    e.preventDefault();
    let trList = document.querySelectorAll('#topPanel table tbody tr:not(.read):not(.tableHeader)');
    for (const tr of trList) {
      const url = tr.children[0].children[0].getAttribute('url');
      await browser.tabs.create({ url: url, active: false });
    }
  }

  async itemHideReadArticlesButtonMousedown_event(e) {
    e.stopPropagation();
    e.preventDefault();
    this._hideReadArticles = !this._hideReadArticles;
    this._updateHideReadArticles();
  }

  async itemDelKeySwicthReadArticlesButtonMousedown_event(e) {
    e.stopPropagation();
    e.preventDefault();
    this._delKeySwicthReadArticles = !this._delKeySwicthReadArticles;
    LocalStorageManager.setValue_async('delKeySwicthReadArticlesTwoPanels', this._delKeySwicthReadArticles);
    this._activateButton('itemDelKeySwicthReadArticlesButton', this._delKeySwicthReadArticles);
  }

  _updateHideReadArticles() {
    LocalStorageManager.setValue_async('hideReadArticlesTwoPanels', this._hideReadArticles);
    this._activateButton('itemHideReadArticlesButton', this._hideReadArticles);
    if (this._hideReadArticles) {
      const readList = document.querySelectorAll('.read:not(.selected)');
      for (const elm of readList) {
        elm.classList.add('trHidden');
      }
    }
    else {
      const readList = document.querySelectorAll('.read');
      for (const elm of readList) {
        elm.classList.remove('trHidden');
      }
    }
  }

  _activateButton(buttonId, activated) {
    let el = document.getElementById(buttonId);
    if (activated) {
      el.classList.add('toolBarItemActivated');
      el.classList.remove('toolBarItemInactivated');
    }
    else {
      el.classList.add('toolBarItemInactivated');
      el.classList.remove('toolBarItemActivated');
    }
  }


}
RenderPage.instance.init_async();