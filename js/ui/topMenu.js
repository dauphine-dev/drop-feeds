/*global browser SelectionBar StatusBar LocalStorageManager CssManager DateTime FeedManager BookmarkManager*/
'use strict';
class TopMenu  { /*exported TopMenu*/
  static get instance() {
    if (!this._instance) {
      this._instance = new TopMenu();
    }
    return this._instance;
  }

  constructor() {
    this._updatedFeedsVisible = false;
    this._foldersOpened = true;
    this._buttonAddFeedEnabled = false;
  }

  async init_async() {
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
  }

  activateButton(buttonId, activated) {
    let el =  document.getElementById(buttonId);
    if (activated)
    {
      el.classList.add('itemSelected');
      el.classList.remove('item');
    }
    else
    {
      el.classList.add('item');
      el.classList.remove('itemSelected');
    }
  }

  updatedFeedsSetVisibility() {
    this.activateButton('onlyUpdatedFeedsButton' , this._updatedFeedsVisible);
    let visibleValue = this._updatedFeedsVisible ? 'display:none;' : 'visibility:visible;';
    CssManager.replaceStyle('.feedUnread', '  visibility: visible;\n  font-weight: bold;');
    CssManager.replaceStyle('.feedRead', visibleValue);
    CssManager.replaceStyle('.feedError', visibleValue);
    LocalStorageManager.setValue_async('updatedFeedsVisibility', this._updatedFeedsVisible);
  }

  async checkFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    SelectionBar.instance.putAtRoot();
    FeedManager.instance.checkFeeds_async(document);
  }

  async onlyUpdatedFeedsButtonClicked_event(event) {
    let self = TopMenu.instance;
    event.stopPropagation();
    event.preventDefault();
    self._updatedFeedsVisible = ! self._updatedFeedsVisible;
    self.updatedFeedsSetVisibility();
    SelectionBar.instance.putAtRoot();
  }

  async toggleFoldersButtonClicked_event(event) {
    let self = TopMenu.instance;
    event.stopPropagation();
    event.preventDefault();
    self._foldersOpened = !self._foldersOpened;
    let query = self._foldersOpened ? 'not(checked)' : 'checked';
    let folders = document.querySelectorAll('input[type=checkbox]:' + query);
    let i = folders.length;
    self.activateButton('toggleFoldersButton' , self._foldersOpened);
    while (i--) {
      let folderId = folders[i].id;
      let storedFolder = BookmarkManager.getDefaultStoredFolder(folderId);
      folders[i].checked = self._foldersOpened;
      storedFolder.checked = self._foldersOpened;
      LocalStorageManager.setValue_async(folderId, storedFolder);
    }
    SelectionBar.instance.putAtRoot();
  }

  async addFeedButtonClicked_event(event) {
    let self = TopMenu.instance;
    event.stopPropagation();
    event.preventDefault();
    if (!self._buttonAddFeedEnabled) { return; }
    browser.pageAction.openPopup();
    SelectionBar.instance.putAtRoot();
  }

  async discoverFeedsButtonClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    StatusBar.instance.text = 'not yet implemented!';
    SelectionBar.instance.putAtRoot();
    await DateTime.delay_async(250);
    StatusBar.instance.text = '';
  }

  async optionsMenuClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    await browser.runtime.openOptionsPage();
    SelectionBar.instance.putAtRoot();
  }
}
