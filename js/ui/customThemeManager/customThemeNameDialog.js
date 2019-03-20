/*global browser ThemeCustomManager*/
'use strict';
class CustomThemeNameDialog { /*exported CustomThemeNameDialog*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._isRenameDialog = undefined;
    this._callback_async = undefined;
    this._themKind = undefined;
    this._oldName = undefined;
    this._file = undefined;
    this._dialog = document.getElementById('nameDialog');
    document.getElementById('cancelNameButton').addEventListener('click', (e) => { this._cancelButtonClicked_event(e); });
    document.getElementById('okNameButton').addEventListener('click', (e) => { this._okButtonClicked_event(e); });
    document.getElementById('inputName').addEventListener('keyup', (e) => { this._inputKeyup_event(e); });
  }

  _updateLocalizedStrings() {
    if (this._isRenameDialog) {
      document.getElementById('nameDialogDialogTitle').textContent = browser.i18n.getMessage('cthDiagRename');
      document.getElementById('nameButtonDialog').textContent = browser.i18n.getMessage('cthDiagNewName');
    }
    else {
      document.getElementById('nameDialogDialogTitle').textContent = browser.i18n.getMessage('cthDiagImport');
      document.getElementById('nameButtonDialog').textContent = browser.i18n.getMessage('cthDiagThemeName');

    }
    document.getElementById('okNameButton').textContent = browser.i18n.getMessage('cthDiagOk');
    document.getElementById('cancelNameButton').textContent = browser.i18n.getMessage('cthDiagCancel');
  }

  _show(elementComeFrom) {
    this._dialog.classList.remove('hide');
    this._dialog.classList.add('show');
    this._setPosition(elementComeFrom);
    this._selectAndFocusInputNewName();
  }

  getThemeName(isRenameDialog, elementComeFrom, themKind, oldName, file, _callback_async) {
    this._isRenameDialog = isRenameDialog;
    this._callback_async = _callback_async;
    this._themKind = themKind;
    this._oldName = (oldName.endsWith('.zip') ? oldName.split('.').slice(0, -1).join('.') : oldName);
    this._file = file;
    this._updateLocalizedStrings();
    this._show(elementComeFrom);
  }

  hide() {
    this._dialog.classList.remove('show');
    this._dialog.classList.add('hide');
  }

  _setPosition(elementComeFrom) {
    let rectSelectedElement = elementComeFrom.getBoundingClientRect();
    let x = Math.round(rectSelectedElement.left) + 20;
    let y = Math.round(rectSelectedElement.top) + 20;
    let xMax = Math.max(0, document.body.offsetWidth - this._dialog.offsetWidth - 4);
    let yMax = Math.max(0, document.body.offsetHeight - this._dialog.offsetHeight - 2);
    x = Math.min(xMax, x);
    y = Math.min(yMax, y);
    this._dialog.style.left = x + 'px';
    this._dialog.style.top = y + 'px';
  }

  _selectAndFocusInputNewName() {
    let input = document.getElementById('inputName');
    input.value = this._oldName;
    if (this._themKind) {
      input.value = ThemeCustomManager.instance.getThemeNameWithoutPrefix(this._themKind, this._oldName);
    }
    input.setSelectionRange(0, input.value.length);
    input.focus();
  }

  async _cancelButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this.hide();
  }

  async _okButtonClicked_event() {
    event.stopPropagation();
    event.preventDefault();
    let themName = document.getElementById('inputName').value;
    await this._callback_async(themName, this._themKind, this._oldName, this._file);
    this.hide();
  }

  async _inputKeyup_event() {
    event.preventDefault();
    if (event.keyCode === 13) {
      document.getElementById('okNameButton').click();
    }
  }
}