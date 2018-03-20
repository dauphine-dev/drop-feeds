/*global SideBar*/
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
    this._elMainItemsPane = document.getElementById('mainItemsPane');
    this._elSplitterBar = document.getElementById('splitterBar');
    this._elSplitterBar.onmousedown = SplitterBar._dragMouseDown_event;
  }

  get top() {
    return this._elMainItemsPane.offsetTop;
  }

  _makeDraggableElement() {
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
    let top = (self._elMainItemsPane.offsetTop - self._newPos) ;
    self._elMainItemsPane.style.top = top + 'px';
    let height = Math.max(window.innerHeight - top, 0);
    self._elMainItemsPane.style.height = height + 'px';
    SideBar.instance.setContentHeight();
  }

  static _closeDragElement_event() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}


