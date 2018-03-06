/*global CommonValues*/
'use strict';
class TabUpdateChecker { /*exported TabUpdateChecker*/
  static async init() {
    let elTimeoutNumber = document.getElementById('timeoutNumber');
    let timeOut = CommonValues.instance.timeOut;
    elTimeoutNumber.value = timeOut;
    elTimeoutNumber.addEventListener('change', TabUpdateChecker._timeoutValueChanged_event);
  }

  static async _timeoutValueChanged_event() {
    CommonValues.instance.timeOut = document.getElementById('timeoutNumber').value;
  }
}
