/* global browser DefaultValues LocalStorageManager */
'use strict';
class FeedsInfoView { /*exported FeedsInfoView*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._elInfoView = null;
    this._idComeFrom = null;
    this._info = null;
    this._elContent = document.getElementById('feedsContentPanel');
    this._updateLocalizedStrings();
    document.getElementById('infoUpdateButton').addEventListener('click', (e) => { this._updateButtonClicked_event(e); });
    document.getElementById('infoCloseButton').addEventListener('click', (e) => { this._closeButtonClicked_event(e); });
  }

  hide(){
    document.getElementById('infoView').classList.remove('show');
    document.getElementById('infoView').classList.add('hide');
  }

  show(xPos, yPos, idComeFrom){
    this._idComeFrom = idComeFrom;
    this._populateInfoAndPos_async(xPos, yPos);
    this._elInfoView = document.getElementById('infoView');
    this._elInfoView.classList.remove('hide');
    this._elInfoView.classList.add('show');
  }

  _updateLocalizedStrings() {
    document.getElementById('infoDialogTitle').textContent = browser.i18n.getMessage('sbInfoDialogTitle');
    document.getElementById('infoIdLbl').textContent = browser.i18n.getMessage('sbInfoIdLdl');
    document.getElementById('infoNameLbl').textContent = browser.i18n.getMessage('sbInfoNameLbl');
    document.getElementById('infoAddressLbl').textContent = browser.i18n.getMessage('sbInfoAddressLbl');
    document.getElementById('infoMinRefreshLbl').textContent = browser.i18n.getMessage('sbInfoMinRefreshLbl');
    const minRefreshTooltip = browser.i18n.getMessage('sbInfoMinRefreshTooltip');
    document.getElementById('infoMinRefreshLbl').title = minRefreshTooltip;
    document.getElementById('infoMinRefreshField').title = minRefreshTooltip;
    document.getElementById('infoUpdateButton').textContent = browser.i18n.getMessage('sbInfoUpdateButton');
    document.getElementById('infoCloseButton').textContent = browser.i18n.getMessage('sbInfoCloseButton');
  }

  async _populateInfoAndPos_async(xPos, yPos) {
    this._info = (await browser.bookmarks.get(this._idComeFrom))[0];
    document.getElementById('infoIdField').textContent = this._idComeFrom ? this._idComeFrom : ' ';
    document.getElementById('infoNameField').value = this._info.title ? this._info.title : '';
    let elInfoAddressLbl = document.getElementById('infoAddressLbl');
    let elInfoAddressField = document.getElementById('infoAddressField');
    let isFolder = !this._info.url;
    if (!isFolder) {
      elInfoAddressField.value = this._info.url;
      elInfoAddressField.classList.remove('hide');
      elInfoAddressField.classList.add('show');
      elInfoAddressLbl.classList.remove('hide');
      elInfoAddressLbl.classList.add('show');
    }
    else {
      elInfoAddressField.value = '';
      elInfoAddressField.classList.remove('show');
      elInfoAddressField.classList.add('hide');
      elInfoAddressLbl.classList.remove('show');
      elInfoAddressLbl.classList.add('hide');
    }
    await this._populateMinRefresh_async(isFolder);
    this._setPosition(xPos, yPos);
  }

  async _populateMinRefresh_async(isFolder) {
    let elRow = document.getElementById('infoMinRefreshRow');
    let elField = document.getElementById('infoMinRefreshField');
    if (isFolder) {
      let storageKey = 'cb-' + this._idComeFrom;
      let storedFolder = await LocalStorageManager.getValue_async(storageKey, DefaultValues.getStoredFolder(storageKey));
      let minSec = storedFolder ? storedFolder.minAutoRefreshSeconds : undefined;
      elField.value = (typeof minSec === 'number' && minSec > 0) ? String(minSec) : '';
      elRow.style.display = '';
    } else {
      elField.value = '';
      elRow.style.display = 'none';
    }
  }

  _setPosition(xPos, yPos) {
    let xMax  = Math.max(0, this._elContent.offsetWidth - this._elInfoView.offsetWidth - 36);
    let x = Math.min(xMax, xPos);

    let yMax  = Math.max(0, this._elContent.offsetHeight - this._elInfoView.offsetHeight + 60);
    let y = Math.min(yMax, yPos + 17);

    this._elInfoView.style.left = x + 'px';
    this._elInfoView.style.top = y + 'px';
  }

  async _updateButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    let name = document.getElementById('infoNameField').value;
    let url = document.getElementById('infoAddressField').value;
    let isFolder = !this._info.url;
    let changes = isFolder ? {title: name} : {title: name, url: url};
    browser.bookmarks.update(this._idComeFrom, changes);
    if (isFolder) {
      await this._saveMinRefresh_async();
    }
    this.hide();
  }

  async _saveMinRefresh_async() {
    let raw = document.getElementById('infoMinRefreshField').value;
    let trimmed = raw ? raw.trim() : '';
    let parsed = trimmed === '' ? NaN : Number(trimmed);
    let storageKey = 'cb-' + this._idComeFrom;
    let storedFolder = await LocalStorageManager.getValue_async(storageKey, DefaultValues.getStoredFolder(storageKey));
    if (!storedFolder || typeof storedFolder !== 'object') {
      storedFolder = DefaultValues.getStoredFolder(storageKey);
    }
    if (Number.isFinite(parsed) && parsed > 0) {
      storedFolder.minAutoRefreshSeconds = Math.floor(parsed);
    } else {
      delete storedFolder.minAutoRefreshSeconds;
      delete storedFolder.lastAutoRefresh;
    }
    await LocalStorageManager.setValue_async(storageKey, storedFolder);
  }

  async _closeButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this.hide();
  }
}