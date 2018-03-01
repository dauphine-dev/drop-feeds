/*global */
//----------------------------------------------------------------------
'use strict';
class statusBar { /*exported statusBar*/
  static get instance() {
    if (!this._instance) {
      this._instance = new statusBar();
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
    let elStatusBar = document.getElementById('statusText');
    elStatusBar.innerHTML = text;
  }
}