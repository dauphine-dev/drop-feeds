/*global browser DefaultValues LocalStorageManager CssManager*/
'use strict';
class TabContentArea { /*exported TabContentArea*/
  static get instance() { return (this._instance = this._instance || new this()); }

  async init_async() {
    this._updateLocalizedStrings();

    let elRenderFeedsCheckbox = document.getElementById('renderFeedsCheckbox');
    elRenderFeedsCheckbox.checked =  await LocalStorageManager.getValue_async('renderFeeds', DefaultValues.renderFeeds);
    elRenderFeedsCheckbox.addEventListener('click', (e) => { this._renderFeedsCheckBoxClicked_event(e); });

    let elAlwaysOpenNewTabCheckbox = document.getElementById('alwaysOpenNewTabCheckbox');
    elAlwaysOpenNewTabCheckbox.checked =  await LocalStorageManager.getValue_async('alwaysOpenNewTab', DefaultValues.alwaysOpenNewTab);
    elAlwaysOpenNewTabCheckbox.addEventListener('click', (e) => { this._alwaysOpenNewTabCheckBoxClicked_event(e); });
    let elOpenNewTabForegroundCheckbox = document.getElementById('openNewTabForegroundCheckbox');

    elOpenNewTabForegroundCheckbox.checked =  await LocalStorageManager.getValue_async('openNewTabForeground', DefaultValues.openNewTabForeground);
    elOpenNewTabForegroundCheckbox.addEventListener('click', (e) => { this._openNewTabForegroundCheckboxClicked_event(e); });

    let elReuseDropFeedsTabCheckbox = document.getElementById('reuseDropFeedsTabCheckbox');
    elReuseDropFeedsTabCheckbox.checked =  await LocalStorageManager.getValue_async('reuseDropFeedsTab', DefaultValues.reuseDropFeedsTab);
    elReuseDropFeedsTabCheckbox.addEventListener('click', (e) => { this._reuseDropFeedsTabCheckboxClicked_event(e); });
    this._updateReuseDropFeedsCheckboxDisabled();
  }

  _updateLocalizedStrings() {
    document.getElementById('textRenderFeeds').textContent = browser.i18n.getMessage('optRenderFeeds');
    document.getElementById('textAlwaysOpenNewTab').textContent = browser.i18n.getMessage('optAlwaysOpenNewTab');
    document.getElementById('textOpenNewTabForeground').textContent = browser.i18n.getMessage('optOpenNewTabForeground');
    document.getElementById('textReuseDropFeedsTab').textContent = browser.i18n.getMessage('optReuseDropFeedsTab');
  }

  async _renderFeedsCheckBoxClicked_event() {
    await LocalStorageManager.setValue_async('renderFeeds', document.getElementById('renderFeedsCheckbox').checked);
  }

  async _alwaysOpenNewTabCheckBoxClicked_event() {
    await LocalStorageManager.setValue_async('alwaysOpenNewTab', document.getElementById('alwaysOpenNewTabCheckbox').checked);
    this._updateReuseDropFeedsCheckboxDisabled();
  }

  async _openNewTabForegroundCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('openNewTabForeground', document.getElementById('openNewTabForegroundCheckbox').checked);
  }

  async _reuseDropFeedsTabCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('reuseDropFeedsTab', document.getElementById('reuseDropFeedsTabCheckbox').checked);
  }

  _updateReuseDropFeedsCheckboxDisabled() {
    let elAlwaysOpenNewTabCheckbox = document.getElementById('alwaysOpenNewTabCheckbox');
    let elReuseDropFeedsTabCheckbox = document.getElementById('reuseDropFeedsTabCheckbox');
    let elReuseDropFeedsDisabled = elAlwaysOpenNewTabCheckbox.checked;
    elReuseDropFeedsTabCheckbox.disabled = elReuseDropFeedsDisabled;
    CssManager.setElementEnableById('textReuseDropFeedsTab', !elReuseDropFeedsDisabled);
  }
}
