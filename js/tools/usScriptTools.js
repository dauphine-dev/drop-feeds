'use strict';
class USTools { /* exported USTools*/

  //--------------------------------------------------------------------------
  //Web request methods
  static async downloadTextFile(url) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'text';
      xhr.onloadend = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject(xhr.status);
          }
        }
      };
      xhr.open('GET', url);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.send();
    });
  }

  //--------------------------------------------------------------------------
  //Generic parsing methods
  static getInnerText(text, startPattern, endPattern) {
    let outputIndex = {};
    let result = USTools.getInnerTextEx(text, startPattern, endPattern, 0, outputIndex, false);
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

  static occurrences(string, subString) {
    if (!string) { return string; }
    if (!subString) { return string; }
    return string.split(subString).length - 1;
  }


  //--------------------------------------------------------------------------
  //Feed parsing methods
  static get1stUsedTag(text, tagArray) {
    if (!text) { return null; }
    for (let tag of tagArray) {
      if (text.includes('</' + tag + '>')) { return tag; }
    }
    return null;
  }

  static getNextItem(feedText, itemId, tagItem) {
    if (!feedText) { return null; }
    let itemIdPattern = '>' + itemId + '<';
    let idIndex = feedText.indexOf(itemIdPattern);
    if (idIndex < 0) {
      itemIdPattern = '><![CDATA[' + itemId + ']]><';
      idIndex = feedText.indexOf(itemIdPattern);
    }
    if (idIndex < 0) idIndex = 0;

    // Search for "<item>" (without attributes) and "<item " (with attributes)
    let startNextItemIndex = feedText.indexOf('<' + tagItem + '>', idIndex + 1);
    if (startNextItemIndex == -1) {
      startNextItemIndex = feedText.indexOf('<' + tagItem + ' ', idIndex + 1);
    }
    if (startNextItemIndex == -1) { return ''; }
    let tagItemEnd = '</' + tagItem + '>';
    let endNextItemIndex = feedText.indexOf(tagItemEnd, startNextItemIndex);
    if (endNextItemIndex < 1) { return ''; }
    let result = feedText.substring(startNextItemIndex, endNextItemIndex + tagItemEnd.length);
    return result;
  }

  static getItemId(itemText, idTagList) {
    if (!itemText) { return null; }
    let noTrim = true;
    let result = USTools.extractValue(itemText, idTagList, null, null, noTrim);
    if (!result) {
      let hasIdTag = USTools.get1stUsedTag(itemText, idTagList);
      if (!hasIdTag) {
        let i = itemText.indexOf('>', 1);
        let j = itemText.lastIndexOf('<');
        if (i >= 0 && j >= 0) {
          result = itemText.substring(i + 1, j);
        }
      }
    }
    return result;
  }

  static extractValue(text, tagList, startIndex_optional, out_endIndex_optional, noTrim_optional) {
    if (!text) { return null; }
    if (!out_endIndex_optional) { out_endIndex_optional = []; }
    if (!startIndex_optional) { startIndex_optional = 0; }
    out_endIndex_optional[0] = null;
    for (let tag of tagList) {
      let tagStart = '<' + tag;
      let tagEnd = '</' + tag + '>';

      let i = text.indexOf(tagStart, startIndex_optional);
      if (i == -1) { continue; }
      let valueStart = text.indexOf('>', i);
      if (valueStart == -1) { continue; }
      let valueEnd = text.indexOf(tagEnd, valueStart);
      if (valueEnd == -1) { continue; }

      let result = text.substring(valueStart + 1, valueEnd);
      if (!noTrim_optional) { result = result.trim(); }
      if (result.includes('<![CDATA[')) {
        result = result.split('<![CDATA[').join('');
        result = result.split(']]>').join('');
        if (!noTrim_optional) { result = result.trim(); }
      }
      out_endIndex_optional[0] = valueEnd + tagEnd.length;

      return result;
    }
    return null;
  }

  //--------------------------------------------------------------------------
  //RSS generator methods
  static rssHeader(channelTitle, channelLink, channelDescription, channelImage) {
    let rssHeader = '<?xml version="1.0" encoding="utf-8"?>\
    <rss version="2.0">\
      <channel>\
        <title>' + channelTitle + '</title>\
        <link>' + channelLink + '</link>\
        <description>' + channelDescription + '</description>\
        <image>' + channelImage + '</image>';
    return rssHeader;
  }

  static rssItem(title, link, pubDate, description, itemPos) {
    let rssItem = '\
    <item>\
      <title>' + title + '</title>\
      <link>' + link + '</link>\
      <guid>' + link + itemPos + '</guid>\
      <pubDate>' + pubDate + '</pubDate>\
      <description><![CDATA[' + description + ']]></description>\
    </item>';
    return rssItem;
  }

  static rssFooter() {
    let rssFooter = '\
      </channel>\
    </rss>';
    return rssFooter;
  }
}
