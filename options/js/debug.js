/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global browser*/
//----------------------------------------------------------------------
"use strict";
mainDbg();
//----------------------------------------------------------------------
async function mainDbg() {
  let storageLocalHtml = await getStorageLocalHtmlAsync();
  document.getElementById('debugContent').innerHTML += storageLocalHtml;
}
//----------------------------------------------------------------------
async function getStorageLocalHtmlAsync() {
  let storageLocalHtml = '<table>\n';
  let storageLocalMiscHtml = '';
  let storageLocalBookmarksHtml = '';
  let storageLocal = await browser.storage.local.get();
  for (var property in storageLocal) {
    if (storageLocal.hasOwnProperty(property)) {
      if (!storageLocal[property]) { 
        storageLocalMiscHtml+= '<tr>';
        storageLocalMiscHtml+= '<td>' + property + '</td><td/>';
        storageLocalMiscHtml+= '</tr>\n';
      }
      else if (! (storageLocal[property].isBkmrk || storageLocal[property].bkmrkId)) {
        storageLocalMiscHtml+= '<tr>';
        storageLocalMiscHtml+= '<td>' + property + '</td>' + '<td>' + printToHtml(storageLocal[property]) + '</td>';
        storageLocalMiscHtml+= '</tr>\n';
      }
      else {
        storageLocalBookmarksHtml+= '<tr>';
        storageLocalBookmarksHtml+= '<td>' + property + '</td>' + '<td>' + printToHtml(storageLocal[property]) + '</td>';
        storageLocalBookmarksHtml+= '</tr>\n';
      }
    }
  }
  storageLocalHtml+= storageLocalMiscHtml + '<tr><td>&nbsp;<td><td/></tr>' +  storageLocalBookmarksHtml + '</table>\n';
  return storageLocalHtml;
}
//----------------------------------------------------------------------
function printToHtml(message) {
  let html = '';
  if (typeof message == 'object') {
      html += (JSON && JSON.stringify ? JSON.stringify(message) : message);
  } else {
      html += message;
  }
  return html;
}
//----------------------------------------------------------------------
