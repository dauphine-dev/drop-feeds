/*global TreeView*/
'use strict';
class FilterBar { /*exported FilterBar*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
  }

  async init_async() {
    document.getElementById('filterField').addEventListener('input', (e) => { this._filterFieldInput_event(e); });
  }

  set enabled(enable) {
    document.getElementById('filterBar').style.display = enable ? '' : 'none';
    let filterText = enable ? document.getElementById('filterField').value : '';
    this._applyFilter(filterText);
  }

  _filterFieldInput_event(event) {
    this._applyFilter(event.target.value);
  }

  _applyFilter(filterText) {
    try {
      let rootFolderId = 'dv-' + TreeView.instance.rootFolderId;
      let rootFolder = document.getElementById(rootFolderId);
      let feedElementList = [];
      if (filterText == '' ) { 
        feedElementList = [].slice.call(rootFolder.getElementsByTagName('*'));
        feedElementList.map(item => item.style.display = '');
        return; 
      }
      let toHideList = this._contain('label, li', filterText, false);
      let toShowLiList = this._contain('label, li', filterText, true);
      let toShowLblList = this._contain('label', filterText, true);
      toHideList.map(item => item.style.display = 'none');
      toShowLiList.map(item => item.style.display = '');
      toShowLblList.map((item) => { 
        let forId = item.getAttribute('for');
        let toShowLblForList = [].slice.call(document.querySelectorAll('label[for="' + forId + '"]'));
        toShowLblForList.map(lbl => lbl.style.display = '');
      });
    }
    catch (e) {
      /*eslint-disable no-console*/
      console.log(e);
      /*eslint-enable no-console*/
    }
  }

  _contain(selector, text, contains) {
    let elements = document.querySelectorAll(selector);
    return [].filter.call(elements, (element) => {
      if (contains) {
        return RegExp(text, 'i').test(element.textContent);
      }
      else {
        return ! RegExp(text, 'i').test(element.textContent);
      }
    });    
  }
}
