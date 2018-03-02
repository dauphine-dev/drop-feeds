/*global tabGeneral tabUpdateChecker tabContentArea tabManagement*/
'use strict';
class tabControl { /*exported tabControl*/
  static init() {
    tabControl._createTabLinks();
    tabGeneral.instance.init();
    tabUpdateChecker.init();
    tabContentArea.init();
    tabManagement.init();
  }

  static _createTabLinks() {
    let tabLinksList = document.getElementsByClassName('tabLinks');
    for (let tabLink of tabLinksList) {
      tabLink.addEventListener('click', tabControl._openTabClicked_event);
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
  //----------------------------------------------------------------------

}

