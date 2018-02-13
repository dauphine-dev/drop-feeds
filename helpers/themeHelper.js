/*global browser, storageLocalGetItemAsync, storageLocalSetItemAsync*/
'use strict';
//----------------------------------------------------------------------
async function getThemeFolderNameAsync() {
  let themeFolderName = await storageLocalGetItemAsync('themeFolderName');
  if (!themeFolderName) {
    themeFolderName = 'dauphine';
  }  
  return themeFolderName;
}
//----------------------------------------------------------------------
async function setThemeFolderNameAsync(themeFolderName) {
  await storageLocalSetItemAsync('themeFolderName', themeFolderName);
}
//----------------------------------------------------------------------
async function getThemeCssUrlMozExtAsync(cssName) {
  let cssUrl = await getThemeCssUrlAsync(cssName);
  let cssUrlMozExt = browser.extension.getURL(cssUrl);
  return cssUrlMozExt;
}
//----------------------------------------------------------------------
async function getThemeCssUrlAsync(cssName) {
  let themeFolderName = await getThemeFolderNameAsync();
  let cssUrl = '/themes/' + themeFolderName + '/css/' + cssName;
  return cssUrl;
}
//----------------------------------------------------------------------
async function getThemePageActionIcoAsync(iconName) {
  let themeFolderName = await getThemeFolderNameAsync();
  let cssUrl = '/themes/' + themeFolderName + '/img/' + iconName;
  return cssUrl;
}
//----------------------------------------------------------------------
async function loadCssAsync(pageName) {
  let cssUrl = await getThemeCssUrlAsync(pageName);
  let elCss = document.getElementById('cssLink');  
  elCss.setAttribute('href', cssUrl);
}
//----------------------------------------------------------------------
