/*global browser*/
//----------------------------------------------------------------------
'use strict';
mainDbg();
//----------------------------------------------------------------------
async function mainDbg() {
  let storageLocalHtml = await getStorageLocalHtmlAsync();
  document.getElementById('debugContent').innerHTML += storageLocalHtml;
}
//----------------------------------------------------------------------
async function getStorageLocalHtmlAsync() {
  let storageLocal = await browser.storage.local.get();
  let nodataList = [];
  let miscList = [];
  let folderStateList = [];
  let bookmarkList = [];
  for (let property in storageLocal) {
    if (storageLocal.hasOwnProperty(property)) {
      if(typeof storageLocal[property] === 'undefined') {
        nodataList.push([property, 'undefined']);
        continue;
      }
      if (property.startsWith('cb-')) {
        folderStateList.push([property, storageLocal[property].toString() ]);
        continue;
      }
      if (storageLocal[property].isBkmrk || storageLocal[property].bkmrkId) {
        bookmarkList.push([property, storageLocal[property].toString()]);
        continue;
      }
      miscList.push([property, storageLocal[property].toString()]);
    }
  }

  bookmarkList.sort(function(a, b) {
    return new Date(b[1].pubDate) - new Date(a[1].pubDate);
  });

  let htmlText = '<table>\n';
  htmlText += addSectionHtml('Misc.');
  htmlText += listToHtml(nodataList);
  htmlText += listToHtml(miscList);
  htmlText += addSectionHtml('Bookmarks');
  htmlText += listToHtml(bookmarkList);
  htmlText += '</table>\n';
  return htmlText;
}
//----------------------------------------------------------------------
function listToHtml(list) {
  let htmlText = '';
  for(let item of list) {
    htmlText+= '<tr>';
    htmlText+= '<td>' + item[0] + '</td>' + '<td>' + printToHtml(item[1]) + '</td>';
    htmlText+= '</tr>\n';
  }
  return htmlText;
}
//----------------------------------------------------------------------
function addSectionHtml(text) {
  //let htmlText = '<tr><td/><td/></tr>\n';
  let htmlText = '';
  htmlText+= '<tr>';
  htmlText+= '<tr><td></td>' + '<td><h3>' + text + '</h3></td></tr>\n';
  return htmlText;
}
//----------------------------------------------------------------------
function printToHtml(message) {
  if (!message)  {return ''; }
  let html = '';
  if (typeof message == 'object') {
    html += (JSON && JSON.stringify ? JSON.stringify(message) : message);
  } else {
    html += message;
  }
  return html;
}
//----------------------------------------------------------------------
