/*global browser textTools dateTime themeManager*/
'use strict';
const tagList = {
  RSS: ['?xml', 'rss'],
  CHANNEL: ['channel', 'feed'],
  LASTBUILDDATE: ['lastBuildDate', 'pubDate'],
  ITEM: ['item', 'entry'],
  ID: ['guid', 'id'],
  TITLE: ['title'],
  LINK: ['link'],
  ATT_LINK: ['href'],
  DESC: ['content:encoded', 'description', 'content', 'summary', 'subtitle'],
  CAT: ['category'],
  AUTHOR: ['author', 'dc:creator'],
  PUBDATE: ['pubDate', 'published', 'dc:date', 'updated', 'a10:updated', 'lastBuildDate']
};

class feedParser { /*exported feedParser*/
  static parsePubdate(feedText) {
    if (!feedText) return null;
    let tagItem = feedParser._get1stUsedTag(feedText, tagList.ITEM);
    let itemNumber = textTools.occurrences(feedText, '</' + tagItem + '>');
    let pubDateList=[];

    let itemText = feedParser._getNextItem(feedText, '---', tagItem); // use a fake id to start
    for (let i=0; i<itemNumber; i++) {
      let itemId = feedParser._getItemId(itemText);
      let pubDateText = feedParser._extractValue(itemText, tagList.PUBDATE);
      let pubDate = feedParser._extractDateTime(pubDateText);
      pubDateList.push(pubDate);
      itemText = feedParser._getNextItem(feedText, itemId, tagItem);
    }

    pubDateList.sort((date1, date2) => {
      if (date1 > date2) return -1;
      if (date1 < date2) return 1;
      return 0;
    });
    let pubDate = pubDateList[0];
    if (!pubDate || pubDate == new Date(null)) {
      let lastBuildDateText = feedParser._extractValue(feedText, tagList.LASTBUILDDATE);
      pubDate = feedParser._extractDateTime(lastBuildDateText);
    }
    return pubDate;
  }

  static getFeedBody(feedText) {
    let feedBody = feedText;
    let tagItem = feedParser._get1stUsedTag(feedText, tagList.ITEM);
    if (tagItem) {
      let i = feedText.indexOf(tagItem);
      if (i >= 0) {
        feedBody = feedText.substring(i);
      }
    }
    return feedBody;
  }

  static async  parseFeedToHtml_async(feedText) {
    let feedHtml = '';
    let tagItem = feedParser._get1stUsedTag(feedText, tagList.ITEM);
    let channelObj = feedParser._parseChannelToObj(feedText, tagItem);
    let htmlHead = feedParser._getHtmlHead(channelObj);
    feedHtml += htmlHead;
    feedHtml += channelObj.htmlChannel;
    let htmlItemList = feedParser._parseItemsToHtmlList(feedText, tagItem);
    feedHtml += htmlItemList.join('\n');
    feedHtml += feedParser._getHtmFoot();
    return feedHtml;
  }

  static _get1stUsedTag(text, tagArray) {
    if (!text) return null;
    for (let tag of tagArray) {
      if (text.includes('</' + tag + '>')) { return tag; }
    }
    return null;
  }

  static _getNextItem(feedText, itemId, tagItem) {
    if (!feedText) return null;
    let itemIdPattern = '>' + itemId + '<';
    let idIndex = feedText.indexOf(itemIdPattern);
    if (idIndex <0 ) {
      itemIdPattern = '><![CDATA[' + itemId + ']]><';
      idIndex = feedText.indexOf(itemIdPattern);
    }
    if (idIndex < 0) idIndex = 0;

    let startNextItemIndex = feedText.indexOf('<' + tagItem, idIndex + 1);
    if (startNextItemIndex == -1) return '';
    let tagItemEnd = '</' + tagItem + '>';
    let endNextItemIndex = feedText.indexOf(tagItemEnd, startNextItemIndex);
    if (endNextItemIndex < 1) return '';
    let result = feedText.substring(startNextItemIndex, endNextItemIndex + tagItemEnd.length);
    return result;
  }

  static _getItemId(itemText) {
    if (!itemText) { return null; }
    let result = feedParser._extractValue(itemText, tagList.ID);
    if (!result) {
      let hasIdTag = feedParser._get1stUsedTag(itemText, tagList.ID);
      if (!hasIdTag) {
        let i = itemText.indexOf('>', 1);
        let j = itemText.lastIndexOf('<');
        if (i>=0 && j >=0) {
          result = itemText.substring(i+1,j);
        }
      }
    }
    return result;
  }

