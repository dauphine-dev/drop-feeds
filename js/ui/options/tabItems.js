/*global browser DefaultValues LocalStorageManager*/
'strict';
class TabItems { /*exported TabItems*/
  static async init_async() {
    TabItems._updateLocalizedStrings();

    let elFeedItemListCheckbox = document.getElementById('feedItemListCheckbox');
    elFeedItemListCheckbox.checked =  await LocalStorageManager.getValue_async('feedItemList', DefaultValues.feedItemList);
    elFeedItemListCheckbox.addEventListener('click', TabItems._feedItemListCheckboxClicked_event);

    let elFeedItemListToolbarCheckbox = document.getElementById('feedItemListToolbarCheckbox');
    elFeedItemListToolbarCheckbox.checked =  await LocalStorageManager.getValue_async('feedItemListToolbar', DefaultValues.feedItemListToolbar);
    elFeedItemListToolbarCheckbox.addEventListener('click', TabItems._feedItemListToolbarCheckboxClicked_event);

    let elFeedItemDescriptionTooltipsCheckbox = document.getElementById('feedItemDescriptionTooltipsCheckbox');
    elFeedItemDescriptionTooltipsCheckbox.checked =  await LocalStorageManager.getValue_async('feedItemDescriptionTooltips', DefaultValues.feedItemDescriptionTooltips);
    elFeedItemDescriptionTooltipsCheckbox.addEventListener('click', TabItems._feedItemDescriptionTooltipsCheckboxClicked_event);
  }

  static _updateLocalizedStrings() {
    document.getElementById('textFeedItemList').textContent = browser.i18n.getMessage('optFeedItemList');
    document.getElementById('textFeedItemListToolbar').textContent = browser.i18n.getMessage('optFeedItemListToolbar');
    document.getElementById('textDescriptionTooltips').textContent = browser.i18n.getMessage('optDescriptionTooltips');
    document.getElementById('textNavigationHistoryWarning').textContent = browser.i18n.getMessage('optNavigationHistoryWarning');
  }

  static async _feedItemListCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('feedItemList', document.getElementById('feedItemListCheckbox').checked);
  }

  static async _feedItemListToolbarCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('feedItemListToolbar', document.getElementById('feedItemListToolbarCheckbox').checked);
  }

  static async _feedItemDescriptionTooltipsCheckboxClicked_event() {
    await LocalStorageManager.setValue_async('feedItemDescriptionTooltips', document.getElementById('feedItemDescriptionTooltipsCheckbox').checked);
  }
}
