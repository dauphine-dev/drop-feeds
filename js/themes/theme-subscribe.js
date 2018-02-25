/*global themeManager*/
'use strict';
loadSubscribeCss_async();
//----------------------------------------------------------------------
async function loadSubscribeCss_async() {
  await themeManager.reload_async();
  themeManager.applyCssToCurrentDocument('subscribe.css');
}
//----------------------------------------------------------------------
