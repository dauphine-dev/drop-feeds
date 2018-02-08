/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
//----------------------------------------------------------------------
function addEventListener(elId, eventName, handler) {
   document.getElementById(elId).addEventListener(
      eventName, function (event) { handler(event); }); 
}
//----------------------------------------------------------------------