  static _extractValue(text, tagList, startIndex_optional, out_endIndex_optional) {
    if (!text) { return null; }
    if (!out_endIndex_optional) { out_endIndex_optional = []; }
    if (!startIndex_optional) { startIndex_optional = 0; }
    out_endIndex_optional[0] = null;
    for (let tag of tagList) {
      let tagStart = '<' + tag;
      let tagEnd = '</' + tag + '>';

      let i = text.indexOf(tagStart, startIndex_optional);
      if (i==-1) { continue; }
      let valueStart = text.indexOf('>', i);
      if (valueStart==-1) { continue; }
      let valueEnd = text.indexOf(tagEnd, valueStart);
      if (valueEnd==-1) { continue; }

      let result = text.substring(valueStart + 1, valueEnd).trim();
      if(result.startsWith('<![CDATA[')) {
        result = result.replace('<![CDATA[', '');
        if (result.endsWith(']]>')) {
          result = result.slice(0, -3);
        }
        result = result.trim();
      }
      out_endIndex_optional[0] = valueEnd + tagEnd.length;

      return result;
    }
    return null;
  }

  static _extractDateTime(dateTimeText) {
    if (!dateTimeText) return null;
    let extractedDateTime = null;
    if (dateTimeText) {
      dateTimeText = dateTimeText.replace(/\s+/g, ' ');
      extractedDateTime = new Date(dateTimeText);
      if (!dateTime.isValid(extractedDateTime)) {
        extractedDateTime = new Date(dateTime.timeZoneToGmt(dateTimeText));
        if (!dateTime.isValid(dateTime)) {
          //dateTime = new Date(null);
          extractedDateTime = null;
        }
      }
    }
    return extractedDateTime;
  }

  static _parseChannelToObj(feedText, tagItem) {
    let channel = {encoding: '', title: '', link: '', description: '', category : '', pubDate: '', htmlChannel: ''};
    channel.encoding =  feedParser._getEncoding(feedText);
    let tagChannel = feedParser._get1stUsedTag(feedText, tagList.CHANNEL);
    let channelText = textTools.getInnerText(feedText, tagChannel, tagItem);
    channel.link = feedParser._extractValue(channelText, tagList.LINK);
    if (!channel.link) {
      channel.link = feedParser._extractAttribute(channelText, tagList.LINK, tagList.ATT_LINK);
    }
    channel.title = textTools.decodeHtml(feedParser._extractValue(channelText, tagList.TITLE));
    if (!channel.title) { channel.title = channel.link; }
    channel.description = textTools.decodeHtml(feedParser._extractValue(channelText, tagList.DESC));
    channel.htmlChannel = feedParser._getHtmlChannel(channel);
    return channel;

  }

  static _getHtmlHead(channel) {
    let iconUrl = browser.extension.getURL(themeManager.instance.iconDF32Url);
    let cssUrl = browser.extension.getURL(themeManager.instance.getCssUrl('feed.css'));
    let encoding = channel.encoding ? channel.encoding : 'UTF-8';
    //if (encoding == 'iso-8859-15') { encoding = 'UTF-8'; }
    let htmlHead = '';
    htmlHead                      += '<html>\n';
    htmlHead                      += '  <head>\n';
    htmlHead                      += '    <meta http-equiv="Content-Type" content="text/html; charset=' + encoding + '">\n';
    htmlHead                      += '    <link rel="icon" type="image/png" href="' + iconUrl + '">\n';
    htmlHead                      += '    <link rel="stylesheet" type="text/css" href="' + cssUrl +  '">\n';
    if (channel.title) { htmlHead += '    <title>' + channel.title + ' - Drop-feed</title>\n'; }
    htmlHead                      += '  </head>\n';
    htmlHead                      += '  <body">\n';
    return htmlHead;
  }

  static _getHtmFoot() {
    let htmlFoot = '';
    htmlFoot += '  </body>\n';
    htmlFoot += '</html>\n';
    return htmlFoot;
  }

