//----------------------------------------------------------------------
function addEventListener(elId, eventName, handler) {
  document.getElementById(elId).addEventListener(
    eventName, function (event) { handler(event); }); 
}
//----------------------------------------------------------------------
