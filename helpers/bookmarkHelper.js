/*global browser*/
'use strict';
//----------------------------------------------------------------------
function bookmarkItemHasChild(bookmarkItem) {
  let result = false;
  if (bookmarkItem.children) {
    result = (bookmarkItem.children.length > 0);
  }
  return result;
}
//----------------------------------------------------------------------
