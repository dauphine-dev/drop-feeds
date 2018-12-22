/*global BrowserManager FeedsTopMenu*/
'use strict';
class FeedsStatusBar { /*exported FeedsStatusBar*/
  static get instance() { return (this._instance = this._instance || new this()); }
  
  constructor() {
    this._messageTimeOut = setTimeout(() => { }, 1);
  }

  set workInProgress(workInProgress) {
    FeedsTopMenu.instance.workInProgress = workInProgress;
    if (workInProgress) {
      document.getElementById('statusButton').classList.add('statusButtonUpdating');
    }
    else {
      document.getElementById('statusButton').classList.remove('statusButtonUpdating');
    }
  }

  setText(text) {
    clearTimeout(this._messageTimeOut);
    BrowserManager.setInnerHtmlById('statusText', text);
  }

  setTextWithTimeOut(text, textAfterTimeout, timeOut) {
    clearTimeout(this._messageTimeOut);
    BrowserManager.setInnerHtmlById('statusText', text);
    this._messageTimeOut = setTimeout(() => { BrowserManager.setInnerHtmlById('statusText', textAfterTimeout); }, timeOut);
  }
}