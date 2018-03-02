/*global commonValues*/
'strict';
class tabContentArea { /*exported tabContentArea*/
  static init() {
    let elAlwaysOpenNewTabCheckbox = document.getElementById('alwaysOpenNewTabCheckbox');
    elAlwaysOpenNewTabCheckbox.checked = commonValues.instance.alwaysOpenNewTab;
    elAlwaysOpenNewTabCheckbox.addEventListener('click', tabContentArea._alwaysOpenNewTabCheckBoxClicked_event);

    let elOpenNewTabForegroundCheckbox = document.getElementById('openNewTabForegroundCheckbox');
    elOpenNewTabForegroundCheckbox.checked =  commonValues.instance.openNewTabForeground;
    elOpenNewTabForegroundCheckbox.addEventListener('click', tabContentArea._openNewTabForegroundCheckboxClicked_event);
  }

  static async _alwaysOpenNewTabCheckBoxClicked_event() {
    commonValues.instance.alwaysOpenNewTab = document.getElementById('alwaysOpenNewTabCheckbox').checked;
  }
  static async _openNewTabForegroundCheckboxClicked_event() {
    commonValues.instance.openNewTabForeground = document.getElementById('openNewTabForegroundCheckbox').checked;
  }
}