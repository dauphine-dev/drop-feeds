/*global OpmlExporter OpmlImporter*/
'use strict';
class TabManagement { /*exported TabManagement*/
  static init() {
    document.getElementById('inputImportFile').addEventListener('change', TabManagement._importInputChanged_event);
    document.getElementById('importButton').addEventListener('click', TabManagement._importButtonOnClicked_event);
    document.getElementById('exportButton').addEventListener('click', TabManagement._exportButtonOnClicked_event);
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