/* global browser */
'use strict';
class InfoView { /*exported InfoView*/
  static get instance() {
    if (!this._instance) {
      this._instance = new InfoView();
    }
    return this._instance;
  }

  constructor() {
    document.getElementById('infoCloseButton').addEventListener('click', InfoView._closeButtonClicked_event);
    this._updateLocalizedStrings();
    this._elContent = document.getElementById('content');
    this._elInfoView = null;
    this._idComeFrom = null;
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
    document.getElementById('infoCloseButton').textContent = browser.i18n.getMessage('sbInfoCloseButton');
  }

  async _populateInfoAndPos_async(xPos, yPos) {
    let info = (await browser.bookmarks.get(this._idComeFrom))[0];
    document.getElementById('infoIdField').textContent = this._idComeFrom ? this._idComeFrom : ' ';
    document.getElementById('infoNameField').textContent = info.title ? info.title : ' ';
    document.getElementById('infoAddressField').textContent = info.url ? info.url : ' ';
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

  static async _closeButtonClicked_event(event) {
    let self = InfoView.instance;
    event.stopPropagation();
    event.preventDefault();
    self.hide();
  }
}