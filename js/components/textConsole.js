/*global ConsoleMenu*/
'use strict';
const _messageType = { default: 0, ok: 1, error: 2 };

class TextConsole { /*exported TextConsole*/
  static get messageType() {
    return _messageType;
  }

  attach(consoleElement) {
    this._consoleElement = consoleElement;
    let html = '<div id="consoleText" style="overflow: auto;"></div>';
    this._consoleElement.insertAdjacentHTML('beforeend', html);
    this._consoleTextElement = document.getElementById('consoleText');
  }

  attachMenu(consoleMenuElement) {
    this._consoleMenu = new ConsoleMenu(this);
    this._consoleMenu.attach(consoleMenuElement);
  }

  get element() {
    return this._consoleElement;
  }

  writeEx(text, messageType) {
    let style = '';
    let css = '';
    if (!messageType) { messageType = _messageType.default; }
    switch (messageType) {
      case _messageType.default:
        css = ' class="editorConsoleTextDefault" ';
        break;
      case _messageType.ok:
        css = ' class="editorConsoleTextOk" ';
        break;
      case _messageType.error:
        css = ' class="editorConsoleTextError" ';
        break;
      default:
        style = ' style=' + messageType + ' ';
    }
    let html = '<span' + css + style + '>' + text + '</span>';
    this._consoleTextElement.insertAdjacentHTML('beforeend', html);
    this._consoleTextElement.scrollTop = this._consoleTextElement.scrollHeight;
  }

  write(text) {
    this.writeEx(text);
  }

  writeLineEx(text, messageType) {
    this.writeEx(text + '<br/>', messageType);
  }

  writeLine(text) {
    this.writeLineEx(text);
  }

  clear() {
    this._consoleTextElement.textContent = '';
  }
}
