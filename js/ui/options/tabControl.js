/*global browser TabGeneral TabUpdateChecker TabContentArea TabManagement TabView TabItems LocalStorageManager DefaultValues*/
'use strict';
class TabControl { /*exported TabControl*/

  static async init_async() {
    TabControl._updateLocalizedStrings();
    TabControl._createTabLinks();
    TabGeneral.instance.init_async();
    TabUpdateChecker.init();
    TabContentArea.init_async();
    TabManagement.init();
    TabView.init_async();
    TabItems.init_async();
    TabControl._openLastTab_async();

  }

  static _updateLocalizedStrings() {
    document.getElementById('generalTabButton').textContent = browser.i18n.getMessage('optGeneral');
    document.getElementById('updateCheckerTabButton').textContent = browser.i18n.getMessage('optUpdateChecker');
    document.getElementById('viewItemsButton').textContent = browser.i18n.getMessage('optItems');
    document.getElementById('viewTabButton').textContent = browser.i18n.getMessage('optView');
    document.getElementById('contentsAreaTabButton').textContent = browser.i18n.getMessage('optContentsArea');
    document.getElementById('managementTabButton').textContent = browser.i18n.getMessage('optManagement');
  }

  static async _openLastTab_async() {
    let currentOptionTabName = await LocalStorageManager.getValue_async('currentOptionTabName', DefaultValues.currentOptionTabName);
    let targetTabElement = document.getElementById(currentOptionTabName + 'Button');
    TabControl._openTab_async(targetTabElement);
  }

  static _createTabLinks() {
    let tabLinksList = document.getElementsByClassName('tabLinks');
    for (let tabLink of tabLinksList) {
      tabLink.addEventListener('click', TabControl._openTabClicked_event);
    }
  }

  static async _openTabClicked_event(event) {
    TabControl._openTab_async(event.target);
  }

  static async _openTab_async(targetTabElement) {
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

