/*global SideBar ItemsPanel*/
'use strict';
class SplitterBar { /*exported SplitterBar*/
  static get instance() {
    if (!this._instance) {
      this._instance = new SplitterBar();
    }
    return this._instance;
  }

  constructor() {
    this._newPos = 0;
    this._startPos = 0;
    this._elSplitterBar = document.getElementById('splitterBar');
    this._elSplitterBar.onmousedown = SplitterBar._dragMouseDown_event;
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


