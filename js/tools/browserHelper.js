/*global browser, commonValues*/
'use strict';
//----------------------------------------------------------------------
async function isTabEmptyAsync(tab) {
  let isEmpty = (tab.url == 'about:blank' || tab.url == 'about:newtab') && (tab.status == 'complete');
  return isEmpty;
}
//----------------------------------------------------------------------
async function getActiveTabAsync() {
  let tabInfos = await browser.tabs.query({active: true, currentWindow: true});
  return tabInfos[0];
}
//----------------------------------------------------------------------
function displayNotification(message) {
  browser.notifications.create({
    'type': 'basic',
    'iconUrl': browser.extension.getURL(commonValues.iconDF96Url),
    'title': 'Drop feeds',
    'message': message
  });
}
//----------------------------------------------------------------------
