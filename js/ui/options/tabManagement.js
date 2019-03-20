/*global browser OpmlExporter OpmlImporter DateTime ProgressBar LocalStorageManager*/
'use strict';
class TabManagement { /*exported TabManagement*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updateLocalizedStrings();
    document.getElementById('inputOpmlImportFile').addEventListener('change', (e) => { this._importOpmlInputChanged_event(e); });
    document.getElementById('importOpmlButton').addEventListener('click', (e) => { this._importOpmlButtonOnClicked_event(e); });
    document.getElementById('exportOpmlButton').addEventListener('click', (e) => { this._exportOpmlButtonOnClicked_event(e); });

    document.getElementById('inputImportSettingFile').addEventListener('change', (e) => { this._importSettingInputChanged_event(e); });
    document.getElementById('importSettingButton').addEventListener('click', (e) => { this._importSettingButtonOnClicked_event(e); });
    document.getElementById('exportSettingButton').addEventListener('click', (e) => { this._exportSettingButtonOnClicked_event(e); });

  }

  async init_async() {
  }

  _updateLocalizedStrings() {
    document.getElementById('lblSelectOpmlFileToImport').textContent = browser.i18n.getMessage('optSelectOpmlFileToImport');
    document.getElementById('importOpmlButton').textContent = browser.i18n.getMessage('optOpmlImport');
    document.getElementById('lblSelectOpmlFileToExport').textContent = browser.i18n.getMessage('optSelectOpmlFileToExport');
    document.getElementById('exportOpmlButton').textContent = browser.i18n.getMessage('optOpmlExport');

    document.getElementById('lblSelectSettingFileToImport').textContent = browser.i18n.getMessage('optSelectSettingFileToImport');
    document.getElementById('importSettingButton').textContent = browser.i18n.getMessage('optSettingImport');
    document.getElementById('lblSelectSettingFileToExport').textContent = browser.i18n.getMessage('optSelectSettingFileToExport');
    document.getElementById('exportSettingButton').textContent = browser.i18n.getMessage('optSettingExport');

  }

  async _importOpmlInputChanged_event() {
    let file = document.getElementById('inputOpmlImportFile').files[0];
    let reader = new FileReader();
    reader.onload = ((e) => { this._inputOpmlImportOnLoad_event(e); });
    reader.readAsText(file);
  }

  async _inputOpmlImportOnLoad_event(event) {
    let opmlText = event.target.result;
    let progressBar = new ProgressBar('progressBarOpmlImport');
    await OpmlImporter.instance.import_async(opmlText, progressBar, true);
    setTimeout(() => { progressBar.hide(); }, 2000);
  }

  async _importOpmlButtonOnClicked_event() {
    document.getElementById('inputOpmlImportFile').click();
  }

  async _exportOpmlButtonOnClicked_event() {
    let opmlFileUrl = await OpmlExporter.instance.generateExportFile_async(false);
    browser.downloads.download({ url: opmlFileUrl, filename: 'export.opml', saveAs: true });
  }

  async _importSettingInputChanged_event() {
    let file = document.getElementById('inputImportSettingFile').files[0];
    let reader = new FileReader();
    reader.onload = ((e) => { this._inputImportSettingOnLoad_event(e); });
    reader.readAsText(file);
  }

  async _inputImportSettingOnLoad_event(event) {
    let settingString = event.target.result;
    let progressBarImport = new ProgressBar('progressBarImportSetting');
    let settings = undefined;
    try {
      settings = JSON.parse(settingString);
    } catch (e) {
      await this._settingFileIsNotValid_async(progressBarImport);
    }
    if (settings) {
      await browser.storage.local.set(settings);
      await LocalStorageManager.setValue_async('reloadPanelWindow', Date.now());
      window.location.reload();
    }
    else {
      await this._settingFileIsNotValid_async(progressBarImport);
    }
  }

  async _settingFileIsNotValid_async(progressBarImport) {
    progressBarImport.text = 'Invalid setting file!';
    await DateTime.delay_async(2000);
    progressBarImport.hide();
  }

  async _importSettingButtonOnClicked_event() {
    document.getElementById('inputImportSettingFile').click();
  }

  async _exportSettingButtonOnClicked_event() {
    let settings = await browser.storage.local.get();
    settings = this._filteringSettings(settings);
    let settingSting = JSON.stringify(settings, null, 2);
    let blob = new Blob([settingSting], { encoding: 'UTF-8', type: 'text/html;charset=UTF-8' });
    let settingFileUrl = URL.createObjectURL(blob);
    browser.downloads.download({ url: settingFileUrl, filename: 'settings.json', saveAs: true });
  }

  async _getSetting_async() {
  }

  _filteringSettings(settings) {
    settings = Object.keys(settings).reduce((acc, cur) => {
      if (settings[cur]) {
        let toRemove = (cur == 'rootBookmarkId' || settings[cur].isFeedInfo);
        if (toRemove) { return acc; }
      }
      acc[cur] = settings[cur];
      return acc;
    }, {});
    return settings;
  }

}