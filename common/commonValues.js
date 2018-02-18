/*global storageLocalGetItemAsync*/
'use strict';
let _alwaysOpenNewTab = true;
let _openNewTabForeground = true;
//----------------------------------------------------------------------
async function loadCommonValuesAsync()
{
  _alwaysOpenNewTab = await getStoredValueAsync('alwaysOpenNewTab', _alwaysOpenNewTab);
  _openNewTabForeground = await getStoredValueAsync('openNewTabForeground', _openNewTabForeground);
  console.log('_openNewTabForeground:', _openNewTabForeground);
}
//----------------------------------------------------------------------
async function getStoredValueAsync(valueName, defaultValue) {
  let value = defaultValue;
  let storedValue = await storageLocalGetItemAsync(valueName);
  if (typeof storedValue != 'undefined') {
    value  = storedValue;
  }
  return value;
}
//----------------------------------------------------------------------
