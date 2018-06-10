'use strict';
/*cspell:disable*/
const _fallbackFontList = [
  { family: 'serif', sizeVt: 0, sizeHz: 0 },
  { family: 'sans-serif', sizeVt: 0, sizeHz: 0 },
  { family: 'monospace', sizeVt: 0, sizeHz: 0 }
];

const _fontList = [
  { family: 'Courier', fallback: 'monospace' }, { family: 'Courier New', fallback: 'monospace' }, { family: 'Lucida Console', fallback: 'monospace' },
  { family: 'Monaco', fallback: 'monospace' }, { family: 'monospace', fallback: 'monospace' }, { family: 'Arial', fallback: 'sans-serif' },
  { family: 'Arial Black', fallback: 'sans-serif' }, { family: 'Charcoal', fallback: 'sans-serif' }, { family: 'Comic Sans MS', fallback: 'sans-serif' },
  { family: 'cursive', fallback: 'sans-serif' }, { family: 'Gadget', fallback: 'sans-serif' }, { family: 'Geneva', fallback: 'sans-serif' },
  { family: 'Helvetica', fallback: 'sans-serif' }, { family: 'Impact', fallback: 'sans-serif' }, { family: 'Lucida Grande', fallback: 'sans-serif' },
  { family: 'Lucida Sans Unicode', fallback: 'sans-serif' }, { family: 'sans-serif', fallback: 'sans-serif' }, { family: 'serif', fallback: 'sans-serif' },
  { family: 'Tahoma', fallback: 'sans-serif' }, { family: 'Trebuchet MS', fallback: 'sans-serif' }, { family: 'Verdana', fallback: 'sans-serif' },
  { family: 'Book Antiqua', fallback: 'serif' }, { family: 'Georgia', fallback: 'serif' }, { family: 'Palatino', fallback: 'serif' },
  { family: 'Palatino Linotype', fallback: 'serif' }, { family: 'Times', fallback: 'serif' }, { family: 'Times New Roman', fallback: 'serif' }];
/*cspell:enable*/

const _fontSizeList = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 22, 24, 26, 28, 32, 36, 40, 48, 56, 64, 72];

class FontManager { /* exported FontManager*/
  static get instance() { return (this._instance = this._instance || new this()); }
  constructor() {
    this._detectionString = 'WMIwmil0oL0O.';
    this._detectionFontSize = '56px';
    this._buildFallbackFontList();
  }

  get fontSizeList() {
    return _fontSizeList;
  }

  _isFontAvailable(font) {
    let isFallbackFont = _fallbackFontList.find(f => f.family.toLowerCase() === font.family.toLowerCase());
    if (isFallbackFont) {
      return true;
    }
    let detectionDiv = this._appendDivToBody();
    detectionDiv.style.fontFamily = '"' + font.family + '", "' + font.fallback + '"';
    let sizeVt = detectionDiv.offsetHeight;
    let sizeHz = detectionDiv.offsetWidth;
    document.body.removeChild(detectionDiv);
    let isFontAvailable = !_fallbackFontList.find(f => f.family == font.fallback && f.sizeVt == sizeVt && f.sizeHz == sizeHz);
    return Boolean(isFontAvailable);
  }

  getAvailableFontList() {
    let availableFontsList = [];
    for (let font of _fontList) {
      if (this._isFontAvailable(font)) {
        availableFontsList.push(font);
      }
    }
    return availableFontsList;
  }

  _buildFallbackFontList() {
    let detectionDiv = this._appendDivToBody();
    for (let fallback of _fallbackFontList) {
      detectionDiv.style.fontFamily = fallback.family;
      fallback.sizeVt = detectionDiv.offsetHeight;
      fallback.sizeHz = detectionDiv.offsetWidth;
    }
    document.body.removeChild(detectionDiv);
  }

  _appendDivToBody() {
    let div = document.createElement('div');
    div.style.fontSize = this._detectionFontSize;
    div.textContent = this._detectionString;
    document.body.appendChild(div);
    return div;
  }

}
