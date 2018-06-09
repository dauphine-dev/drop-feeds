/*global browser OpmlExporter OpmlImporter*/
'use strict';
class TabManagement { /*exported TabManagement*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._updateLocalizedStrings();
    document.getElementById('inputImportFile').addEventListener('change', (e) => { this._importInputChanged_event(e); });
    document.getElementById('importButton').addEventListener('click', (e) => { this._importButtonOnClicked_event(e); });
    document.getElementById('exportButton').addEventListener('click', (e) => { this._exportButtonOnClicked_event(e); });
  }

  async init_async() {
  }

  _updateLocalizedStrings() {
    document.getElementById('lblSelectOpmlFileToImport').textContent = browser.i18n.getMessage('optSelectOpmlFileToImport');
    document.getElementById('importButton').textContent = browser.i18n.getMessage('optImport');
    document.getElementById('lblSelectOpmlFileToExport').textContent = browser.i18n.getMessage('optSelectOpmlFileToExport');
    document.getElementById('exportButton').textContent = browser.i18n.getMessage('optExport');
  }

  async _importInputChanged_event() {
    OpmlImporter.import_async();
  }

  async _importButtonOnClicked_event() {
    document.getElementById('inputImportFile').click();
  }

  async _exportButtonOnClicked_event() {
    OpmlExporter.instance.export_async();
  }
}