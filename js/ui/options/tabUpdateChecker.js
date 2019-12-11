/*global browser DefaultValues LocalStorageManager CssManager*/
'use strict';
class TabUpdateChecker { /*exported TabUpdateChecker*/
  static get instance() { return (this._instance = this._instance || new this()); }

  async init() {
    this._updateLocalizedStrings();

    let elTimeoutNumber = document.getElementById('timeoutNumber');
    elTimeoutNumber.value = await LocalStorageManager.getValue_async('timeOut', DefaultValues.timeOut);
    elTimeoutNumber.addEventListener('change', (e) => { this._timeoutValueChanged_event(e); });

    let elAsynchronousFeedCheckingCheckbox = document.getElementById('asynchronousFeedCheckingCheckbox');
    elAsynchronousFeedCheckingCheckbox.checked = await LocalStorageManager.getValue_async('asynchronousFeedChecking', DefaultValues.asynchronousFeedChecking);
    elAsynchronousFeedCheckingCheckbox.addEventListener('click', (e) => { this._asynchronousFeedCheckingCheckboxClicked_event(e); });

    let elShowFeedUpdatePopupCheckbox = document.getElementById('showFeedUpdatePopupCheckbox');
    elShowFeedUpdatePopupCheckbox.checked = await LocalStorageManager.getValue_async('showFeedUpdatePopup', DefaultValues.showFeedUpdatePopup);
    elShowFeedUpdatePopupCheckbox.addEventListener('click', (e) => { this._showFeedUpdatePopupCheckbox_event(e); });

    let elDontShowFeedUpdatePopupIfZeroFeedCheckbox = document.getElementById('dontShowFeedUpdatePopupIfZeroFeedCheckbox');
    elDontShowFeedUpdatePopupIfZeroFeedCheckbox.checked = await LocalStorageManager.getValue_async('dontShowFeedUpdatePopupIfZeroFeed', DefaultValues.dontShowFeedUpdatePopupIfZeroFeed);
    elDontShowFeedUpdatePopupIfZeroFeedCheckbox.addEventListener('click', (e) => { this._dontShowFeedUpdatePopupIfZeroFeedCheckbox_event(e); });


    let elIfHttpsHasFailedRetryWithHttp = document.getElementById('ifHttpsHasFailedRetryWithHttpCheckbox');
    elIfHttpsHasFailedRetryWithHttp.checked = await LocalStorageManager.getValue_async('ifHttpsHasFailedRetryWithHttp', DefaultValues.ifHttpsHasFailedRetryWithHttp);
    elIfHttpsHasFailedRetryWithHttp.addEventListener('click', (e) => { this._ifHttpsHasFailedRetryWithHttpCheckboxClicked_event(e); });

    let elAutomaticFeedUpdates = document.getElementById('automaticFeedUpdatesCheckbox');
    elAutomaticFeedUpdates.checked = await LocalStorageManager.getValue_async('automaticFeedUpdates', DefaultValues.automaticFeedUpdates);
    elAutomaticFeedUpdates.addEventListener('click', (e) => { this._ifAutomaticFeedUpdatesCheckboxClicked_event(e); });
    this._automaticFeedUpdatesOnStartEnabled(elAutomaticFeedUpdates.checked);

    let elAutomaticFeedUpdateMinutesNumber = document.getElementById('automaticFeedUpdateMinutesNumber');
    elAutomaticFeedUpdateMinutesNumber.value = await LocalStorageManager.getValue_async('automaticFeedUpdateMinutes', DefaultValues.automaticFeedUpdateMinutes);
    elAutomaticFeedUpdateMinutesNumber.addEventListener('change', (e) => { this._automaticFeedUpdateMinutesNumberChanged_event(e); });

    let elAutomaticFeedUpdatesOnStartCheckbox = document.getElementById('automaticFeedUpdatesOnStartCheckbox');
    elAutomaticFeedUpdatesOnStartCheckbox.checked = await LocalStorageManager.getValue_async('automaticFeedUpdatesOnStart', DefaultValues.automaticFeedUpdatesOnStart);
    elAutomaticFeedUpdatesOnStartCheckbox.addEventListener('click', (e) => { this._automaticFeedUpdatesOnStartClicked_event(e); });
  }

