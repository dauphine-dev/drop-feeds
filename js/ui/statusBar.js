/*global */
//----------------------------------------------------------------------
'use strict';
let statusBar = {
  //------------------------------
  workInProgress(workInProgress) {
    if (workInProgress)
    {
      document.getElementById('statusButton').classList.add('statusButtonUpdating');
    }
    else
    {
      document.getElementById('statusButton').classList.remove('statusButtonUpdating');
    }
  },
  //------------------------------
  printMessage(message) {
    let elStatusBar = document.getElementById('statusText');
    elStatusBar.innerHTML = message;
  },
  //------------------------------
};