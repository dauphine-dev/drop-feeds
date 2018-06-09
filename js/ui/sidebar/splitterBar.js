/*global SideBar ItemsPanel LocalStorageManager*/
'use strict';
class SplitterBar { /*exported SplitterBar*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._newPos = 0;
    this._startPos = 0;
    this._elSplitterBar = document.getElementById('splitterBar');
    this._elSplitterBar.onmousedown = ((e) => { this._dragMouseDown_event(e); });

  }

  async init_async() {
    let topSplitterBar =  await LocalStorageManager.getValue_async('splitterBarTop');
    if (topSplitterBar) {
      this._resizeElements(topSplitterBar);
    }
  }

  get top() {
    return ItemsPanel.instance.top;
  }

  set top(value) {
    this._resizeElements(value);
  }

  get height() {
    return this._elSplitterBar.offsetHeight;
  }

  _dragMouseDown_event(event) {
    event = event || window.event;
    this._startPos = event.clientY;
    document.onmouseup = ((e) => { this._closeDragElement_event(e); });
    document.onmousemove = ((e) => { this._drag_event(e); });
  }

  _drag_event(event) {
    event = event || window.event;
    this._newPos = this._startPos - event.clientY;
    this._startPos = event.clientY;
    let top = Math.max(Math.min(ItemsPanel.instance.top - this._newPos, window.innerHeight - 80), 125);
    this._resizeElements(top);
    LocalStorageManager.setValue_async('splitterBarTop', top);
  }

  _closeDragElement_event() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  _resizeElements(topSplitterBar) {
    SideBar.instance.setContentHeight();
    ItemsPanel.instance.top = topSplitterBar;
    ItemsPanel.instance.setContentHeight();
  }
}


