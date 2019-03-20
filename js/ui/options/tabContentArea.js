/*global browser DefaultValues LocalStorageManager CssManager*/
'use strict';
class TabContentArea { /*exported TabContentArea*/
  static get instance() { return (this._instance = this._instance || new this()); }

  async init_async() {
    this._updateLocalizedStrings();

    let elRenderFeedsCheckbox = document.getElementById('renderFeedsCheckbox');
    elRenderFeedsCheckbox.checked = await LocalStorageManager.getValue_async('renderFeeds', DefaultValues.renderFeeds);
    elRenderFeedsCheckbox.addEventListener('click', (e) => { this._renderFeedsCheckBoxClicked_event(e); });

    let elItemNewTabCheckbox = document.getElementById('itemNewTabCheckbox');
    elItemNewTabCheckbox.checked = await LocalStorageManager.getValue_async('itemNewTab', DefaultValues.itemNewTab);
    elItemNewTabCheckbox.addEventListener('click', (e) => { this._itemNewTabCheckBoxClicked_event(e); });

    let elAlwaysOpenNewTabCheckbox = document.getElementById('alwaysOpenNewTabCheckbox');
    elAlwaysOpenNewTabCheckbox.checked = await LocalStorageManager.getValue_async('alwaysOpenNewTab', DefaultValues.alwaysOpenNewTab);
    elAlwaysOpenNewTabCheckbox.addEventListener('click', (e) => { this._alwaysOpenNewTabCheckBoxClicked_event(e); });

    let elOpenNewTabForegroundCheckbox = document.getElementById('openNewTabForegroundCheckbox');
    elOpenNewTabForegroundCheckbox.checked = await LocalStorageManager.getValue_async('openNewTabForeground', DefaultValues.openNewTabForeground);
    elOpenNewTabForegroundCheckbox.addEventListener('click', (e) => { this._openNewTabForegroundCheckboxClicked_event(e); });

    let elReuseDropFeedsTabCheckbox = document.getElementById('reuseDropFeedsTabCheckbox');
    elReuseDropFeedsTabCheckbox.checked = await LocalStorageManager.getValue_async('reuseDropFeedsTab', DefaultValues.reuseDropFeedsTab);
    elReuseDropFeedsTabCheckbox.addEventListener('click', (e) => { this._reuseDropFeedsTabCheckboxClicked_event(e); });

    let contentsDateTimeFormat = document.getElementById('contentsDateTimeFormat');
    let contentsDateTimeOptions = await LocalStorageManager.getValue_async('dateTimeOptions', DefaultValues.dateTimeOptions);
    contentsDateTimeFormat.value = JSON.stringify(contentsDateTimeOptions);
    ['keydown', 'keypress', 'cut', 'paste', 'change', 'input', 'blur'].forEach(evt =>
      contentsDateTimeFormat.addEventListener(evt, (e) => { this._contentsDateTimeFormatOnchange_event(e); }));
    let contentsDateTimeResetButton = document.getElementById('contentsDateTimeResetButton');
    contentsDateTimeResetButton.addEventListener('click', (e) => { this._contentsDateTimeResetButtonClicked_event(e); });

    let elHandlesFeedTabCheckbox = document.getElementById('handlesFeedTabCheckbox');
    elHandlesFeedTabCheckbox.checked = await LocalStorageManager.getValue_async('handlesFeedTab', DefaultValues.handlesFeedTab);
    elHandlesFeedTabCheckbox.addEventListener('click', (e) => { this._handlesFeedTabCheckboxClicked_event(e); });

    let elPreventOpenWithCheckbox = document.getElementById('preventOpenWithCheckbox');
    elPreventOpenWithCheckbox.checked = await LocalStorageManager.getValue_async('preventOpenWith', DefaultValues.preventOpenWith);
    elPreventOpenWithCheckbox.addEventListener('click', (e) => { this._preventOpenWithCheckboxClicked_event(e); });


    this._contentsDateTimeFormatOnchange_event();
    this._enableItemOptions();
    this._enablePreventOpenWith();
  }

