/*global browser DefaultValues LocalStorageManager*/
'use strict';
class TabView { /*exported TabView*/
  static async init_async() {
    TabView._updateLocalizedStrings();

    let elShowUpdatedFeedCountCheckbox = document.getElementById('showUpdatedFeedCountCheckbox');
    elShowUpdatedFeedCountCheckbox.checked =  await LocalStorageManager.getValue_async('showUpdatedFeedCount', DefaultValues.showUpdatedFeedCount);
    elShowUpdatedFeedCountCheckbox.addEventListener('click', TabView._showUpdatedFeedCountCheckboxClicked_event);

    let elShowErrorsAsUnreadCheckbox = document.getElementById('showErrorsAsUnreadCheckbox');
    elShowErrorsAsUnreadCheckbox.checked =  await LocalStorageManager.getValue_async('showErrorsAsUnread', DefaultValues.showErrorsAsUnread);
    elShowErrorsAsUnreadCheckbox.addEventListener('click', TabView._showErrorsAsUnreadCheckboxClicked_event);

  }

  static _updateLocalizedStrings() {
    document.getElementById('textShowUpdatedFeedCount').textContent = browser.i18n.getMessage('optShowUpdatedFeedCount');
    document.getElementById('textShowErrorsAsUnread').textContent = browser.i18n.getMessage('optShowErrorsAsUnread');
  }

  static async _showUpdatedFeedCountCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('showUpdatedFeedCount', document.getElementById('showUpdatedFeedCountCheckbox').checked);
  }

  static async _showErrorsAsUnreadCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('showErrorsAsUnread', document.getElementById('showErrorsAsUnreadCheckbox').checked);
  }
}
