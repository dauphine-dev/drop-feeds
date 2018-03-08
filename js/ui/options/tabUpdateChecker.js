/*global DefaultValues LocalStorageManager*/
'use strict';
class TabUpdateChecker { /*exported TabUpdateChecker*/
  static async init() {
    let elTimeoutNumber = document.getElementById('timeoutNumber');
    elTimeoutNumber.value = await LocalStorageManager.getValue_async('timeOut', DefaultValues.timeOut);
    elTimeoutNumber.addEventListener('change', TabUpdateChecker._timeoutValueChanged_event);
  }

  static async _timeoutValueChanged_event() {
    let timeOut = Number(document.getElementById('timeoutNumber').value);
    await LocalStorageManager.setValue_async('timeOut', timeOut);
  }
}
