/*global SideBar ItemsPanel LocalStorageManager*/
'use strict';
class SplitterBar { /*exported SplitterBar*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._newPos = 0;
    this._startPos = 0;
    this._elSplitterBar = document.getElementById('splitterBar');
    this._elSplitterBar.onmousedown = SplitterBar._dragMouseDown_event;

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

  static _dragMouseDown_event(event) {
    let self = SplitterBar.instance;
    event = event || window.event;
    self._startPos = event.clientY;
    document.onmouseup = SplitterBar._closeDragElement_event;
    document.onmousemove = SplitterBar._drag_event;
  }

  static _drag_event(event) {
    let self = SplitterBar.instance;
    event = event || window.event;
    self._newPos = self._startPos - event.clientY;
    self._startPos = event.clientY;
    let top = Math.max(Math.min(ItemsPanel.instance.top - self._newPos, window.innerHeight - 80), 125);
    self._resizeElements(top);
    LocalStorageManager.setValue_async('splitterBarTop', top);
  }

  static _closeDragElement_event() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  _resizeElements(topSplitterBar) {
    SideBar.instance.setContentHeight();
    ItemsPanel.instance.top = topSplitterBar;
    ItemsPanel.instance.setContentHeight();
  }
}


