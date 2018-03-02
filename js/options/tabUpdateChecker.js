/*global commonValues*/
'use strict';
class tabUpdateChecker { /*exported tabUpdateChecker*/
  static async init() {
    let elTimeoutNumber = document.getElementById('timeoutNumber');
    let timeOut = commonValues.instance.timeOut;
    elTimeoutNumber.value = timeOut;
    elTimeoutNumber.addEventListener('change', tabUpdateChecker._timeoutValueChanged_event);
  }

  static async _timeoutValueChanged_event() {
    commonValues.instance.timeOut = document.getElementById('timeoutNumber').value;
  }
}
