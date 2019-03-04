/*global*/
'use strict';
class ThemeEditor { /*exported ThemeEditor*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updateLocalizedStrings();
    document.getElementById('aaa').addEventListener('click', (e) => { this._aaaOnClicked_event(e); });
  }

  async init_async() {
  }

  _updateLocalizedStrings() {
  }

  _aaaOnClicked_event() {
  }

}
ThemeEditor.instance.init_async();