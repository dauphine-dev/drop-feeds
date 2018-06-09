/*global browser DefaultValues LocalStorageManager*/
'use strict';
class TabView { /*exported TabView*/
  static get instance() { return (this._instance = this._instance || new this()); }

  async init_async() {
    this._updateLocalizedStrings();

    let elShowUpdatedFeedCountCheckbox = document.getElementById('showUpdatedFeedCountCheckbox');
    elShowUpdatedFeedCountCheckbox.checked =  await LocalStorageManager.getValue_async('showUpdatedFeedCount', DefaultValues.showUpdatedFeedCount);
    elShowUpdatedFeedCountCheckbox.addEventListener('click', (e) => { this._showUpdatedFeedCountCheckboxClicked_event(e); });

    let elShowErrorsAsUnreadCheckbox = document.getElementById('showErrorsAsUnreadCheckbox');
    elShowErrorsAsUnreadCheckbox.checked =  await LocalStorageManager.getValue_async('showErrorsAsUnread', DefaultValues.showErrorsAsUnread);
    elShowErrorsAsUnreadCheckbox.addEventListener('click', (e) => { this._showErrorsAsUnreadCheckboxClicked_event(e); });

  }

  _updateLocalizedStrings() {
    document.getElementById('textShowUpdatedFeedCount').textContent = browser.i18n.getMessage('optShowUpdatedFeedCount');
    document.getElementById('textShowErrorsAsUnread').textContent = browser.i18n.getMessage('optShowErrorsAsUnread');
  }

  async _showUpdatedFeedCountCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('showUpdatedFeedCount', document.getElementById('showUpdatedFeedCountCheckbox').checked);
  }

  async _showErrorsAsUnreadCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('showErrorsAsUnread', document.getElementById('showErrorsAsUnreadCheckbox').checked);
  }
}
