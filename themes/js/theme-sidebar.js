/*global themeManager*/
'use strict';
loadSidebarCss_async();
//----------------------------------------------------------------------
async function loadSidebarCss_async() {
  await themeManager.reload_async();
  await themeManager.applyCssToCurrentDocument_async('sidebar.css');
}
//----------------------------------------------------------------------
