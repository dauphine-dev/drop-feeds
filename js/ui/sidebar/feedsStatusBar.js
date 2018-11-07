/*global BrowserManager FeedsTopMenu*/
'use strict';
class FeedsStatusBar { /*exported FeedsStatusBar*/
  static get instance() { return (this._instance = this._instance || new this()); }

  set workInProgress(workInProgress) {
    FeedsTopMenu.instance.workInProgress = workInProgress;
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