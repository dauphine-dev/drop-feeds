/*global browser, selectionBar, statusBar, localStorageManager, cssManager, dateTime*/
/*global defaultStoredFolder, checkFeedsAsync*/
//----------------------------------------------------------------------
'use strict';
//----------------------------------------------------------------------
class topMenu  { /*exported topMenu*/
  static get instance() {
    if (!this._instance) {
      this._instance = new topMenu();
    }
    return this._instance;
  }

  constructor() {
    this._updatedFeedsVisible = false;
    this._foldersOpened = true;
    this._buttonAddFeedEnabled = false;
  }

  async init_async() {
    this._updatedFeedsVisible = await localStorageManager.getValue_async('updatedFeedsVisibility');
    this.updatedFeedsSetVisibility();
    this.activateButton('toggleFoldersButton' , this._foldersOpened);

    document.getElementById('checkFeedsButton').addEventListener('click', this.checkFeedsButtonClicked_event);
    let elDiscoverFeedsButton = document.getElementById('discoverFeedsButton');
    elDiscoverFeedsButton.addEventListener('click', this.discoverFeedsButtonClicked_event);
    elDiscoverFeedsButton.style.opacity = '0.2';
    document.getElementById('onlyUpdatedFeedsButton').addEventListener('click', this.onlyUpdatedFeedsButtonClicked_event);
    document.getElementById('toggleFoldersButton').addEventListener('click', this.toggleFoldersButtonClicked_event);
    document.getElementById('addFeedButton').addEventListener('click', this.addFeedButtonClicked_event);
    document.getElementById('optionsMenuButton').addEventListener('click', this.optionsMenuClicked_event);
  }

  enableAddFeedButton(isEnable) {
    if (isEnable) {
      this._buttonAddFeedEnabled = true;
      document.getElementById('addFeedButton').style.opacity = '1';
    }
    else {
      this._buttonAddFeedEnabled = false;
      document.getElementById('addFeedButton').style.opacity = '0.2';
    }
  }

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
    statusBar.instance.workInProgress = animationEnable;
  }

  activateButton(buttonId, activated) {
    let el =  document.getElementById(buttonId);
    if (activated)
    {
      el.classList.add('thisItemSelected');
      el.classList.remove('thisItem');
    }
    else
    {
      el.classList.add('thisItem');
      el.classList.remove('thisItemSelected');
    }
  }

  updatedFeedsSetVisibility() {
    this.activateButton('onlyUpdatedFeedsButton' , this._updatedFeedsVisible);
    let visibleValue = this._updatedFeedsVisible ? 'display:none;' : 'visibility:visible;';
    cssManager.replaceStyle('.feedUnread', '  visibility: visible;\n  font-weight: bold;');
    cssManager.replaceStyle('.feedRead', visibleValue);
    cssManager.replaceStyle('.feedError', visibleValue);
    localStorageManager.setValue_async('updatedFeedsVisibility', this._updatedFeedsVisible);
  }

  async checkFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    checkFeedsAsync(document);
    selectionBar.putAtRoot();
  }

  async onlyUpdatedFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this._updatedFeedsVisible = ! this._updatedFeedsVisible;
    this.updatedFeedsSetVisibility();
    selectionBar.putAtRoot();
  }

  async toggleFoldersButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this._foldersOpened = !this._foldersOpened;
    let query = this._foldersOpened ? 'not(checked)' : 'checked';
    let folders = document.querySelectorAll('input[type=checkbox]:' + query);
    let i = folders.length;
    this.activateButton('toggleFoldersButton' , this._foldersOpened);
    while (i--) {
      let folderId = folders[i].id;
      let storedFolder = defaultStoredFolder(folderId);
      folders[i].checked = this._foldersOpened;
      storedFolder.checked = this._foldersOpened;
      localStorageManager.setValue_async(folderId, storedFolder);
    }
    selectionBar.putAtRoot();
  }

  async addFeedButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this._buttonAddFeedEnabled) { return; }
    browser.pageAction.openPopup();
    selectionBar.putAtRoot();
  }

  async discoverFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    statusBar.instance.text = 'not yet implemented!';
    selectionBar.putAtRoot();
    await dateTime.delay_async(250);
    statusBar.instance.text = '';
  }

  async optionsMenuClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    await browser.runtime.openOptionsPage();
    selectionBar.putAtRoot();
  }
}
