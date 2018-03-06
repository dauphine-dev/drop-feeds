/*global browser SideBar BookmarksInfo*/
'use strict';
class LocalStorageListener { /*exported LocalStorageListener*/
  constructor() {
    browser.storage.onChanged.addListener(LocalStorageListener._storageChanged_event);
  }

  static async _storageChanged_event(changes) {
    let changedItems = Object.keys(changes);
    if (changedItems.includes('importInProgress')) {
      BookmarksInfo.instance.importInProgress = changes.importInProgress.newValue;
    }

    if (changedItems.includes('reloadPanel')) {
      SideBar.instance.reloadPanel_async();
    } else if (changedItems.includes('reloadPanelWindow')) {
      SideBar.instance.reloadPanelWindow();
    }

  }

}
