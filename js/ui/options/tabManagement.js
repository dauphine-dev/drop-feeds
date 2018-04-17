/*global browser OpmlExporter OpmlImporter*/
'use strict';
class TabManagement { /*exported TabManagement*/
  static init() {
    TabManagement._updateLocalizedStrings();
    document.getElementById('inputImportFile').addEventListener('change', TabManagement._importInputChanged_event);
    document.getElementById('importButton').addEventListener('click', TabManagement._importButtonOnClicked_event);
    document.getElementById('exportButton').addEventListener('click', TabManagement._exportButtonOnClicked_event);
  }

  static _updateLocalizedStrings() {
    document.getElementById('lblSelectOpmlFileToImport').textContent = browser.i18n.getMessage('optSelectOpmlFileToImport');
    document.getElementById('importButton').textContent = browser.i18n.getMessage('optImport');
    document.getElementById('lblSelectOpmlFileToExport').textContent = browser.i18n.getMessage('optSelectOpmlFileToExport');
    document.getElementById('exportButton').textContent = browser.i18n.getMessage('optExport');
  }

  static async _importInputChanged_event() {
    OpmlImporter.import_async();
  }

  static async _importButtonOnClicked_event() {
    document.getElementById('inputImportFile').click();
  }

  static async _exportButtonOnClicked_event() {
    OpmlExporter.instance.export_async();
  }
}