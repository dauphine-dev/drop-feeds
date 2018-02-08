/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
"use strict";
//----------------------------------------------------------------------
function makeIndent(indentLength) {
  return ' '.repeat(indentLength);
}
//----------------------------------------------------------------------
function getInnerText1(text, startPattern, endPattern) {
  let outputIndex = {};
  let result = getInnerText0(text, startPattern, endPattern, 0, outputIndex, false);
  return result;
}
//----------------------------------------------------------------------
function getInnerText2(text, startPattern, endPattern, last) {
  let outputIndex = {};
  let result = getInnerText0(text, startPattern, endPattern, 0, outputIndex, last);
  return result;
}
//----------------------------------------------------------------------
function getInnerText3(text, startPattern, endPattern, inputIndex) {
  let outputIndex = {};
  let result = getInnerText0(text, startPattern, endPattern, inputIndex, outputIndex, false);
  return result;
}
//----------------------------------------------------------------------
function getInnerText4(text, startPattern, endPattern, inputIndex, outputIndex) {
  let result = getInnerText0(text, startPattern, endPattern, inputIndex, outputIndex, false);
  return result;
}
//----------------------------------------------------------------------
function getInnerText0(text,  startPattern, endPattern, inputIndex, outputIndex, last) {

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
//----------------------------------------------------------------------
function getInnerTextToEnd(text, startPattern) {
  let startIndex = text.indexOf(startPattern);
  if (startIndex == -1) return null;
  startIndex += startPattern.length;
  let lastEpisodeTitle = text.substring(startIndex);
  return lastEpisodeTitle;
}
//----------------------------------------------------------------------
function getOuterText1(text, startPattern, endPattern) {
  let outputIndex = {};
  let result = getOuterText0(text, startPattern, endPattern, 0, outputIndex, false);
  return result;
}
//----------------------------------------------------------------------
function getOuterText2(text, startPattern, endPattern, last) {
  let outputIndex = {};
  let result = getOuterText0(text, startPattern, endPattern, 0, outputIndex, last);
  return result;
}
//----------------------------------------------------------------------
function getOuterText3(text, startPattern, endPattern, inputIndex) {
  let outputIndex = {};
  let result = getOuterText0(text, startPattern, endPattern, inputIndex, outputIndex, false);
  return result;
}
//----------------------------------------------------------------------
function getOuterText4(text, startPattern, endPattern, inputIndex, outputIndex) {
  let result = getOuterText0(text, startPattern, endPattern, inputIndex, outputIndex, false);
  return result;
}
//----------------------------------------------------------------------
function getOuterText0(text, startPattern, endPattern, inputIndex, outputIndex, last) {
  outputIndex = {inputIndex};
  let startIndex = last ? text.lastIndexOf(startPattern) : text.indexOf(startPattern, inputIndex);
  if (startIndex == -1) return null;
  let endIndex = text.indexOf(endPattern, startIndex) + endPattern.length;
  if (endIndex == -1) return null;
  let result = text.substring(startIndex, endIndex);
  outputIndex = {endIndex};
  return result;
}
//----------------------------------------------------------------------
function getOuterTextToEnd(text, startPattern) {
  let startIndex = text.indexOf(startPattern);
  if (startIndex == -1) return null;
  let lastEpisodeTitle = text.ubstring(startIndex);
  return lastEpisodeTitle;
}
//----------------------------------------------------------------------
function occurrences(string, subString) {
  return string.split(subString).length - 1;
}
//----------------------------------------------------------------------
function decodeHtml(htmlText) {
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
//----------------------------------------------------------------------
