/* global browser */
'use strict';
class InfoView { /*exported InfoView*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._elInfoView = null;
    this._idComeFrom = null;
    this._info = null;
    this._elContent = document.getElementById('content');
    this._updateLocalizedStrings();
    document.getElementById('infoUpdateButton').addEventListener('click', (e) => { this._updateButtonClicked_event(e); });
    document.getElementById('infoCloseButton').addEventListener('click', (e) => { this._closeButtonClicked_event(e); });
  }

  hide(){
    document.getElementById('infoView').classList.remove('show');
    document.getElementById('infoView').classList.add('hide');
  }

  show(xPos, yPos, idComeFrom){
    let self = InfoView.instance;
    self._idComeFrom = idComeFrom;
    self._populateInfoAndPos_async(xPos, yPos);
    self._elInfoView = document.getElementById('infoView');
    self._elInfoView.classList.remove('hide');
    self._elInfoView.classList.add('show');
  }

  _updateLocalizedStrings() {
    document.getElementById('infoIdLbl').textContent = browser.i18n.getMessage('sbInfoIdLdl');
    document.getElementById('infoNameLbl').textContent = browser.i18n.getMessage('sbInfoNameLbl');
    document.getElementById('infoAddressLbl').textContent = browser.i18n.getMessage('sbInfoAddressLbl');
    document.getElementById('infoUpdateButton').textContent = browser.i18n.getMessage('sbInfoUpdateButton');
    document.getElementById('infoCloseButton').textContent = browser.i18n.getMessage('sbInfoCloseButton');
  }

  async _populateInfoAndPos_async(xPos, yPos) {
    this._info = (await browser.bookmarks.get(this._idComeFrom))[0];
    document.getElementById('infoIdField').textContent = this._idComeFrom ? this._idComeFrom : ' ';
    document.getElementById('infoNameField').value = this._info.title ? this._info.title : '';
    let elInfoAddressLbl = document.getElementById('infoAddressLbl');
    let elInfoAddressField = document.getElementById('infoAddressField');
    if (this._info.url) {
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
    this._setPosition(xPos, yPos);
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
    let self = InfoView.instance;
    event.stopPropagation();
    event.preventDefault();
    let name = document.getElementById('infoNameField').value;
    let url = document.getElementById('infoAddressField').value;
    let changes = self._info.url ? {title: name, url:url} : {title: name};
    browser.bookmarks.update(self._idComeFrom, changes);
    self.hide();
  }

  async _closeButtonClicked_event(event) {
    let self = InfoView.instance;
    event.stopPropagation();
    event.preventDefault();
    self.hide();
  }
}