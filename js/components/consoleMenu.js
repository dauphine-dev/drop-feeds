/*global browser*/
'use strict';
class ConsoleMenu { /*exported ConsoleMenu*/
  constructor(parentConsole) {
    this._parentConsole = parentConsole;
  }

  attach(baseElement) {
    this._baseElement = baseElement;
    this._createElements();
    this._appendEventListeners();
    this._updateLocalizedStrings();
  }

  hide() {
    this._baseElement.style.display = 'none';
  }

  show() {
    this._baseElement.style.display = '';
  }

  _createElements() {
    let htmlString = `
    <ul>
      <li id="ctxConsoleClear" class="ctxMenuItem">#Clear</li>
      <li id="ctxConsoleSelectAll" class="ctxMenuItem">#Select all</li>
      <li id="ctxConsoleCopy" class="ctxMenuItem">#Copy</li>
    </ul>`;

    this._baseElement.insertAdjacentHTML('beforeend', htmlString);
    this.hide();
  }

  _updateLocalizedStrings() {
    /*
    document.getElementById('ctxConsoleClear').textContent = browser.i18n.getMessage('edConsoleCopy');
    document.getElementById('ctxConsoleSelectAll').textContent = browser.i18n.getMessage('edConsoleSelectAll');
    document.getElementById('ctxConsoleCopy').textContent = browser.i18n.getMessage('edConsoleCopy');
    */
  }

  _appendEventListeners() {
    this._parentConsole.element.addEventListener('contextmenu', (e) => { this._ctxConsoleContextMenu_event(e); });
    document.getElementById('ctxConsoleClear').addEventListener('click', (e) => { this._ctxConsoleClearClicked_event(e); });
    document.getElementById('ctxConsoleSelectAll').addEventListener('click', (e) => { this._ctxConsoleSelectAllClicked_event(e); });
    document.getElementById('ctxConsoleCopy').addEventListener('click', (e) => { this._ctxConsoleCopyClicked_event(e); });
  }

  async _ctxConsoleContextMenu_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this.show();
    let x = Math.max(Math.min(event.x, window.innerWidth - this._baseElement.offsetWidth), 0);
    let y = Math.max(Math.min(event.y, window.innerHeight - this._baseElement.offsetHeight), 0);
    this._baseElement.style.left = x + 'px';
    this._baseElement.style.top = y + 'px';
  }

  async _ctxConsoleClearClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this.hide();
    this._parentConsole.clear();
  }

  async _ctxConsoleSelectAllClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this.hide();
    let range = document.createRange();
    range.selectNode(this._parentConsole.element);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }

  async _ctxConsoleCopyClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this.hide();
    this._parentConsole.element.select();
    document.execCommand('copy');
  }

}