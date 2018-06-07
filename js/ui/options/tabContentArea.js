/*global browser DefaultValues LocalStorageManager CssManager*/
'use strict';
class TabContentArea { /*exported TabContentArea*/
  static async init_async() {
    TabContentArea._updateLocalizedStrings();

    let elRenderFeedsCheckbox = document.getElementById('renderFeedsCheckbox');
    elRenderFeedsCheckbox.checked =  await LocalStorageManager.getValue_async('renderFeeds', DefaultValues.renderFeeds);
    elRenderFeedsCheckbox.addEventListener('click', TabContentArea._renderFeedsCheckBoxClicked_event);

    let elAlwaysOpenNewTabCheckbox = document.getElementById('alwaysOpenNewTabCheckbox');
    elAlwaysOpenNewTabCheckbox.checked =  await LocalStorageManager.getValue_async('alwaysOpenNewTab', DefaultValues.alwaysOpenNewTab);
    elAlwaysOpenNewTabCheckbox.addEventListener('click', TabContentArea._alwaysOpenNewTabCheckBoxClicked_event);
    let elOpenNewTabForegroundCheckbox = document.getElementById('openNewTabForegroundCheckbox');

    elOpenNewTabForegroundCheckbox.checked =  await LocalStorageManager.getValue_async('openNewTabForeground', DefaultValues.openNewTabForeground);
    elOpenNewTabForegroundCheckbox.addEventListener('click', TabContentArea._openNewTabForegroundCheckboxClicked_event);

    let elReuseDropFeedsTabCheckbox = document.getElementById('reuseDropFeedsTabCheckbox');
    elReuseDropFeedsTabCheckbox.checked =  await LocalStorageManager.getValue_async('reuseDropFeedsTab', DefaultValues.reuseDropFeedsTab);
    elReuseDropFeedsTabCheckbox.addEventListener('click', TabContentArea._reuseDropFeedsTabCheckboxClicked_event);
    TabContentArea._updateReuseDropFeedsCheckboxDisabled();
  }

  static _updateLocalizedStrings() {
    document.getElementById('textRenderFeeds').textContent = browser.i18n.getMessage('optRenderFeeds');
    document.getElementById('textAlwaysOpenNewTab').textContent = browser.i18n.getMessage('optAlwaysOpenNewTab');
    document.getElementById('textOpenNewTabForeground').textContent = browser.i18n.getMessage('optOpenNewTabForeground');
    document.getElementById('textReuseDropFeedsTab').textContent = browser.i18n.getMessage('optReuseDropFeedsTab');
  }

  static async _renderFeedsCheckBoxClicked_event() {
    await LocalStorageManager.setValue_async('renderFeeds', document.getElementById('renderFeedsCheckbox').checked);
  }

  static async _alwaysOpenNewTabCheckBoxClicked_event() {
    await LocalStorageManager.setValue_async('alwaysOpenNewTab', document.getElementById('alwaysOpenNewTabCheckbox').checked);
    TabContentArea._updateReuseDropFeedsCheckboxDisabled();
  }

  static async _openNewTabForegroundCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('openNewTabForeground', document.getElementById('openNewTabForegroundCheckbox').checked);
  }

  static async _reuseDropFeedsTabCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('reuseDropFeedsTab', document.getElementById('reuseDropFeedsTabCheckbox').checked);
  }

  static _updateReuseDropFeedsCheckboxDisabled() {
    let elAlwaysOpenNewTabCheckbox = document.getElementById('alwaysOpenNewTabCheckbox');
    let elReuseDropFeedsTabCheckbox = document.getElementById('reuseDropFeedsTabCheckbox');
    let elReuseDropFeedsDisabled = elAlwaysOpenNewTabCheckbox.checked;
    elReuseDropFeedsTabCheckbox.disabled = elReuseDropFeedsDisabled;
    CssManager.setElementEnableById('textReuseDropFeedsTab', !elReuseDropFeedsDisabled);
  }
}
