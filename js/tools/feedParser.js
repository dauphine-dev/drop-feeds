/*global browser BrowserManager TextTools DateTime ThemeManager DefaultValues Compute ItemSorter */
/*cSpell:ignore LASTBUILDDATE, Cmpt */
'use strict';
const tagList = {
  FEED: ['?xml', 'rss', 'feed'],
  RSS: ['rss'],
  ATOM: ['feed'],
  ATT_RSS_VERSION: ['version'],
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

class FeedParser { /*exported FeedParser*/
  static parsePubdate(feedText) {
    if (!feedText) return null;
    let tagItem = FeedParser._get1stUsedTag(feedText, tagList.ITEM);
    let itemNumber = TextTools.occurrences(feedText, '</' + tagItem + '>');
    let pubDateList = [];

    let itemText = FeedParser._getNextItem(feedText, '---', tagItem); // use a fake id to start
    for (let i = 0; i < itemNumber; i++) {
      let itemId = FeedParser._getItemId(itemText);
      let pubDateText = FeedParser._extractValue(itemText, tagList.PUBDATE);
      let pubDate = FeedParser._extractDateTime(pubDateText);
      pubDateList.push(pubDate);
      itemText = FeedParser._getNextItem(feedText, itemId, tagItem);
    }

    pubDateList.sort((date1, date2) => {
      if (date1 > date2) return -1;
      if (date1 < date2) return 1;
      return 0;
    });
    let pubDate = pubDateList[0];
    if (!pubDate || pubDate == new Date(null)) {
      /*
      let lastBuildDateText = FeedParser._extractValue(feedText, tagList.LASTBUILDDATE);
      pubDate = FeedParser._extractDateTime(lastBuildDateText);
      */
      pubDate = null;
    }
    return pubDate;
  }

  static parseTitle(feedText) {
    if (!feedText) return null;
    let tagItem = FeedParser._get1stUsedTag(feedText, tagList.ITEM);
    let channelText = FeedParser._getChannelText(feedText, tagItem);
    let title = TextTools.decodeHtml(FeedParser._extractValue(channelText, tagList.TITLE));
    return title;
  }

  static getFeedBody(feedText) {
    let feedBody = feedText;
    let tagItem = FeedParser._get1stUsedTag(feedText, tagList.ITEM);
    if (tagItem) {
      let i = feedText.indexOf(tagItem);
      if (i >= 0) {
        feedBody = feedText.substring(i);
      }
    }
    return feedBody;
  }

  static isValidFeedText(feedText) {
    if (!feedText) {
      return 'Feed is empty!';
    }

    let tagFeed = null;
    for (let tag of tagList.FEED) {
      if (feedText.includes('<' + tag)) {
        tagFeed = tag;
        break;
      }
    }
    if (!tagFeed) {
      return 'Feed tags are missing';
    }

    let tagItem = FeedParser._get1stUsedTag(feedText, tagList.ITEM);
    if (!tagItem) {
      return 'Feed doesn\'t contain items';
    }

    let tagChannel = FeedParser._get1stUsedTag(feedText, tagList.CHANNEL);
    if (!tagChannel) {
      return 'Feed has no channels';
    }
    return null;
  }

  static parseFeedToHtml(feedText, defaultTitle) {
    let feedInfo = FeedParser.getFeedInfo(feedText, defaultTitle);
    let feedHtml = FeedParser._feedInfoToHtml(feedInfo);
    return feedHtml;
  }

  static parseItemsTitleToHtml(title, link) {
    let titleHtml = '<a href="' + link + '">' + title + '</a>';
    return titleHtml;
  }

  static async parseItemListToHtml_async(itemList, tooltipsVisible) {
    let htmlItemList = [];
    itemList = ItemSorter.instance.sort(itemList);
    for (let i = 0; i < itemList.length; i++) {
      let htmlItem = await FeedParser._getHtmlItemLine_async(itemList[i], i + 1, tooltipsVisible);
      htmlItemList.push(htmlItem);
    }
    let itemsHtml = htmlItemList.join('\n');
    return itemsHtml;

  }

  static feedItemsListToUnifiedHtml(feedItems, unifiedChannelTitle) {
    let unifiedChannel = DefaultValues.getDefaultChannelInfo();
    unifiedChannel.title = unifiedChannelTitle;
    unifiedChannel.description = 'Unified Feed';
    let htmlHead = FeedParser._getHtmlHead(unifiedChannel);
    let feedHtml = '';
    feedHtml += htmlHead;
    feedHtml += FeedParser._getHtmlChannel(unifiedChannel);
    let htmlItemList = [];
    feedItems.sort((item1, item2) => {
      if (item1.pubDate > item2.pubDate) return -1;
      if (item1.pubDate < item2.pubDate) return 1;
      return 0;
    });
    for (let i = 0; i < feedItems.length && i < DefaultValues.maxItemsInUnifiedView; i++) {
      let htmlItem = FeedParser._getHtmlItem(feedItems[i], i + 1);
      htmlItemList.push(htmlItem);
    }
    feedHtml += htmlItemList.join('\n');
    feedHtml += FeedParser._getHtmFoot();
    return feedHtml;
  }

  static getFeedInfo(feedText, defaultTitle) {
    let feedInfo = DefaultValues.getDefaultFeedInfo();
    feedInfo.tagItem = FeedParser._get1stUsedTag(feedText, tagList.ITEM);
    feedInfo.format = FeedParser._getFeedFormat(feedInfo.tagItem, feedText);
    feedInfo.channel = FeedParser._parseChannelToObj(feedText, feedInfo.tagItem, defaultTitle);
    feedInfo.itemList = FeedParser._parseItems(feedText, feedInfo.tagItem);
    return feedInfo;
  }

  //private stuffs

  static _getFeedFormat(tagItem, feedText) {
    if (!tagItem || !feedText) { return null; }
    let feedType = '';
    let version = null;
    switch (tagItem.toLowerCase()) {
      case 'item':
        feedType = 'RSS';
        version = FeedParser._extractAttribute(feedText, tagList.RSS, tagList.ATT_RSS_VERSION);
        break;
      case 'entry':
        feedType = 'ATOM';
        version = '';
        break;
    }
    let feedFormat = feedType;
    if (version) {
      feedFormat += ' ' + version;
    }
    return feedFormat;
  }

  static _feedInfoToHtml(feedInfo) {
    let htmlHead = FeedParser._getHtmlHead(feedInfo.channel);
    let feedHtml = '';
    feedHtml += htmlHead;
    feedHtml += FeedParser._getHtmlChannel(feedInfo.channel);
    let htmlItemList = [];
    /*
    feedInfo.itemList.sort((item1, item2) => {
      if (item1.pubDate > item2.pubDate) return -1;
      if (item1.pubDate < item2.pubDate) return 1;
      return 0;
    });
    */
    feedInfo.itemList = ItemSorter.instance.sort(feedInfo.itemList);
    for (let i = 0; i < feedInfo.itemList.length; i++) {
      let htmlItem = FeedParser._getHtmlItem(feedInfo.itemList[i], i + 1);
      htmlItemList.push(htmlItem);
    }
    feedHtml += htmlItemList.join('\n');
    feedHtml += FeedParser._getHtmFoot();
    return feedHtml;
  }

  static _get1stUsedTag(text, tagArray) {
    if (!text) { return null; }
    for (let tag of tagArray) {
      if (text.includes('</' + tag + '>')) { return tag; }
    }
    return null;
  }

  static _getNextItem(feedText, itemId, tagItem) {
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

  static _getItemId(itemText) {
    if (!itemText) { return null; }
    let noTrim = true;
    let result = FeedParser._extractValue(itemText, tagList.ID, null, null, noTrim);
    if (!result) {
      let hasIdTag = FeedParser._get1stUsedTag(itemText, tagList.ID);
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

  static _extractValue(text, tagList, startIndex_optional, out_endIndex_optional, noTrim_optional) {
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
        result = TextTools.replaceAll(result, '<![CDATA[', '');
        result = TextTools.replaceAll(result, ']]>', '');
        if (!noTrim_optional) { result = result.trim(); }
      }
      out_endIndex_optional[0] = valueEnd + tagEnd.length;

      return result;
    }
    return null;
  }

  static _extractAttribute(text, tagList, attributeList) {
    if (!text) { return null; }
    let textOpenTag = FeedParser._extractOpenTag(text, tagList);
    if (!textOpenTag) { return null; }
    for (let attribute of attributeList) {
      let attStart = attribute + '="';
      let attEnd = '"';
      let i = textOpenTag.indexOf(attStart);
      if (i == -1) { continue; }
      let valueStart = textOpenTag.indexOf('"', i);
      if (valueStart == -1) { continue; }
      let valueEnd = textOpenTag.indexOf(attEnd, valueStart + 1);
      if (valueEnd == -1) { continue; }
      let result = textOpenTag.substring(valueStart + 1, valueEnd).trim();
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
      if (!DateTime.isValid(extractedDateTime)) {
        extractedDateTime = new Date(DateTime.timeZoneToGmt(dateTimeText));
        if (!DateTime.isValid(DateTime)) {
          //DateTime = new Date(null);
          extractedDateTime = null;
        }
      }
    }
    return extractedDateTime;
  }

  static _parseChannelToObj(feedText, tagItem, defaultTitle) {
    let channel = DefaultValues.getDefaultChannelInfo();
    channel.encoding = FeedParser._getEncoding(feedText);
    let channelText = FeedParser._getChannelText(feedText, tagItem);
    channel.link = FeedParser._extractValue(channelText, tagList.LINK);
    if (!channel.link) {
      channel.link = FeedParser._extractAttribute(channelText, tagList.LINK, tagList.ATT_LINK);
    }
    channel.title = TextTools.decodeHtml(FeedParser._extractValue(channelText, tagList.TITLE));
    if (!channel.title) { channel.title = defaultTitle; }
    if (!channel.title) { channel.title = channel.link; }
    channel.description = TextTools.decodeHtml(FeedParser._extractValue(channelText, tagList.DESC));
    return channel;
  }

  static _getChannelText(feedText, tagItem) {
    let tagChannel = FeedParser._get1stUsedTag(feedText, tagList.CHANNEL);
    let channelText = TextTools.getInnerText(feedText, tagChannel, tagItem);
    if (!channelText) {
      channelText = TextTools.getInnerText(feedText, tagChannel, '</' + tagChannel);
    }
    return channelText;
  }


  static _getHtmlHead(channel) {
    let iconUrl = browser.extension.getURL(ThemeManager.instance.iconDF32Url);
    let cssUrl = browser.extension.getURL(ThemeManager.instance.getCssUrl('feed.css'));
    let encoding = 'utf-8'; // Conversion is now done in downloadTextFileEx_async()
    let htmlHead = '';
    htmlHead += '<html>\n';
    htmlHead += '  <head>\n';
    htmlHead += '    <meta http-equiv="Content-Type" content="text/html; charset=' + encoding + '">\n';
    htmlHead += '    <link rel="icon" type="image/png" href="' + iconUrl + '">\n';
    htmlHead += '    <link rel="stylesheet" type="text/css" href="' + cssUrl + '">\n';
    if (channel.title) { htmlHead += '    <title>' + channel.title + ' - Drop-Feed</title>\n'; }
    htmlHead += '  </head>\n';
    htmlHead += '  <body>\n';
    return htmlHead;
  }

  static _getHtmFoot() {
    let htmlFoot = '';
    htmlFoot += '  </body>\n';
    htmlFoot += '</html>\n';
    return htmlFoot;
  }

  static _parseItems(feedText, tagItem) {
    if (!feedText) return null;
    let itemNumber = TextTools.occurrences(feedText, '</' + tagItem + '>');
    let itemList = [];
    let itemText = FeedParser._getNextItem(feedText, '---', tagItem); // use a fake id to start
    for (let i = 0; i < itemNumber; i++) {
      let item = DefaultValues.getDefaultItem(null);
      let itemIdRaw = FeedParser._getItemId(itemText);
      item.id = Compute.hashCode(itemIdRaw);
      item.number = i + 1;
      item.link = FeedParser._getItemLink(itemText);
      item.title = TextTools.decodeHtml(FeedParser._extractValue(itemText, tagList.TITLE));
      if (!item.title) { item.title = item.link; }
      item.description = TextTools.decodeHtml(FeedParser._extractValue(itemText, tagList.DESC));
      item.category = FeedParser._getItemCategory(itemText);
      item.author = TextTools.decodeHtml(FeedParser._extractValue(itemText, tagList.AUTHOR));
      item.enclosure = FeedParser._getEnclosure(itemText);
      let pubDateText = FeedParser._extractValue(itemText, tagList.PUBDATE);
      item.pubDate = FeedParser._extractDateTime(pubDateText);
      let optionsDateTime = { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      item.pubDateText = item.pubDate ? item.pubDate.toLocaleString(window.navigator.language, optionsDateTime) : pubDateText;
      itemList.push(item);
      itemText = FeedParser._getNextItem(feedText, itemIdRaw, tagItem);
    }
    return itemList;
  }

  static _getItemLink(itemText) {
    let itemLink = FeedParser._extractValue(itemText, tagList.LINK);
    if (!itemLink) {
      let inputIndex = 0;
      let outputIndex = { value: 0 };
      let i = 0;
      while (outputIndex.value != -1 && !itemLink && i++ < 100) {
        inputIndex = outputIndex.value;
        let link = TextTools.getOuterTextEx(itemText, '<' + tagList.LINK, '/>', inputIndex, outputIndex, false);
        if (link) {
          if (link.includes('type="text/html"')) {
            itemLink = FeedParser._extractAttribute(link, tagList.LINK, tagList.ATT_LINK);
          }
        }
      }
      if (!itemLink) {
        itemLink = FeedParser._extractAttribute(itemText, tagList.LINK, tagList.ATT_LINK);
      }
    }
    return itemLink;
  }

  static _getEncoding(text) {
    if (!text) { return null; }
    let pattern = 'encoding="';
    let encodingStart = text.indexOf(pattern);
    if (encodingStart == -1) { return null; }
    encodingStart += pattern.length;
    let encodingEnd = text.indexOf('"', encodingStart);
    let encoding = text.substring(encodingStart, encodingEnd);
    return encoding;

  }

  static _getHtmlChannel(channel) {
    let htmlChannel = '';
    let title = channel.title;
    if (!title) { title = '(No Title)'; }
    htmlChannel += '    <div class="channelHead">\n';
    if (channel.title) { htmlChannel += '      <h1 class="channelTitle"><a class="channelLink" href="' + channel.link + '">' + channel.title + '</a></h1>\n'; }
    if (channel.description) { htmlChannel += '      <p class="channelDescription">' + channel.description + '</p>\n'; } else { htmlChannel += '<p class="channelDescription"/>'; }
    htmlChannel += '    </div>\n';
    return htmlChannel;
  }

  static _getItemCategory(itemText) {
    let category = '';
    let endIndexRef = [];
    let catCmpt = 0;
    let nextStartIndex = 1;
    const MAX_CAT = 10;
    while (nextStartIndex && catCmpt < MAX_CAT) {
      let tmp = FeedParser._extractValue(itemText, tagList.CAT, nextStartIndex, endIndexRef);
      if (tmp) {
        category += (catCmpt == 0 ? '' : ', ') + TextTools.decodeHtml(tmp);
      }
      nextStartIndex = endIndexRef[0];
      catCmpt++;
    }
    return category;
  }

  static _getEnclosure(itemText) {
    // RSS enclosure attributes 'url', 'type', 'length'
    let tag = 'enclosure';
    let url = FeedParser._extractAttribute(itemText, tag, ['url']);
    if (url) {
      let mimetype = FeedParser._extractAttribute(itemText, tag, ['type']);
      if (mimetype) {
        let size = FeedParser._extractAttribute(itemText, tag, ['length']);
        let d = { 'url': url, 'mimetype': mimetype, 'size': size };
        return d;
      }
    }

    // MediaRSS attributes 'url', 'type', 'fileSize'
    tag = 'media:content';
    url = FeedParser._extractAttribute(itemText, tag, ['url']);
    if (url) {
      let mimetype = FeedParser._extractAttribute(itemText, tag, ['type']);
      if (mimetype) {
        let size = FeedParser._extractAttribute(itemText, tag, ['fileSize']);
        let d = { 'url': url, 'mimetype': mimetype, 'size': size };
        return d;
      }
    }

    return null;
  }

  static _getEnclosureHTML(item) {
    if (!item || !item.enclosure)
      return '';

    if (item.enclosure.mimetype.startsWith('audio/')) {
      let html = '<div class="itemAudioPlayer"><audio preload=none controls><source src="' + item.enclosure.url + '" type="' + item.enclosure.mimetype + '"></audio></div>\n' +
        '<div class="itemEnclosureLink"><a href="' + item.enclosure.url + '" download>' + item.enclosure.url + '</a></div>\n';
      return html;
    }

    if (item.enclosure.mimetype.startsWith('video/')) {
      let html = '<div class="itemVideoPlayer"><video width=640 height=480 preload=none controls><source src="' + item.enclosure.url + '" type="' + item.enclosure.mimetype + '"></video></div>\n' +
        '<div class="itemEnclosureLink"><a href="' + item.enclosure.url + '" download>' + item.enclosure.url + '</a></div>\n';
      return html;
    }

    return '';
  }

  static _getHtmlItem(item, itemNumber) {
    let htmlItem = '';
    let title = item.title;
    if (!title) { title = '(No Title)'; }
    htmlItem += '    <div class="item">\n';
    htmlItem += '      <h2 class="itemTitle">\n';
    htmlItem += '        <span class="itemNumber">' + (itemNumber ? itemNumber : item.number) + '.</span>\n';
    htmlItem += '        <a href="' + item.link + '">' + title + '</a>\n';
    htmlItem += '      </h2>\n';
    if (item.description) { htmlItem += '      <div class="itemDescription">' + FeedParser._fixDescriptionTags(item.description) + ' </div>\n'; }
    htmlItem += '      <div class="itemInfo">\n';
    if (item.category) { htmlItem += '        <div class="itemCat">[' + item.category + ']</div>\n'; }
    if (item.author) { htmlItem += '        <div class="itemAuthor">Posted by ' + item.author + '</div>\n'; }
    if (item.pubDate) { htmlItem += '        <div class="itemPubDate">' + item.pubDateText + '</div>\n'; }
    if (item.enclosure) { htmlItem += '        <div class="itemEnclosure">' + FeedParser._getEnclosureHTML(item) + ' </div>\n'; }
    htmlItem += '      </div>\n';
    htmlItem += '    </div>\n';
    return htmlItem;
  }

  static async _getHtmlItemLine_async(item, itemNumber, tooltipsVisible) {
    //item: { id: id, number: 0, title: '', link: '', description: '', category : '', author: '', pubDate: '', pubDateText: '' };
    let title = item.title;
    if (!title) { title = '(No Title)'; }
    let target = BrowserManager.instance.alwaysOpenNewTab ? 'target="_blank"' : '';
    let num = itemNumber ? itemNumber : item.number;
    let visited = (await BrowserManager.isVisitedLink_async(item.link)) ? ' visited' : '';
    let tooltip = (tooltipsVisible ? 'title' : 'title1') + '="' + BrowserManager.htmlToText(item.description) + '"';
    let htmlItemLine = '<span class="item' + visited + '" ' + tooltip + '" ' + target + ' href="' + item.link + '">' + num + '. ' + title + '</span><br/>';

    return htmlItemLine;
  }

  static _extractOpenTag(text, tagList) {
    if (!text) { return null; }
    for (let tag of tagList) {
      let tagStart = '<' + tag;
      let valueStart = text.indexOf(tagStart);
      if (valueStart == -1) { continue; }
      let valueEnd = text.indexOf('>', valueStart);
      if (valueEnd == -1) { continue; }
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

    let divOpenCount1 = TextTools.occurrences(text, '<div>');
    let divOpenCount2 = TextTools.occurrences(text, '<div ');
    let divOpenCount = divOpenCount1 + divOpenCount2;
    let divCloseCount = TextTools.occurrences(text, '</div>');
    let diff = divOpenCount - divCloseCount;
    if (diff > 0) {
      text += '</div>'.repeat(diff);
    }
    return text;
  }
}
