'use strict';
class textTools { /* exported textTools*/
  static makeIndent(indentLength) {
    return ' '.repeat(indentLength);
  }

  static getInnerText(text, startPattern, endPattern) {
    let outputIndex = {};
    let result = textTools.getInnerTextEx(text, startPattern, endPattern, 0, outputIndex, false);
    return result;
  }

  static getInnerTextEx(text,  startPattern, endPattern, inputIndex, outputIndex, last) {
    outputIndex = {inputIndex};
    let startIndex = last ? text.lastIndexOf(startPattern) : text.indexOf(startPattern, inputIndex);
    if (startIndex == -1) return null;
    startIndex += startPattern.length;
    let endIndex = text.indexOf(endPattern, startIndex);
    if (endIndex == -1) return null;
    let result = text.substring(startIndex, endIndex);
    outputIndex = {endIndex};
    return result;
  }

  static occurrences(string, subString) {
    return string.split(subString).length - 1;
  }

  static decodeHtml(htmlText) {
    if (!htmlText) { return htmlText; }
    let listEncodedCars = {amp: '&', lt: '<', gt: '>', quot: '"' };

    let decodedText = htmlText.replace(/&([^;]+);/g, (l, c) => {
      let decodedCar =  listEncodedCars[c];
      decodedCar = decodedCar ? decodedCar : l;
      return decodedCar; });

    decodedText = decodedText.replace(/&#(\d+);/g, function(match, dec) {
      let fromCharCode = String.fromCharCode(dec);
      return fromCharCode; });
    return decodedText;
  }
}
