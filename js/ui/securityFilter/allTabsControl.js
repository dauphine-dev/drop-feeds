/*global browser TabHtmlFilter  TabCssFilter LocalStorageManager DefaultValues*/
'use strict';
class AllTabControl { /*exported AllTabControl*/
  static get instance() { return (this._instance = this._instance || new this()); }

  async init_async() {
    this._updateLocalizedStrings();
    this._createTabLinks();
    await TabHtmlFilter.instance.init_async();
    await TabCssFilter.instance.init_async();
    await this._openLastTab_async();
  }

  _updateLocalizedStrings() {
    document.getElementById('securityFilterSettings').textContent = browser.i18n.getMessage('optSecurityFilterSettings');
    document.getElementById('messageDialogTitle').textContent = browser.i18n.getMessage('optMessageDialogTitle');
    document.getElementById('messageDialogOk').textContent = browser.i18n.getMessage('optMessageDialogOk');    
  }

  async _openLastTab_async() {
    let currentOptionTabName = await LocalStorageManager.getValue_async('currentSecurityFilterTabName', DefaultValues.currentSecurityFilterTabName);
    let targetTabElement = document.getElementById(currentOptionTabName + 'Button');
    await this._openTab_async(targetTabElement);
  }

  _createTabLinks() {
    let tabLinksList = document.getElementsByClassName('tabLinks');
    for (let tabLink of tabLinksList) {
      tabLink.addEventListener('click', (e) => { this._openTabClicked_event(e); });
    }
  }

  async _openTabClicked_event(event) {
    await this._openTab_async(event.target);
  }

  async _openTab_async(targetTabElement) {
    let tabName = targetTabElement.getAttribute('target');
    await LocalStorageManager.setValue_async('currentSecurityFilterTabName', tabName);
    let i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName('tabContent');
    for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = 'none';
    }
    tabLinks = document.getElementsByClassName('tabLinks');
    for (i = 0; i < tabLinks.length; i++) {
      tabLinks[i].classList.remove('active');
    }
    document.getElementById(tabName).style.display = 'block';
    targetTabElement.classList.add('active');
  }
}
AllTabControl.instance.init_async();