  static _parseItemsToHtmlList(feedText, tagItem) {
    if (!feedText) return null;
    let itemNumber = textTools.occurrences(feedText, '</' + tagItem + '>');
    let htmlItemList=[];
    let item = {number: 0, title: '', link: '', description: '', category : '', author: '', pubDate: '', pubDateText: ''};
    let itemText = feedParser._getNextItem(feedText, '---', tagItem); // use a fake id to start
    for (let i=0; i<itemNumber; i++) {
      let itemId = feedParser._getItemId(itemText);
      item.number = i + 1;
      item.link = feedParser._extractValue(itemText, tagList.LINK);
      if (! item.link) {
        item.link = feedParser._extractAttribute(itemText, tagList.LINK, tagList.ATT_LINK);
      }
      item.title = textTools.decodeHtml(feedParser._extractValue(itemText, tagList.TITLE));
      if (!item.title) { item.title = item.link; }
      item.description = textTools.decodeHtml(feedParser._extractValue(itemText, tagList.DESC));
      item.category = feedParser._getItemCategory(itemText);
      item.author = textTools.decodeHtml(feedParser._extractValue(itemText, tagList.AUTHOR));
      let pubDateText = feedParser._extractValue(itemText, tagList.PUBDATE);
      item.pubDate = feedParser._extractDateTime(pubDateText);
      let optionsDateTime = { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit', hour :'2-digit',  minute:'2-digit' };
      item.pubDateText = item.pubDate ? item.pubDate.toLocaleString(window.navigator.language, optionsDateTime) : pubDateText;
      let htmlItem = feedParser._getHtmlItem(item);
      htmlItemList.push(htmlItem);
      itemText = feedParser._getNextItem(feedText, itemId, tagItem);
    }
    return htmlItemList;
  }

  static _getEncoding(text) {
    if (!text) { return null; }
    let pattern = 'encoding="';
    let encodingStart = text.indexOf(pattern);
    if (encodingStart==-1) { return null; }
    encodingStart += pattern.length;
    let encodingEnd = text.indexOf('"', encodingStart);
    let encoding = text.substring(encodingStart, encodingEnd);
    return encoding;

  }

  static _extractAttribute(text, tagList, attributeList) {
    if (!text) { return null; }
    let textOpenTag = feedParser._extractOpenTag(text, tagList);
    if (!textOpenTag) { return null; }
    for (let attribute of attributeList) {
      let attStart = attribute + '="';
      let attEnd = '"';
      let i = textOpenTag.indexOf(attStart);
      if (i==-1) { continue; }
      let valueStart = textOpenTag.indexOf('"', i);
      if (valueStart==-1) { continue; }
      let valueEnd = textOpenTag.indexOf(attEnd, valueStart + 1);
      if (valueEnd==-1) { continue; }
      let result = textOpenTag.substring(valueStart + 1, valueEnd).trim();
      return result;
    }
    return null;
  }

  static _getHtmlChannel(channel) {
    let htmlChannel = '';
    let title = channel.title;
    if (!title) { title = '(No Title)'; }
    htmlChannel                            += '    <div class="channelHead">\n';
    if (channel.title      ) { htmlChannel += '      <h1 class="channelTitle"><a class="channelLink" href="' + channel.link + '">' + channel.title + '</a></h1>\n'; }
    if (channel.description) { htmlChannel += '      <p class="channelDescription">' + channel.description + '</p>\n'; } else { htmlChannel += '<p class="channelDescription"/>'; }
    htmlChannel                            += '    </div>\n';
    return htmlChannel;
  }

  static _getItemCategory(itemText){
    let category = '';
    let endIndexRef = [];
    let catCmpt = 0;
    let nextStartIndex = 1;
    const MAX_CAT = 10;
    while (nextStartIndex && catCmpt < MAX_CAT) {
      let tmp = feedParser._extractValue(itemText, tagList.CAT, nextStartIndex, endIndexRef);
      if (tmp) {
        category += (catCmpt==0 ? '' : ', ')  + textTools.decodeHtml(tmp);
      }
      nextStartIndex = endIndexRef[0];
      catCmpt++;
    }
    return category;
  }

  static _getHtmlItem(item) {
    let htmlItem = '';
    let title = item.title;
    if (!title) { title = '(No Title)'; }
    htmlItem +=                         '    <div class="item">\n';
    htmlItem +=                         '      <h2 class="itemTitle">\n';
    htmlItem +=                         '        <span class="itemNumber">' + item.number + '.</span>\n';
    htmlItem +=                         '        <a href="' + item.link + '">' + title + '</a>\n';
    htmlItem +=                         '      </h2>\n';
    if (item.description) { htmlItem += '      <div class="itemDescription">' + feedParser._fixDescriptionTags(item.description) + ' </div>\n'; }
    htmlItem +=                         '      <div class="itemInfo">\n';
    if (item.category) { htmlItem +=    '        <div class="itemCat">[' + item.category + ']</div>\n'; }
    if (item.author) { htmlItem +=      '        Posted by ' + item.author + '<br/>\n'; }
    if (item.pubDate) { htmlItem +=     '        ' + item.pubDateText + '<br/>\n'; }
    htmlItem +=                         '      </div>\n';
    htmlItem +=                         '    </div>\n';
    return htmlItem;
  }

  static _extractOpenTag(text, tagList) {
    if (!text) { return null; }
    for (let tag of tagList) {
      let tagStart = '<' + tag;
      let valueStart = text.indexOf(tagStart);
      if (valueStart==-1) { continue; }
      let valueEnd = text.indexOf('>', valueStart);
      if (valueEnd==-1) { continue; }
      let result = text.substring(valueStart, valueEnd + 1).trim();
      return result;
    }
    return null;
  }

  static _fixDescriptionTags(text) {
    if (!text.includes('<')) { return text; }
    let lastTtPos = text.lastIndexOf('<');
    let lastGtPos = text.lastIndexOf('>');
    if (lastTtPos > lastGtPos) {
      text = text.concat('>');
    }
    return text;
  }

}
