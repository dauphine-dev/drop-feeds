/*global ThemeCustomManager BrowserManager ThemeManager*/
'use strict';
class CustomThemeRenameDialog { /*exported CustomThemeRenameDialog*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._themKind = null;
    this._dialog = document.getElementById('renameDialog');
    this._updateLocalizedStrings();
    document.getElementById('cancelRenameButton').addEventListener('click', (e) => { this._cancelButtonClicked_event(e); });
    document.getElementById('applyRenameButton').addEventListener('click', (e) => { this._applyButtonClicked_event(e); });
    document.getElementById('inputNewName').addEventListener('keyup', (e) => { this._inputKeyup_event(e); });
  }

  _updateLocalizedStrings() {

  }

  show(elementComeFrom, themKind, oldName) {
    this._themKind = themKind;
    this._oldName = oldName;
    this._dialog.classList.remove('hide');
    this._dialog.classList.add('show');
    this._setPosition(elementComeFrom);
    this._selectAndFocusInputNewName();
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
    let input = document.getElementById('inputNewName');
    input.value = ThemeCustomManager.instance.getThemeNameWithoutPrefix(this._themKind, this._oldName);
    input.setSelectionRange(0, input.value.length);
    input.focus();
  }

  async _cancelButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this.hide();
  }

  async _applyButtonClicked_event() {
    event.stopPropagation();
    event.preventDefault();
    let newName = document.getElementById('inputNewName').value;
    await this._renameCustomTheme_async(newName);
    this.hide();
  }

  async _inputKeyup_event() {
    event.preventDefault();
    if (event.keyCode === 13) {
      document.getElementById('applyRenameButton').click();
    }
  }

  async _renameCustomTheme_async(newName) {
    let renameError = await ThemeCustomManager.instance.renameCustomTheme_async(this._themKind, this._oldName, newName);
    if (renameError) {
      switch (renameError.error) {
        case 'error':
          let moreInfo = (renameError.value ? ': ' + renameError.value : '');
          BrowserManager.setInnerHtmlById('errorMessage', 'Something went wrong' + moreInfo);
          break;
        case 'alreadyExist':
          BrowserManager.setInnerHtmlById('errorMessage', 'A theme already exist with the name: ' + renameError.value);
          break;
      }
    }
    else {
      await this._updateSelectedThemeName_async(newName);
      window.location.reload();
    }
  }

  async _updateSelectedThemeName_async(newName) {
    let oldName = ThemeCustomManager.instance.getThemeNameWithPrefix(this._themKind, this._oldName);
    newName = ThemeCustomManager.instance.getThemeNameWithPrefix(this._themKind, newName);
    switch (this._themKind) {
      case ThemeManager.instance.kind.mainTheme:
        if (ThemeManager.instance.mainThemeFolderName == oldName) {
          await ThemeManager.instance.setMainThemeFolderName_async(newName);
        }
        break;
      case ThemeManager.instance.kind.renderTheme:
        if (ThemeManager.instance.renderThemeFolderName == oldName) {
          await ThemeManager.instance.setRenderThemeFolderName_async(newName);
        }
        break;
      case ThemeManager.instance.kind.renderTemplate:
        if (ThemeManager.instance.renderTemplateFolderName == oldName) {
          await ThemeManager.instance.setRenderTemplateFolderName_async(newName);
        }
        break;
    }
  }
}