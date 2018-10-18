/*global */
'use strict';
class FilterBar { /*exported FilterBar*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
  }

  async init_async() {
  }

  set enabled(enable) {
    document.getElementById('filterBar').style.display = enable ? '' : 'none';
  }
}
