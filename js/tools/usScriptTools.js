'use strict';
class USTools { /* exported USTools*/
  static async downloadTextFile_async(url) {
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
