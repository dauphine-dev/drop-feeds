/*global storageLocalGetItemAsync*/
'use strict';
let _alwaysOpenNewTab = true;
let _openNewTabForeground = true;
let _timeOutMs = 10000;
//----------------------------------------------------------------------
async function loadCommonValuesAsync()
{
  _alwaysOpenNewTab = await getStoredValueAsync('alwaysOpenNewTab', _alwaysOpenNewTab);
  _openNewTabForeground = await getStoredValueAsync('openNewTabForeground', _openNewTabForeground);
  _timeOutMs = await getStoredValueAsync('timeOut', _timeOutMs);
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
