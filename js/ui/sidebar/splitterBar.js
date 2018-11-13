/*global SideBar FeedsTreeView ItemsLayout RenderItemLayout */
'use strict';
class SplitterBar { /*exported SplitterBar*/

  constructor(splitterBarId) {
    this._splitterBarId = splitterBarId;
    this._newPos = 0;
    this._startPos = 0;
    this._elSplitterBar = document.getElementById(this._splitterBarId);
    this._isResizing = false;
    this._isVisible = false;
    document.addEventListener('mousemove', (e) => { this._splitterBarMousemove_event(e); });
    document.addEventListener('mouseup', (e) => { this._splitterBarMouseup_event(e); });
    this._elSplitterBar.addEventListener('mousedown', (e) => { this._splitterBarMousedown_event(e); });
  }

  get top() {
    //return this._elSplitterBar.offsetTop;
    let rec = this._elSplitterBar.getBoundingClientRect();
    return rec.top;
  }

  get height() {
    return this._elSplitterBar.offsetHeight;
  }

  get element() {
    return this._elSplitterBar;
  }

  set visible(value) {
    this._isVisible = value;
    this._elSplitterBar.style.display = this._isVisible ? 'block' : 'none';
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
    let delta = event.clientY - this._lastDownY;
    this._lastDownY = event.clientY;
    this._resizeElements(delta);

  }

  _resizeElements(delta) {
    switch (this._splitterBarId) {
      case 'splitterBar1':
        delta = FeedsTreeView.instance.increaseContentHeight(delta);
        ItemsLayout.instance.increaseContentHeight(-delta);
        break;
      case 'splitterBar2':
        ItemsLayout.instance.increaseContentHeight(delta);
        break;
    }
    RenderItemLayout.instance.resize();
  }


}


