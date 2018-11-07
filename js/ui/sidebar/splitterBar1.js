/*global SideBar FeedsTreeView ItemsPanel*/
'use strict';
class SplitterBar1 { /*exported SplitterBar1*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._newPos = 0;
    this._startPos = 0;
    this._elSplitterBar = document.getElementById('splitterBar');
    this._isResizing = false;
    document.addEventListener('mousemove', (e) => { this._splitterBarMousemove_event(e); });
    document.addEventListener('mouseup', (e) => { this._splitterBarMouseup_event(e); });
    this._elSplitterBar.addEventListener('mousedown', (e) => { this._splitterBarMousedown_event(e); });
  }

  async init_async() {
  }

  get instance() {
    return ItemsPanel.instance.top;
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
    SideBar.instance.resize();
  }

  _closeDragElement_event() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  async _splitterBarMouseup_event() {
    this._isResizing = false;
  }

  async _splitterBarMousedown_event(event) {
    this._isResizing = true;
    this._lastDownY = event.clientY;
  }

  async _splitterBarMousemove_event(event) {
    if (!this._isResizing) { return; }
    let delta = this._lastDownY - event.clientY;
    this._lastDownY = event.clientY;
    this._resizeElements(delta);

  }

  _resizeElements(delta) {
    let height = Math.max(document.getElementById('content').offsetHeight - delta, 0);
    FeedsTreeView.instance.setContentHeight(height);
    ItemsPanel.instance.resize();
  }

}


