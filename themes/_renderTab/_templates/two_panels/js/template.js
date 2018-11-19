'use strict';
class RenderPage {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    let trList = document.querySelectorAll('tr');
    for (let tr of trList) {
      tr.addEventListener('click', (e) => { this.rowOnclickEvent(e); });
    }

    document.addEventListener('mousemove', (e) => { this.splitterBarMousemove_event(e); });
    document.addEventListener('mouseup', (e) => { this.splitterBarMouseup_event(e); });
    document.getElementById('splitterBar').addEventListener('mousedown', (e) => { this.splitterBarMousedown_event(e); });
  }

  rowOnclickEvent(e) {
    let tr = e.target.parentNode;
    this.selectRow(tr);
    this.displayItem(tr.cells[0].textContent);
    if (e.target.cellIndex == 2) {
      this.switchRawReadState(tr);
    }
    else {
      this.setRawAsRead(tr);
    }

  }

  setRawAsRead(tr) {
    tr.classList.add('read');
  }

  switchRawReadState(tr) {
    if (tr.classList.contains('read')) {
      tr.classList.remove('read');
    }
    else {
      tr.classList.add('read');
    }
  }


  selectRow(selectedTr) {
    let trList = document.querySelectorAll('tr');
    for (let tr of trList) {
      tr.classList.remove('selected');
    }
    selectedTr.classList.add('selected');
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

}
RenderPage.instance;