  _updateLocalizedStrings() {
    document.getElementById('textRenderFeeds').textContent = browser.i18n.getMessage('optRenderFeeds');
    document.getElementById('contentsAreaTabOptionsLegend').textContent = browser.i18n.getMessage('optRenderFeedsOptions');
    document.getElementById('textItemNewTab').textContent = browser.i18n.getMessage('optItemNewTab');
    document.getElementById('textAlwaysOpenNewTab').textContent = browser.i18n.getMessage('optAlwaysOpenNewTab');
    document.getElementById('textOpenNewTabForeground').textContent = browser.i18n.getMessage('optOpenNewTabForeground');
    document.getElementById('textReuseDropFeedsTab').textContent = browser.i18n.getMessage('optReuseDropFeedsTab');
    document.getElementById('contentsDateTimeLegend').textContent = browser.i18n.getMessage('optContentsDateTimeLegend');
    document.getElementById('contentsDateTimeResetButton').textContent = browser.i18n.getMessage('optContentsDateTimeResetButton');
    document.getElementById('urlDatetimeHelp').textContent = browser.i18n.getMessage('optUrlDatetimeHelp');
    document.getElementById('contentsAreaAdvLegend').textContent = browser.i18n.getMessage('optContentsAreaAdvLegend');
    document.getElementById('textHandlesFeedTab').textContent = browser.i18n.getMessage('optHandlesFeedTabCheckbox');
    document.getElementById('textPreventOpenWith').textContent = browser.i18n.getMessage('optPreventOpenWith');
    document.getElementById('texWarningPreventOpenWith').textContent = browser.i18n.getMessage('optWarningPreventOpenWith');    
  }

  async _renderFeedsCheckBoxClicked_event() {
    await LocalStorageManager.setValue_async('renderFeeds', document.getElementById('renderFeedsCheckbox').checked);
    this._enableItemOptions();
  }

  async _itemNewTabCheckBoxClicked_event() {
    await LocalStorageManager.setValue_async('itemNewTab', document.getElementById('itemNewTabCheckbox').checked);
  }

  async _alwaysOpenNewTabCheckBoxClicked_event() {
    await LocalStorageManager.setValue_async('alwaysOpenNewTab', document.getElementById('alwaysOpenNewTabCheckbox').checked);
    this._enableItemOptions();
  }

  async _openNewTabForegroundCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('openNewTabForeground', document.getElementById('openNewTabForegroundCheckbox').checked);
  }

  async _reuseDropFeedsTabCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('reuseDropFeedsTab', document.getElementById('reuseDropFeedsTabCheckbox').checked);
  }

  async _contentsDateTimeFormatOnchange_event() {
    let contentsDateTimeOptions = null;
    let dateTimeString = null;
    try {
      contentsDateTimeOptions = JSON.parse(document.getElementById('contentsDateTimeFormat').value);
      dateTimeString = (new Date(2099, 11, 31, 13, 37, 0)).toLocaleString(window.navigator.language, contentsDateTimeOptions);
    }
    catch (e) {
      document.getElementById('contentsDateTimeFormat').classList.add('borderError');
      document.getElementById('contentsDateTimeExample').classList.add('textColorError');
      document.getElementById('contentsDateTimeExample').textContent = e.message.replace('JSON.parse: ', '');
      return;
    }
    document.getElementById('contentsDateTimeFormat').classList.remove('borderError');
    document.getElementById('contentsDateTimeExample').classList.remove('textColorError');
    document.getElementById('contentsDateTimeExample').textContent = dateTimeString;
    await LocalStorageManager.setValue_async('dateTimeOptions', contentsDateTimeOptions);
  }

  async _contentsDateTimeResetButtonClicked_event() {
    document.getElementById('contentsDateTimeFormat').value = JSON.stringify(DefaultValues.dateTimeOptions);
    this._contentsDateTimeFormatOnchange_event();
  }

  _enableItemOptions() {
    let enabled = document.getElementById('renderFeedsCheckbox').checked;
    CssManager.setElementEnableByIdEx('contentsAreaTabOptionsFieldset', null, enabled);
    CssManager.setElementEnableByIdEx('reuseDropFeedsTabCheckbox', 'textReuseDropFeedsTab', enabled);
    CssManager.setElementEnableByIdEx('contentsDateTimeFieldset', null, enabled);
  }

  _enablePreventOpenWith() {
    let enabled = document.getElementById('handlesFeedTabCheckbox').checked;
    CssManager.setElementEnableByIdEx('preventOpenWithCheckbox', 'textPreventOpenWith', enabled);
  }

  async _handlesFeedTabCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('handlesFeedTab', document.getElementById('handlesFeedTabCheckbox').checked);
    this._enablePreventOpenWith();
  }

  async _preventOpenWithCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('preventOpenWith', document.getElementById('preventOpenWithCheckbox').checked);
  }


}
