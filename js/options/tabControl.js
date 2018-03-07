/*global TabGeneral TabUpdateChecker TabContentArea TabManagement*/
'use strict';
class TabControl { /*exported TabControl*/

  static async init_async() {
    TabControl._createTabLinks();
    TabGeneral.instance.init_async();
    TabUpdateChecker.init();
    await TabContentArea.init_async();
    TabManagement.init();
  }

  static _createTabLinks() {
    let tabLinksList = document.getElementsByClassName('tabLinks');
    for (let tabLink of tabLinksList) {
      tabLink.addEventListener('click', TabControl._openTabClicked_event);
    }
  }

  static _openTabClicked_event(event) {
    let tabName = event.currentTarget.getAttribute('target');
    let i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName('tabContent');
    for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = 'none';
    }
    tabLinks = document.getElementsByClassName('tabLinks');
    for (i = 0; i < tabLinks.length; i++) {
      tabLinks[i].className = tabLinks[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.className += ' active';
  }
}

