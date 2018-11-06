/*global CssManager ItemsPanel LocalStorageManager*/
'use strict';
class SplitterBar { /*exported SplitterBar*/
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
    let topSplitterBar = await LocalStorageManager.getValue_async('splitterBarTop', window.innerHeight / 2);
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
    /*
    SideBar.instance.setContentHeight();
    ItemsPanel.instance.top = topSplitterBar;
    ItemsPanel.instance.setContentHeight();
    */
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
    let contentEl = document.getElementById('content');
    let height = Math.max(contentEl.offsetHeight - delta, 0);
    CssManager.replaceStyle('.contentHeight', '  height:' + height + 'px;');
    let weirdOffsetWorkArround  = contentEl.offsetHeight - height;
    CssManager.replaceStyle('.contentHeight', '  height:' + Math.max(height-weirdOffsetWorkArround, 0) + 'px;');
    let rectContent = contentEl.getBoundingClientRect();
    let maxHeight = Math.max(window.innerHeight - rectContent.top - this._elSplitterBar.offsetHeight, 0);
    if (contentEl.offsetHeight  > maxHeight) {
      CssManager.replaceStyle('.contentHeight', '  height:' + maxHeight + 'px;');
    }
  }

}


