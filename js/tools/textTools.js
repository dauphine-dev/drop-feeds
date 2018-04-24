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

  static getInnerTextEx(text,  startPattern, endPattern, inputIndex, outputIndex, last) {
    if (!text) { return text; }
    outputIndex = {inputIndex};
    let startIndex = last ? text.lastIndexOf(startPattern) : text.indexOf(startPattern, inputIndex);
    if (startIndex == -1) return null;
    startIndex +=  startPattern ? startPattern.length : 0;
    let endIndex = text.indexOf(endPattern, startIndex);
    if (endIndex == -1) return null;
    let result = text.substring(startIndex, endIndex);
    outputIndex = {endIndex};
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
    let listEncodedCars = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    /*eslint-enable quotes*/

    let decodedText = htmlText.replace(/&([^;]+);/g, (l, c) => {
      let decodedCar =  listEncodedCars[c];
      decodedCar = decodedCar ? decodedCar : l;
      return decodedCar; });

    // &#x3C; -> "<", &#x3e; -> ">", etc.
    /*eslint-disable quotes*/
    let listHexEncodedChars = {'26': '&', '3C': '<', '3E': '>', '22': '"', '27': "'" };
    /*eslint-enable quotes*/
    decodedText = decodedText.replace(/&#x([^;]+);/gi, (l, c) => {
      let decodedChar = listHexEncodedChars[c];
      decodedChar = decodedChar ? decodedChar : l;
      return decodedChar; });

    decodedText = decodedText.replace(/&#(\d+);/g, function(match, dec) {
      let fromCharCode = String.fromCharCode(dec);
      return fromCharCode; });
    return decodedText;
  }
}