  _updateLocalizedStrings() {
    document.getElementById('lblTimeout').textContent = browser.i18n.getMessage('optTimeout');
    document.getElementById('txtSeconds').textContent = browser.i18n.getMessage('optSeconds');
    document.getElementById('textAsynchronousFeedChecking').textContent = browser.i18n.getMessage('optAsynchronousFeedChecking');
    document.getElementById('txtAutoFeedUpdatesEvery').textContent = browser.i18n.getMessage('optAutoFeedUpdatesEvery');
    document.getElementById('txtAutoFeedUpdatesOnStart').textContent = browser.i18n.getMessage('optAutoFeedUpdatesOnStart');
    document.getElementById('txtMinutes').textContent = browser.i18n.getMessage('optMinutes');
    document.getElementById('textShowNotifications').textContent = browser.i18n.getMessage('optShowNotifications');
    document.getElementById('textDontShowNotificationsIfZero').textContent = browser.i18n.getMessage('optDontShowNotificationsIfZero');
    document.getElementById('textRetryWithHttp').textContent = browser.i18n.getMessage('optRetryWithHttp');
  }

  async _timeoutValueChanged_event() {
    let timeOut = Number(document.getElementById('timeoutNumber').value);
    await LocalStorageManager.setValue_async('timeOut', timeOut);
  }

  async _asynchronousFeedCheckingCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('asynchronousFeedChecking', document.getElementById('asynchronousFeedCheckingCheckbox').checked);
  }

  async _showFeedUpdatePopupCheckbox_event() {
    await LocalStorageManager.setValue_async('showFeedUpdatePopup', document.getElementById('showFeedUpdatePopupCheckbox').checked);
  }

  async _dontShowFeedUpdatePopupIfZeroFeedCheckbox_event() {
    await LocalStorageManager.setValue_async('dontShowFeedUpdatePopupIfZeroFeed', document.getElementById('dontShowFeedUpdatePopupIfZeroFeedCheckbox').checked);
  }

  async _ifHttpsHasFailedRetryWithHttpCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('ifHttpsHasFailedRetryWithHttp', document.getElementById('ifHttpsHasFailedRetryWithHttpCheckbox').checked);
  }

  async _ifAutomaticFeedUpdatesCheckboxClicked_event() {
    let checked = document.getElementById('automaticFeedUpdatesCheckbox').checked;
    await LocalStorageManager.setValue_async('automaticFeedUpdates', checked);
    this._automaticFeedUpdatesOnStartEnabled(checked);
  }

  _automaticFeedUpdatesOnStartEnabled(enabled) {
    document.getElementById('automaticFeedUpdatesOnStartCheckbox').disabled = !enabled;
    CssManager.setElementEnableById('txtAutoFeedUpdatesOnStart', enabled);
  }

  async _automaticFeedUpdateMinutesNumberChanged_event() {
    let automaticFeedUpdateMinutes = Number(document.getElementById('automaticFeedUpdateMinutesNumber').value);
    await LocalStorageManager.setValue_async('automaticFeedUpdateMinutes', automaticFeedUpdateMinutes);
  }

  async _automaticFeedUpdatesCheckboxClicked_event() {
    let checked = document.getElementById('automaticFeedUpdatesCheckbox').checked;
    await LocalStorageManager.setValue_async('automaticFeedUpdates', checked);
    this._automaticFeedUpdatesOnStartEnabled(checked);
  }

  async _automaticFeedUpdatesOnStartClicked_event() {
    await LocalStorageManager.setValue_async('automaticFeedUpdatesOnStart', document.getElementById('automaticFeedUpdatesOnStartCheckbox').checked);
  }

}
