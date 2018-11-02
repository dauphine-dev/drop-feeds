/*global TextTools DateTime DefaultValues Compute SecurityFilters*/
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
  DESC: ['content:encoded', 'description', 'content', 'summary', 'subtitle', 'media:description'],
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

  static async getFeedInfo_async(feedText, defaultTitle, isError) {
    let feedInfo = DefaultValues.getDefaultFeedInfo();
    feedInfo.isError = isError;
    feedInfo.tagItem = FeedParser._get1stUsedTag(feedText, tagList.ITEM);
    feedInfo.format = FeedParser._getFeedFormat(feedInfo.tagItem, feedText);
    feedInfo.channel = FeedParser._parseChannelToObj(feedText, feedInfo.tagItem, defaultTitle);
    feedInfo.itemList = await FeedParser._parseItems_async(feedText, feedInfo.tagItem);
    return feedInfo;
  }

  static getFeedEncoding(text) {
    if (!text) { return null; }
    let pattern = 'encoding="';
    let encodingStart = text.indexOf(pattern);
    if (encodingStart == -1) { return null; }
    encodingStart += pattern.length;
    let encodingEnd = text.indexOf('"', encodingStart);
    let encoding = text.substring(encodingStart, encodingEnd);
    return encoding;

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
    channel.encoding = FeedParser.getFeedEncoding(feedText);
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


  static async _parseItems_async(feedText, tagItem) {
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
      item.description = await FeedParser._getDescription_async(itemText);
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


  static _getItemTooltipText(item, itemNumber) {
    /*eslint-disable no-control-regex*/
    let tooltipText = TextTools.toPlainText(item.description).replace(/[\x01-\x1f]/g, ' ').replace(/\s\s+/g, ' ');
    /*eslint-enable no-control-regex*/
    if (tooltipText.length > 310) {
      tooltipText = tooltipText.substring(0, 310) + '...';
    }
    tooltipText = itemNumber + '. ' + item.title + '\n\n' + tooltipText;
    return tooltipText;
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

  static async _getDescription_async(itemText) {
    let description = TextTools.decodeHtml(FeedParser._extractValue(itemText, tagList.DESC));
    if (!description) { return ''; }
    description = FeedParser._fixDescriptionTags(description);
    description = await SecurityFilters.instance.applySecurityFilters_async(description);
    return description;
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
