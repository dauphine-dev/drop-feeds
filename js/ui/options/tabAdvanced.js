/*global browser BrowserManager JSZip ZipTools OpmlExporter OpmlImporter ProgressBar BookmarkManager LocalStorageManager ThemeCustomManager*/
'use strict';
class TabAdvanced { /*exported TabAdvanced*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updateLocalizedStrings();
    document.getElementById('scriptManagerButton').addEventListener('click', (e) => { this._scriptManagerButtonOnClicked_event(e); });
    document.getElementById('securityFilterButton').addEventListener('click', (e) => { this._securityFilterButtonOnClicked_event(e); });
    document.getElementById('debugViewButton').addEventListener('click', (e) => { this._debugViewButtonOnClicked_event(e); });
    document.getElementById('fieldGuid').value = BrowserManager.getDropFeedGUID();
    document.getElementById('fullExportButton').addEventListener('click', (e) => { this._fullExportButtonOnClicked_event(e); });
    document.getElementById('fullImportButton').addEventListener('click', (e) => { this._fullImportButtonOnClicked_event(e); });
    document.getElementById('fullImportInput').addEventListener('change', (e) => { this._fullImportInputChanged_event(e); });
  }

  async init_async() {
  }

  _updateLocalizedStrings() {
    document.getElementById('lblScriptManager').textContent = browser.i18n.getMessage('optLblScriptManager');
    document.getElementById('scriptManagerButton').textContent = browser.i18n.getMessage('optScriptManagerButton');
    document.getElementById('lblSecurityFilter').textContent = browser.i18n.getMessage('optLblSecurityFilter');
    document.getElementById('securityFilterButton').textContent = browser.i18n.getMessage('optSecurityFilterButton');
    document.getElementById('lblDebugView').textContent = browser.i18n.getMessage('optLblDebugView');
    document.getElementById('debugViewButton').textContent = browser.i18n.getMessage('optDebugViewButton');
    document.getElementById('lblFullExport').textContent = browser.i18n.getMessage('optLblFullExport');
    document.getElementById('fullExportButton').textContent = browser.i18n.getMessage('opFullExportButton');
    document.getElementById('lblFullImport').textContent = browser.i18n.getMessage('optLblFullImport');
    document.getElementById('fullImportButton').textContent = browser.i18n.getMessage('optFullImportButton');
  }

  async _scriptManagerButtonOnClicked_event() {
    await browser.tabs.create({ url: '/html/userScripts.html', active: true });
  }

  async _securityFilterButtonOnClicked_event() {
    await browser.tabs.create({ url: '/html/securityFilter.html', active: true });
  }

  async _debugViewButtonOnClicked_event() {
    await browser.tabs.create({ url: '/html/debug.html', active: true });
  }

  async _fullExportButtonOnClicked_event() {
    await this._fullExport_async();
  }

  async _fullImportButtonOnClicked_event() {
    document.getElementById('fullImportInput').click();
  }

  async _fullImportInputChanged_event() {
    let progressBar = new ProgressBar('progressFullImport');
    let file = document.getElementById('fullImportInput').files[0];
    let errorResult = await this._fullImportFull_async(file, progressBar);
    if (errorResult) {
      progressBar.text = errorResult.error + (errorResult.value ? ': ' + errorResult.value : '');
    }
    else {
      setTimeout(() => {
        window.location.reload();
        LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
      }, 1000);
    }
  }

  async _fullExport_async() {
    let zipFullExport = new JSZip();
    //add archiveInfo
    let archiveInfo = { fileType: 'df-full-export' };
    let archiveInfoJson = JSON.stringify(archiveInfo);
    zipFullExport.file('archiveInfo.json', archiveInfoJson);
    //add localStorage
    let localStorage = await browser.storage.local.get();
    let localStorageString = JSON.stringify(localStorage, null, 2);
    zipFullExport.file('localStorage.json', localStorageString);
    //add custom themes
    let zipAllCustomThemes = await ThemeCustomManager.instance.exportAllThemesCustom_async();
    zipFullExport.file('customThemes.zip', ZipTools.getBinaryContent_async(zipAllCustomThemes), { binary: true });
    //add bookmarks
    let opmlFileUrl = await OpmlExporter.instance.generateExportFile_async(true);
    await zipFullExport.file('bookmarks.opml', ZipTools.getBinaryContent_async(opmlFileUrl), { binary: true });
    //save zip file
    let zipFullExportBlob = await zipFullExport.generateAsync({ type: 'blob' });
    let zipFullExportBlobUrl = URL.createObjectURL(zipFullExportBlob);
    browser.downloads.download({ url: zipFullExportBlobUrl, filename: 'df-full-export.zip', saveAs: true });
  }

  async _fullImportFull_async(zipFile, progressBar) {
    try {
      await LocalStorageManager.setValue_async('importInProgress', true);
      let zipFullImport = await JSZip.loadAsync(zipFile);
      if (!zipFullImport) { return { error: 'notValidArchive', value: null }; }

      //check archiveInfo
      let archiveInfoJsonFile = zipFullImport.file('archiveInfo.json');
      if (!archiveInfoJsonFile) { return { error: 'notValidArchive', value: null }; }
      let archiveInfoJson = await archiveInfoJsonFile.async('text');
      if (!archiveInfoJson) { return { error: 'notValidArchive', value: null }; }
      let archiveInfo = JSON.parse(archiveInfoJson);
      if (!archiveInfo || !archiveInfo.fileType || archiveInfo.fileType != 'df-full-export') { return { error: 'notValidArchive', value: null }; }

      //load localStorage
      let localStorageJsonFile = zipFullImport.file('localStorage.json');
      if (!localStorageJsonFile) { return { error: 'notValidArchive', value: null }; }
      let localStorageJson = await localStorageJsonFile.async('text');
      if (!localStorageJson) { return { error: 'notValidArchive', value: null }; }
      let localStorage = JSON.parse(localStorageJson);
      //Load custom themes
      let customThemesFile = await zipFullImport.file('customThemes.zip').async('blob');
      //load bookmarks
      let bookmarksOpmlFile = zipFullImport.file('bookmarks.opml');
      if (!bookmarksOpmlFile) { return { error: 'notValidArchive', value: null }; }
      let bookmarksOpml = await bookmarksOpmlFile.async('text');
      if (!bookmarksOpml) { return { error: 'notValidArchive', value: null }; }

      //write local storage
      let rootFolderId = await BookmarkManager.instance.getRootFolderId_async();
      let rootFolderState = await LocalStorageManager.getValue_async('cb-' + rootFolderId);
      await browser.storage.local.clear();
      await browser.storage.local.set(localStorage);
      await LocalStorageManager.setValue_async('rootBookmarkId', rootFolderId);
      if (rootFolderState) {
        await LocalStorageManager.setValue_async('cb-' + rootFolderId, rootFolderState);
      }
      //write custom themes
      await ThemeCustomManager.instance.importAllThemesCustom_async(customThemesFile);
      //write bookmarks
      await OpmlImporter.instance.import_async(bookmarksOpml, progressBar, false);
    }
    catch (e) {
      return { error: 'notValidArchive', value: e };
    }
    finally {
      await LocalStorageManager.setValue_async('importInProgress', false);
    }

    return null;
  }

}
