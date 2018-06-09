'use strict';
/*cspell:disable*/
const _fontList = [
  'Arial', 'Arial Black', 'Book Antiqua', 'Charcoal', 'Comic Sans MS', 'Courier',
  'Courier New', 'cursive', 'Gadget', 'Geneva', 'Georgia', 'Helvetica', 'Impact',
  'Lucida Console', 'Lucida Grande', 'Lucida Sans Unicode', 'Monaco,monospace',
  'monospace', 'Palatino', 'Palatino Linotype', 'sans-serif', 'serif', 'Tahoma',
  'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana'];
/*cspell:enable*/

class FontManager { /* exported FontManager*/
  static get instance() { return (this._instance = this._instance || new this()); }
  constructor() {
    this._fallbackFontList = [];
    this._detectionString = 'WMIwmil0oL0O.';
    this._detectionFontSize = '56px';
    this._buildFallbackFontList();
  }

  isFontAvailable(fontFamily) {
    let isFallbackFont = this._fallbackFontList.find(f => f.family.toLowerCase() === fontFamily.toLowerCase());
    if (isFallbackFont) {
      return true;
    }
    let detectionDiv = this._appendDivToBody();
    detectionDiv.style.fontFamily = fontFamily;
    let sizeVt = detectionDiv.offsetHeight;
    let sizeHz = detectionDiv.offsetWidth;
    document.body.removeChild(detectionDiv);
    let isFontAvailable = this._fallbackFontList.find(f => f.sizeVt == sizeVt && f.sizeHz == sizeHz);
    return Boolean(isFontAvailable);
  }

  getAvailableFontList() {
    let availableFontsList = [];
    for (let font of _fontList) {
      if (this.isFontAvailable(font)) {
        availableFontsList.push(font);
      }
    }
    return availableFontsList;
  }

  _buildFallbackFontList() {
    this._fallbackFontList = [
      { family: 'serif', sizeVt: 0, sizeHz: 0 },
      { family: 'sans-serif', sizeVt: 0, sizeHz: 0 },
      { family: 'monospace', sizeVt: 0, sizeHz: 0 }
    ];
    let detectionDiv = this._appendDivToBody();
    for (let fallback of this._fallbackFontList) {
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
