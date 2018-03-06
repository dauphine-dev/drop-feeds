/*global CommonValues*/
'strict';
class TabContentArea { /*exported TabContentArea*/
  static init() {
    let elAlwaysOpenNewTabCheckbox = document.getElementById('alwaysOpenNewTabCheckbox');
    elAlwaysOpenNewTabCheckbox.checked = CommonValues.instance.alwaysOpenNewTab;
    elAlwaysOpenNewTabCheckbox.addEventListener('click', TabContentArea._alwaysOpenNewTabCheckBoxClicked_event);

    let elOpenNewTabForegroundCheckbox = document.getElementById('openNewTabForegroundCheckbox');
    elOpenNewTabForegroundCheckbox.checked =  CommonValues.instance.openNewTabForeground;
    elOpenNewTabForegroundCheckbox.addEventListener('click', TabContentArea._openNewTabForegroundCheckboxClicked_event);
  }

  static async _alwaysOpenNewTabCheckBoxClicked_event() {
    CommonValues.instance.alwaysOpenNewTab = document.getElementById('alwaysOpenNewTabCheckbox').checked;
  }
  static async _openNewTabForegroundCheckboxClicked_event() {
    CommonValues.instance.openNewTabForeground = document.getElementById('openNewTabForegroundCheckbox').checked;
  }
}