/*global browser TabGeneral TabUpdateChecker TabContentArea TabTheme TabManagement*/
/*global TabView TabItems LocalStorageManager DefaultValues TabAdvanced*/
'use strict';
class AllTabControl { /*exported AllTabControl*/
  static get instance() { return (this._instance = this._instance || new this()); }

  async init_async() {
    this._updateLocalizedStrings();
    this._createTabLinks();
    await TabGeneral.instance.init_async();
    TabUpdateChecker.instance.init();
    await TabContentArea.instance.init_async();
    await TabTheme.instance.init_async();
    await TabManagement.instance.init_async();
    await TabView.instance.init_async();
    await TabItems.instance.init_async();
    await TabAdvanced.instance.init_async();
    await this._openLastTab_async();
  }

  _updateLocalizedStrings() {
    document.getElementById('generalTabButton').textContent = browser.i18n.getMessage('optGeneral');
    document.getElementById('updateCheckerTabButton').textContent = browser.i18n.getMessage('optUpdateChecker');
    document.getElementById('viewItemsButton').textContent = browser.i18n.getMessage('optItems');
    document.getElementById('viewTabButton').textContent = browser.i18n.getMessage('optView');
    document.getElementById('contentsAreaTabButton').textContent = browser.i18n.getMessage('optContentsArea');
    document.getElementById('managementTabButton').textContent = browser.i18n.getMessage('optManagement');
    document.getElementById('scriptsTabButton').textContent = browser.i18n.getMessage('optAdvanced');
  }

  async _openLastTab_async() {
    let currentOptionTabName = await LocalStorageManager.getValue_async('currentOptionTabName', DefaultValues.currentOptionTabName);
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
    await LocalStorageManager.setValue_async('currentOptionTabName', tabName);
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

