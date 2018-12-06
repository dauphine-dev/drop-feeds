/*cSpell:ignore apos */
'use strict';
class TextTools { /* exported TextTools*/
  static makeIndent(indentLength) {
    if (indentLength < 1) { return; }
    return ' '.repeat(indentLength);
  }

  static getInnerText(text, startPattern, endPattern) {
    let outputIndex = {};
    let result = TextTools.getInnerTextEx(text, startPattern, endPattern, 0, outputIndex, false);
    return result;
  }

  static getInnerTextEx(text, startPattern, endPattern, inputIndex, outputIndex, last) {
    if (!text) { return text; }
    outputIndex.value = -1;
    let startIndex = last ? text.lastIndexOf(startPattern) : text.indexOf(startPattern, inputIndex);
    if (startIndex == -1) return null;
    startIndex += startPattern ? startPattern.length : 0;
    let endIndex = text.indexOf(endPattern, startIndex);
    if (endIndex == -1) return null;
    let result = text.substring(startIndex, endIndex);
    outputIndex.value = endIndex;
    return result;
  }

  static getOuterText(text, startPattern, endPattern) {
    let outputIndex = {};
    let result = TextTools.getOuterTextEx(text, startPattern, endPattern, 0, outputIndex, false);
    return result;
  }

  static getOuterTextEx(text, startPattern, endPattern, inputIndex, outputIndex, last) {
    if (!text) { return text; }
    outputIndex.value = -1;
    let startIndex = last ? text.lastIndexOf(startPattern) : text.indexOf(startPattern, inputIndex);
    if (startIndex == -1) return null;
    let endIndex = text.indexOf(endPattern, startIndex);
    if (endIndex == -1) return null;
    endIndex += endPattern ? endPattern.length : 0;
    let result = text.substring(startIndex, endIndex);
    outputIndex.value = endIndex;
    return result;
  }


  static occurrences(string, subString) {
    if (!string) { return string; }
    if (!subString) { return string; }
    return string.split(subString).length - 1;
  }

  static decodeHtml(htmlText) {
    if (!htmlText) { return htmlText; }
    /*eslint-disable quotes*/
    let listEncodedCars = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    /*eslint-enable quotes*/

    let decodedText = htmlText.replace(/&([^;]+);/g, (l, c) => {
      let decodedCar = listEncodedCars[c];
      decodedCar = decodedCar ? decodedCar : l;
      return decodedCar;
    });

    // &#x3C; -> "<", &#x3e; -> ">", etc.
    /*eslint-disable quotes*/
    let listHexEncodedChars = { '26': '&', '3C': '<', '3E': '>', '22': '"', '27': "'" };
    /*eslint-enable quotes*/
    decodedText = decodedText.replace(/&#x([^;]+);/gi, (l, c) => {
      let decodedChar = listHexEncodedChars[c];
      decodedChar = decodedChar ? decodedChar : l;
      return decodedChar;
    });

    decodedText = decodedText.replace(/&#(\d+);/g, function (match, dec) {
      let fromCharCode = String.fromCharCode(dec);
      return fromCharCode;
    });
    return decodedText;
  }

  static unescapeHtml(htmlText) {
    let decodedHtmlText = (new DOMParser).parseFromString('<!doctype html><body>' + htmlText, 'text/html').body.textContent;
    return decodedHtmlText;
  }

  static replaceAll(text, substr, newSubstr) {
    return text.split(substr).join(newSubstr);
  }

  static insertAt(text, substr, index) {
    return text.substr(0, index) + substr + text.substr(index);
  }

  static escapeRegExp(text) {
    /*eslint-disable no-useless-escape*/
    return text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    /*eslint-enable no-useless-escape*/
  }

  static replaceAt(text, substr, newSubstr, index) {
    return text.slice(0, index) + text.slice(index).replace(substr, newSubstr);
  }

  static toPlainText(inputText) {
    /*eslint-disable no-control-regex*/
    let plainText = inputText.replace(/[\x01-\x1f]/g, ' ').replace(/\s\s+/g, ' ');
    /*eslint-enable no-control-regex*/
    return plainText.replace(/<(?:.|\n)*?>/gm, '');
  }

  static isNullOrEmpty(obj) {
    return !(typeof obj === 'string' && obj.length > 0);
  }

  static fromTextCharCodeArray(textCharCodeArray) {
    let text = textCharCodeArray.split(',').map(textCode => (String.fromCharCode(parseInt(textCode, 16)))).join('');
    return text;
  }

  static toTextCharCodeArray(text) {
    if (!text) { return []; }
    let textCharCodeArray = Array.from(text).map(char => char.charCodeAt(0).toString(16)).join(',');
    return textCharCodeArray;
  }

  static isStringUrl(textUrl) {
    let isValidUrl = true;
    try { new URL(textUrl); }
    catch(e) { isValidUrl = false; }
    return isValidUrl;
  }
}
