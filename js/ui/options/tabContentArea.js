/*global DefaultValues LocalStorageManager*/
'strict';
class TabContentArea { /*exported TabContentArea*/
  static async init_async() {
    let elAlwaysOpenNewTabCheckbox = document.getElementById('alwaysOpenNewTabCheckbox');
    elAlwaysOpenNewTabCheckbox.checked =  await LocalStorageManager.getValue_async('alwaysOpenNewTab', DefaultValues.alwaysOpenNewTab);
    elAlwaysOpenNewTabCheckbox.addEventListener('click', TabContentArea._alwaysOpenNewTabCheckBoxClicked_event);

    let elOpenNewTabForegroundCheckbox = document.getElementById('openNewTabForegroundCheckbox');
    elOpenNewTabForegroundCheckbox.checked =  await LocalStorageManager.getValue_async('openNewTabForeground', DefaultValues.openNewTabForeground);
    elOpenNewTabForegroundCheckbox.addEventListener('click', TabContentArea._openNewTabForegroundCheckboxClicked_event);
  }

  static async _alwaysOpenNewTabCheckBoxClicked_event() {
    await LocalStorageManager.setValue_async('alwaysOpenNewTab', document.getElementById('alwaysOpenNewTabCheckbox').checked);
  }
  static async _openNewTabForegroundCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('openNewTabForeground', document.getElementById('openNewTabForegroundCheckbox').checked);
  }
}
