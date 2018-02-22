/*global browser*/
//----------------------------------------------------------------------
'use strict';
mainDbg();
//----------------------------------------------------------------------
async function mainDbg() {
  let storageLocalHtml = await storageLocalHtmlAsync();
  document.getElementById('debugContent').innerHTML += storageLocalHtml;
}
//----------------------------------------------------------------------
async function storageLocalHtmlAsync() {
  let storageLocal = await browser.storage.local.get();
  let nodataList = [];
  let miscList = [];
  let folderStateList = [];
  let bookmarkList = [];
  for (let property in storageLocal) {
    if (storageLocal.hasOwnProperty(property)) {
      if(typeof storageLocal[property] === 'undefined') {
        nodataList.push([property, typeof storageLocal[property], 'undefined']);
        continue;
      }
      if (property.startsWith('cb-')) {
        folderStateList.push([property, typeof storageLocal[property], storageLocal[property] ]);
        continue;
      }
      if (storageLocal[property] !== null) {
        if (storageLocal[property].isBkmrk || storageLocal[property].bkmrkId) {
          bookmarkList.push([property, typeof storageLocal[property], storageLocal[property] ]);
          continue;
        }
      }
      if (storageLocal[property] === null) {
        nodataList.push([property, typeof storageLocal[property], 'null']);
      }
      else {
        miscList.push([property, typeof storageLocal[property], storageLocal[property].toString() ]);
      }
    }
  }

  bookmarkList.sort(function(a, b) {
    return new Date(b[1].pubDate) - new Date(a[1].pubDate);
  });
  let htmlText = '\n';
  htmlText += '<table>\n';
  htmlText += '  ' + addSectionHtml('Misc.');
  htmlText += '  ' + listToHtml(nodataList);
  htmlText += '  ' + listToHtml(miscList);
  htmlText += '  ' + addSectionHtml('Bookmarks');
  htmlText += '  ' + listToHtml(bookmarkList);
  htmlText += '  ' + addSectionHtml('folder state');
  htmlText += '  ' + listToHtml(folderStateList);
  htmlText += '</table>\n';
  return htmlText;
}

//----------------------------------------------------------------------
function listToHtml(list) {
  let htmlText = '';
  for(let item of list) {
    htmlText+= '<tr>';
    for (let field of item) {
      htmlText+= '<td>' + printToHtml(field) + '</td>';
    }
    htmlText+= '</tr>\n';
  }
  return htmlText;
}
//----------------------------------------------------------------------
function addSectionHtml(text) {
  let nbCol = 3;
  let htmlText = '';
  htmlText+= '<tr>';
  htmlText+= '<td><h3>' + text + '</h3></td>';
  let max = nbCol -1;
  for (let i=0; i<max; i++){
    htmlText+= '<td></td>';
  }
  htmlText+= '</tr>\n';
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
