/*global themeManager*/
'use strict';
loadSidebarCss_async();
//----------------------------------------------------------------------
async function loadSidebarCss_async() {
  await themeManager.reload_async();
  themeManager.applyCssToCurrentDocument('sidebar.css');
}
//----------------------------------------------------------------------
