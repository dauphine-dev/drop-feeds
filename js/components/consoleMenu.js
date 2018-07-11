/*global browser BrowserManager*/
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
      <li id="ctxConsoleCopy" class="ctxMenuItem">#Copy text console</li>
    </ul>`;

    BrowserManager.insertAdjacentHTML(this._baseElement, 'beforeend', htmlString);
    this.hide();
  }

  _updateLocalizedStrings() {
    document.getElementById('ctxConsoleClear').textContent = browser.i18n.getMessage('edConsoleClear');
    document.getElementById('ctxConsoleCopy').textContent = browser.i18n.getMessage('edConsoleCopy');
  }

  _appendEventListeners() {
    this._parentConsole.element.addEventListener('click', (e) => { this._ctxConsoleClicked_event(e); });
    this._parentConsole.element.addEventListener('contextmenu', (e) => { this._ctxConsoleContextMenu_event(e); });
    document.getElementById('ctxConsoleClear').addEventListener('click', (e) => { this._ctxConsoleClearClicked_event(e); });
    document.getElementById('ctxConsoleCopy').addEventListener('click', (e) => { this._ctxConsoleCopyClicked_event(e); });
  }

  async _ctxConsoleClicked_event() {
    this.hide();
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

  async _ctxConsoleCopyClicked_event(event) {
    event.stopPropagation();
    event.preventDefault();
    this.hide();
    let tmpTextarea = document.createElement('textarea');
    document.body.appendChild(tmpTextarea);
    tmpTextarea.value = this._parentConsole.element.innerText;
    tmpTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tmpTextarea);
  }

}