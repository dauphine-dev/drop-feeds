/*global */
'use strict';
class RenderItemPanel { /*exported RenderItemPanel */
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    //SplitterBar2.instance.init_async();
    this._renderLayoutCell = document.getElementById('renderLayoutCell');
    this._renderItemText = document.getElementById('renderItemText');    
  }

  resize() {
    let rec = this._renderItemText.getBoundingClientRect();
    let height = Math.max(window.innerHeight - rec.top, 0);
    this._renderItemText.style.height = height + 'px';
    this._renderItemText.style.width  = window.innerWidth + 'px';

    rec = this._renderLayoutCell.getBoundingClientRect();
    let renderLayoutBackgroundEl = document.getElementById('renderLayoutBackground');
    renderLayoutBackgroundEl.style.left = rec.left + 'px';
    renderLayoutBackgroundEl.style.width = rec.width + 'px';
    renderLayoutBackgroundEl.style.top = rec.top + 'px';
    renderLayoutBackgroundEl.style.height = rec.height + 'px';
  }
}