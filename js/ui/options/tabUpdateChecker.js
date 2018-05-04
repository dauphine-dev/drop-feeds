/*global browser DefaultValues LocalStorageManager*/
'use strict';
class TabUpdateChecker { /*exported TabUpdateChecker*/
  static async init() {
    TabUpdateChecker._updateLocalizedStrings();

    let elTimeoutNumber = document.getElementById('timeoutNumber');
    elTimeoutNumber.value = await LocalStorageManager.getValue_async('timeOut', DefaultValues.timeOut);
    elTimeoutNumber.addEventListener('change', TabUpdateChecker._timeoutValueChanged_event);

    let elAsynchronousFeedCheckingCheckbox = document.getElementById('asynchronousFeedCheckingCheckbox');
    elAsynchronousFeedCheckingCheckbox.checked =  await LocalStorageManager.getValue_async('asynchronousFeedChecking', DefaultValues.asynchronousFeedChecking);
    elAsynchronousFeedCheckingCheckbox.addEventListener('click', TabUpdateChecker._asynchronousFeedCheckingCheckboxClicked_event);

    let elShowFeedUpdatePopupCheckbox = document.getElementById('showFeedUpdatePopupCheckbox');
    elShowFeedUpdatePopupCheckbox.checked =  await LocalStorageManager.getValue_async('showFeedUpdatePopup', DefaultValues.showFeedUpdatePopup);
    elShowFeedUpdatePopupCheckbox.addEventListener('click', TabUpdateChecker._showFeedUpdatePopupCheckbox_event);

    let elIfHttpsHasFailedRetryWithHttp = document.getElementById('ifHttpsHasFailedRetryWithHttpCheckbox');
    elIfHttpsHasFailedRetryWithHttp.checked =  await LocalStorageManager.getValue_async('ifHttpsHasFailedRetryWithHttp', DefaultValues.ifHttpsHasFailedRetryWithHttp);
    elIfHttpsHasFailedRetryWithHttp.addEventListener('click', TabUpdateChecker._ifHttpsHasFailedRetryWithHttpCheckboxClicked_event);

    let elAutomaticFeedUpdates = document.getElementById('automaticFeedUpdatesCheckbox');
    elAutomaticFeedUpdates.checked =  await LocalStorageManager.getValue_async('automaticFeedUpdates', DefaultValues.automaticFeedUpdates);
    elAutomaticFeedUpdates.addEventListener('click', TabUpdateChecker._ifAutomaticFeedUpdatesCheckboxClicked_event);

    let elAutomaticFeedUpdateMinutesNumber = document.getElementById('automaticFeedUpdateMinutesNumber');
    elAutomaticFeedUpdateMinutesNumber.value = await LocalStorageManager.getValue_async('automaticFeedUpdateMinutes', DefaultValues.automaticFeedUpdateMinutes);
    elAutomaticFeedUpdateMinutesNumber.addEventListener('change', TabUpdateChecker._automaticFeedUpdateMinutesNumberChanged_event);
  }

  static _updateLocalizedStrings() {
    document.getElementById('lblTimeout').textContent = browser.i18n.getMessage('optTimeout');
    document.getElementById('txtSeconds').textContent = browser.i18n.getMessage('optSeconds');
    document.getElementById('textAsynchronousFeedChecking').textContent = browser.i18n.getMessage('optAsynchronousFeedChecking');
    document.getElementById('txtAutoFeedUpdatesEvery').textContent = browser.i18n.getMessage('optAutoFeedUpdatesEvery');
    document.getElementById('txtMinutes').textContent = browser.i18n.getMessage('optMinutes');
    document.getElementById('textShowNotifications').textContent = browser.i18n.getMessage('optShowNotifications');
    document.getElementById('textRetryWithHttp').textContent = browser.i18n.getMessage('optRetryWithHttp');
  }

  static async _timeoutValueChanged_event() {
    let timeOut = Number(document.getElementById('timeoutNumber').value);
    await LocalStorageManager.setValue_async('timeOut', timeOut);
  }

  static async _asynchronousFeedCheckingCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('asynchronousFeedChecking', document.getElementById('asynchronousFeedCheckingCheckbox').checked);
  }

  static async _showFeedUpdatePopupCheckbox_event() {
    await LocalStorageManager.setValue_async('showFeedUpdatePopup', document.getElementById('showFeedUpdatePopupCheckbox').checked);
  }

  static async _ifHttpsHasFailedRetryWithHttpCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('ifHttpsHasFailedRetryWithHttp', document.getElementById('ifHttpsHasFailedRetryWithHttpCheckbox').checked);
  }

  static async _ifAutomaticFeedUpdatesCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('automaticFeedUpdates', document.getElementById('automaticFeedUpdatesCheckbox').checked);
  }

  static async _automaticFeedUpdateMinutesNumberChanged_event() {
    let automaticFeedUpdateMinutes = Number(document.getElementById('automaticFeedUpdateMinutesNumber').value);
    await LocalStorageManager.setValue_async('automaticFeedUpdateMinutes', automaticFeedUpdateMinutes);
  }
}
