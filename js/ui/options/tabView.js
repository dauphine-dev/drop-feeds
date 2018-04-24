/*global browser DefaultValues LocalStorageManager*/
'strict';
class TabView { /*exported TabView*/
  static async init_async() {
    TabView._updateLocalizedStrings();
    let elShowErrorsAsUnreadCheckbox = document.getElementById('showErrorsAsUnreadCheckbox');
    elShowErrorsAsUnreadCheckbox.checked =  await LocalStorageManager.getValue_async('showErrorsAsUnread', DefaultValues.showErrorsAsUnread);
    elShowErrorsAsUnreadCheckbox.addEventListener('click', TabView._showErrorsAsUnreadCheckboxClicked_event);
  }

  static _updateLocalizedStrings() {
    document.getElementById('textShowErrorsAsUnread').textContent = browser.i18n.getMessage('optShowErrorsAsUnread');
  }

  static async _showErrorsAsUnreadCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('showErrorsAsUnread', document.getElementById('showErrorsAsUnreadCheckbox').checked);
  }
}
