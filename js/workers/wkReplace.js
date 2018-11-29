'use strict';
function run(paramArray) {
  let str = paramArray[0];
  let regexpOrSubstr = paramArray[1];
  let newSubstr = paramArray[2];  
  return str.replace(regexpOrSubstr, newSubstr);
}

onmessage = ((e)=> {  
  //name: wkReplace.js
  //params: [str, regexpOrSubstr, newSubstr]
  postMessage(run(e.data));
  //this.close();
});
