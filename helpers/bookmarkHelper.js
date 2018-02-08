/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
//----------------------------------------------------------------------
function bookmarkItemHasChild(bookmarkItem) {
  let result = false;
  if (bookmarkItem.children) {
    result = (bookmarkItem.children.length > 0);
  }
  return result;
}
//----------------------------------------------------------------------
