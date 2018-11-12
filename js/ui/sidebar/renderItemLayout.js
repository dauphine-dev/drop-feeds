/*global SplitterBar Listener ListenerProviders ItemsLayout*/
'use strict';
class RenderItemLayout { /*exported RenderItemLayout */
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._renderItemLayoutEnabled = true;
    this._splitterBar2 = new SplitterBar('splitterBar2');
    this._renderLayoutCell = document.getElementById('renderLayoutCell');
    this._renderItemText = document.getElementById('renderItemText');      
    //Listener.instance.subscribe(ListenerProviders.localStorage, 'renderItemLayoutEnabled', (v) => { this._renderItemLayoutEnabled_async(v); }, true);
  }

  get top() {
    let top = window.innerHeight;
    if (this._renderItemLayoutEnabled) {
      top = this._splitterBar2.top;
    }
    return top;
  }

  resize() {
    let rec = this._renderItemText.getBoundingClientRect();
    let height = Math.max(window.innerHeight - rec.top, 0);
    this._setRenderItemTextHeight(height);
    this._renderItemText.style.width  = window.innerWidth + 'px';
    this._resizeBackgroundDiv();
  }

  _renderItemLayoutEnabled_async(value) {
    this._renderItemLayoutEnabled = value;
    this.resize();
  }

  _setRenderItemTextHeight(height) {
    console.log('height:', height);
    this._renderItemText.style.height =  height + 'px';
    let weirdOffsetWorkAround  = this._renderItemText.offsetHeight - height;
    this._renderItemText.style.height =  Math.max(height - weirdOffsetWorkAround, 0) + 'px';
    this._resizeBackgroundDiv();
  }

  _resizeBackgroundDiv() {
    let rec = this._renderLayoutCell.getBoundingClientRect();
    let renderLayoutBackgroundEl = document.getElementById('renderLayoutBackground');
    renderLayoutBackgroundEl.style.left = rec.left + 'px';
    renderLayoutBackgroundEl.style.width = rec.width + 'px';
    renderLayoutBackgroundEl.style.top = rec.top + 'px';
    renderLayoutBackgroundEl.style.height = rec.height + 'px';
  }

}