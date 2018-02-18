/*global storageLocalGetItemAsync*/
'use strict';
//----------------------------------------------------------------------
async function displayRootFolderAsync() {
  let displayRootFolderText = await storageLocalGetItemAsync('displayRootFolder');
  let displayRootFolder = true;
  if (displayRootFolderText) {
    displayRootFolder = (displayRootFolderText == 'yes');
  }
  return displayRootFolder;
}
//----------------------------------------------------------------------
