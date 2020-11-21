'use strict';
function run(paramArray) {
  const str = paramArray[0];
  const regexpOrSubstr = paramArray[1];
  const newSubstr = paramArray[2];
  const ignoreSecurityPassThroughSuffix = paramArray[3];
  if (!ignoreSecurityPassThroughSuffix) { //security pass through suffix from custom scripts    
    const toCheck = (regexpOrSubstr instanceof RegExp ? regexpOrSubstr.source : regexpOrSubstr);
    if (toCheck.includes('_dp')) { return str; }
  }
  return str.replace(regexpOrSubstr, newSubstr);
}

onmessage = ((e) => {
  //name: wkReplace.js
  //params: [str, regexpOrSubstr, newSubstr, ignoreSecurityPassThroughSuffix]
  postMessage(run(e.data));
  //this.close();
});
