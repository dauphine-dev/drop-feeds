/*global DefaultValues LocalStorageManager*/
'use strict';
class TabUpdateChecker { /*exported TabUpdateChecker*/
  static async init() {
    let elTimeoutNumber = document.getElementById('timeoutNumber');
    elTimeoutNumber.value = await LocalStorageManager.getValue_async('timeOut', DefaultValues.timeOut);
    elTimeoutNumber.addEventListener('change', TabUpdateChecker._timeoutValueChanged_event);

    let elAsynchronousFeedCheckingCheckbox = document.getElementById('asynchronousFeedCheckingCheckbox');
    elAsynchronousFeedCheckingCheckbox.checked =  await LocalStorageManager.getValue_async('asynchronousFeedChecking', DefaultValues.alwaysOpenNewTab);
    elAsynchronousFeedCheckingCheckbox.addEventListener('click', TabUpdateChecker._asynchronousFeedCheckingCheckboxClicked_event);

  }

  static async _timeoutValueChanged_event() {
    let timeOut = Number(document.getElementById('timeoutNumber').value);
    await LocalStorageManager.setValue_async('timeOut', timeOut);
  }

  static async _asynchronousFeedCheckingCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('asynchronousFeedChecking', document.getElementById('asynchronousFeedCheckingCheckbox').checked);
  }

}
