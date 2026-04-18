'use strict';
function run(paramArray) {
  const str = paramArray[0];
  const regexpOrSubstr = paramArray[1];
  const newSubstr = paramArray[2];
  return str.replace(regexpOrSubstr, newSubstr);
}

onmessage = ((e) => {
  //name: wkReplace.js
  //params: [str, regexpOrSubstr, newSubstr]
  postMessage(run(e.data));
  //this.close();
});
