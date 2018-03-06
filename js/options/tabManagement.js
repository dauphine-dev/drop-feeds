/*global opmlExporter opmlImporter*/
'use strict';
class tabManagement { /*exported tabManagement*/
  static init() {
    document.getElementById('inputImportFile').addEventListener('change', tabManagement._importInputChanged_event);
    document.getElementById('importButton').addEventListener('click', tabManagement._importButtonOnClicked_event);
    document.getElementById('exportButton').addEventListener('click', tabManagement._exportButtonOnClicked_event);
  }

  static async _importInputChanged_event() {
    opmlImporter.import_async();
  }

  static async _importButtonOnClicked_event() {
    document.getElementById('inputImportFile').click();
  }

  static async _exportButtonOnClicked_event() {
    opmlExporter.instance.export_async();
  }
}