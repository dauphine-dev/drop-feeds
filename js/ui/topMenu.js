/*global browser, selectionBar, statusBar*/
/*global storageLocalGetItemAsync, storageLocalSetItemAsync, defaultStoredFolder, sleep, getStyle, replaceStyle
checkFeedsAsync, discoverFeedsAsync, optionsMenuAsync*/
//----------------------------------------------------------------------
'use strict';
//----------------------------------------------------------------------
let topMenu = {
  _updatedFeedsVisible: false,
  _foldersOpened: true,
  _buttonAddFeedEnabled: false,
  //------------------------------
  async init_async() {
    topMenu._updatedFeedsVisible = await storageLocalGetItemAsync('updatedFeedsVisibility');
    topMenu.updatedFeedsSetVisibility();
    topMenu.activateButton('toggleFoldersButton' , topMenu._foldersOpened);

    document.getElementById('checkFeedsButton').addEventListener('click', topMenu.checkFeedsButtonClicked_event);
    let elDiscoverFeedsButton = document.getElementById('discoverFeedsButton');
    elDiscoverFeedsButton.addEventListener('click', topMenu.discoverFeedsButtonClicked_event);
    elDiscoverFeedsButton.style.opacity = '0.2';
    document.getElementById('onlyUpdatedFeedsButton').addEventListener('click', topMenu.onlyUpdatedFeedsButtonClicked_event);
    document.getElementById('toggleFoldersButton').addEventListener('click', topMenu.toggleFoldersButtonClicked_event);
    document.getElementById('addFeedButton').addEventListener('click', topMenu.addFeedButtonClicked_event);
    document.getElementById('optionsMenuButton').addEventListener('click', topMenu.optionsMenuClicked_event);
  },
  //------------------------------
  enableAddFeedButton(isEnable) {
    if (isEnable) {
      topMenu._buttonAddFeedEnabled = true;
      document.getElementById('addFeedButton').style.opacity = '1';
    }
    else {
      topMenu._buttonAddFeedEnabled = false;
      document.getElementById('addFeedButton').style.opacity = '0.2';
    }
  },
  //------------------------------
  animateCheckFeedButton(animationEnable) {
    if (animationEnable)
    {
      document.getElementById('checkFeedsButton').classList.add('checkFeedsButtonAnim');
      document.getElementById('checkFeedsButton').classList.remove('checkFeedsButton');
    }
    else
    {
      document.getElementById('checkFeedsButton').classList.add('checkFeedsButton');
      document.getElementById('checkFeedsButton').classList.remove('checkFeedsButtonAnim');
    }
    //Todo: move it at the call level
    statusBar.workInProgress(animationEnable);
  },
  //------------------------------
  activateButton(buttonId, activated) {
    let el =  document.getElementById(buttonId);
    if (activated)
    {
      el.classList.add('topMenuItemSelected');
      el.classList.remove('topMenuItem');
    }
    else
    {
      el.classList.add('topMenuItem');
      el.classList.remove('topMenuItemSelected');
    }
  },
  //------------------------------
  updatedFeedsSetVisibility() {
    topMenu.activateButton('onlyUpdatedFeedsButton' , topMenu._updatedFeedsVisible);
    let visibleValue = topMenu._updatedFeedsVisible ? 'display:none;' : 'visibility:visible;';
    replaceStyle('.feedUnread', '  visibility: visible;\n  font-weight: bold;');
    replaceStyle('.feedRead', visibleValue);
    replaceStyle('.feedError', visibleValue);
    storageLocalSetItemAsync('updatedFeedsVisibility', topMenu._updatedFeedsVisible);
  },
  //------------------------------
  //------------------------------
  async checkFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    checkFeedsAsync(document);
    selectionBar.putAtRoot();
  },
  //------------------------------
  async onlyUpdatedFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    topMenu._updatedFeedsVisible = ! topMenu._updatedFeedsVisible;
    topMenu.updatedFeedsSetVisibility();
    selectionBar.putAtRoot();
  },
  async toggleFoldersButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    topMenu._foldersOpened = !topMenu._foldersOpened;
    let query = topMenu._foldersOpened ? 'not(checked)' : 'checked';
    let folders = document.querySelectorAll('input[type=checkbox]:' + query);
    let i = folders.length;
    topMenu.activateButton('toggleFoldersButton' , topMenu._foldersOpened);
    while (i--) {
      let folderId = folders[i].id;
      let storedFolder = defaultStoredFolder(folderId);
      folders[i].checked = topMenu._foldersOpened;
      storedFolder.checked = topMenu._foldersOpened;
      storageLocalSetItemAsync(folderId, storedFolder);
    }
    selectionBar.putAtRoot();
  },
  //------------------------------
  async addFeedButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!topMenu._buttonAddFeedEnabled) { return; }
    browser.pageAction.openPopup();
    selectionBar.putAtRoot();
  },
  //------------------------------
  async discoverFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    statusBar.printMessage('not yet implemented!');
    selectionBar.putAtRoot();
    await sleep(250);
    statusBar.printMessage('');
  },
  //------------------------------
  async optionsMenuClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    await browser.runtime.openOptionsPage();
    selectionBar.putAtRoot();
  }
};
