/*global BrowserManager*/
'use strict';
class StatusBar { /*exported StatusBar*/
  static get instance() {
    if (!this._instance) {
      this._instance = new StatusBar();
    }
    return this._instance;
  }

  set workInProgress(workInProgress) {
    if (workInProgress)
    {
      document.getElementById('statusButton').classList.add('statusButtonUpdating');
    }
    else
    {
      document.getElementById('statusButton').classList.remove('statusButtonUpdating');
    }
  }

  set text(text) {
    BrowserManager.setInnerHtmlById('statusText', text);
  }
}