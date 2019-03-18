/*global browser Dialogs TextTools CssManager*/
'use strict';
class OptionSubscribeDialog { /*exported OptionSubscribeDialog*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._selectedId = null;
    this._elSubscribeByUrlDialog = document.getElementById('subscribeByUrlDialog');
    document.getElementById('subsByUrlSubscribeButton').disabled = true;
    CssManager.setElementEnableById('subsByUrlSubscribeButton', false);
    this._updateLocalizedStrings();
    document.getElementById('subsByUrlCloseButton').addEventListener('click', (e) => { this._closeButtonClicked_event(e); });
    document.getElementById('subsByUrlSubscribeButton').addEventListener('click', (e) => { this._subscribeButtonClicked_event(e); });
    document.getElementById('subsUrlField').addEventListener('change', (e) => { this._subsUrlFieldHasChanged_event(e); });
    document.getElementById('subsUrlField').addEventListener('keydown', (e) => { this._subsUrlFieldHasChanged_event(e); });
    document.getElementById('subsUrlField').addEventListener('cut', (e) => { this._subsUrlFieldHasChanged_event(e); });
    document.getElementById('subsUrlField').addEventListener('paste', (e) => { this._subsUrlFieldHasChanged_event(e); });
    document.getElementById('subsUrlField').addEventListener('input', (e) => { this._subsUrlFieldHasChanged_event(e); });
  }

  show(selectedId) {
    this._selectedId = selectedId;
    this._elSubscribeByUrlDialog.classList.remove('hide');
    this._elSubscribeByUrlDialog.classList.add('show');
    document.getElementById('subsUrlField').value = '';
    this._setPosition();
    this._selectAndFocusUrlField();
  }

  hide() {
    this._elSubscribeByUrlDialog.classList.remove('show');
    this._elSubscribeByUrlDialog.classList.add('hide');
  }

  _updateLocalizedStrings() {
    document.getElementById('subscribeDialogTitle').textContent = browser.i18n.getMessage('sbSubsDiaTitle');
    document.getElementById('subsUrlLbl').textContent = browser.i18n.getMessage('sbSubsDiaUrlLbl');
    document.getElementById('subsByUrlCloseButton').textContent = browser.i18n.getMessage('sbSubsDiaByUrlCloseButton');
    document.getElementById('subsByUrlSubscribeButton').textContent = browser.i18n.getMessage('sbSubsDiaByUrlSubscribeButton');
  }

  _setPosition() {
    let elMainDiv = document.getElementById('mainBoxTable');
    let elSelectedElement = document.getElementById(this._selectedId);
    let rectSelectedElement = elSelectedElement.getBoundingClientRect();
    let x = Math.round(rectSelectedElement.left);
    let y = Math.round(rectSelectedElement.bottom);
    let xMax = Math.max(0, elMainDiv.offsetWidth - this._elSubscribeByUrlDialog.offsetWidth);
    let yMax = Math.max(0, elMainDiv.offsetHeight - this._elSubscribeByUrlDialog.offsetHeight + 20);
    x = Math.min(xMax, x);
    y = Math.min(yMax, y);
    this._elSubscribeByUrlDialog.style.left = x + 'px';
    this._elSubscribeByUrlDialog.style.top = y + 'px';
  }

  _selectAndFocusUrlField() {
    let subsUrlField = document.getElementById('subsUrlField');
    subsUrlField.setSelectionRange(0, subsUrlField.value.length);
    subsUrlField.focus();
  }

  async _closeButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this.hide();
  }

  async _subscribeButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let feedUrl = document.getElementById('subsUrlField').value;
    await Dialogs.openSubscribeDialog_async('', feedUrl);
    this.hide();
  }

  async _subsUrlFieldHasChanged_event(event) {
    let isValidUrl = TextTools.isStringUrl(event.target.value);
    document.getElementById('subsByUrlSubscribeButton').disabled = !isValidUrl;
    CssManager.setElementEnableById('subsByUrlSubscribeButton', isValidUrl);
  }

  async _inputNewFolderKeyup_event(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      document.getElementById('createNewFolderButton').click();
    }
  }
}
