/*global browser BrowserManager FeedParser DefaultValues Listener ListenerProviders USTools ItemSorter ThemeManager FeedTransform TextTools*/
'use strict';
class RenderOptions {
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._itemNewTab = DefaultValues.itemNewTab;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'itemNewTab', (v) => { this._setItemNewTab_sbscrb(v); }, true);
  }

  _setItemNewTab_sbscrb(value) {
    this._itemNewTab = value;
  }

  get itemNewTab() {
    return this._itemNewTab;
  }
}

class FeedRenderer { /*exported FeedRenderer*/

  static async renderFeedToHtml_async(feedText, defaultTitle, isError) {
    let feedInfo = await FeedParser.getFeedInfo_async(feedText, defaultTitle, isError);
    //let feedHtml = FeedRenderer._feedInfoToHtml(feedInfo);
    let feedHtml = FeedTransform.transformFeedToHtml_async(feedInfo);
    return feedHtml;
  }

  static feedErrorToHtml(error, url, title) {
    error = TextTools.replaceAll(error, '\n' , '<br/>');
    let feedHtml = USTools.rssHeader(title, url, 'Error');  
    let description = `<table>
    <tr><td>Name: </td><td>` + title + `</td></tr>
    <tr><td>Url: </td><td><a href="` + url + '">' + url + `</a></td></tr>
    <tr><td></td><td></td></tr>
    <tr><td>Error: </td><td>` + error + `</td></tr>
    </table>`;
    feedHtml += USTools.rssItem('Error: ' + error.split('<br/>')[0], url, new Date(), description);
    feedHtml += USTools.rssFooter();
    return feedHtml;
  }

  static renderItemsTitleToHtml(title, link) {
    let titleHtml = '<a href="' + link + '">' + title + '</a>';
    return titleHtml;
  }

  static async renderItemListToHtml_async(itemList, tooltipsVisible) {
    let htmlItemList = [];
    if (itemList) {
      itemList = ItemSorter.instance.sort(itemList);
      for (let i = 0; i < itemList.length; i++) {
        let htmlItem = await FeedRenderer._getHtmlItemLine_async(itemList[i], i + 1, tooltipsVisible);
        htmlItemList.push(htmlItem);
      }
    }
    let itemsHtml = htmlItemList.join('\n');
    return itemsHtml;

  }

  static feedItemsListToUnifiedHtml(feedItems, unifiedChannelTitle) {
    let unifiedChannel = DefaultValues.getDefaultChannelInfo();
    unifiedChannel.title = unifiedChannelTitle;
    unifiedChannel.description = 'Unified Feed';
    let htmlHead = FeedRenderer._getHtmlHead(unifiedChannel);
    let feedHtml = '';
    feedHtml += htmlHead;
    feedHtml += FeedRenderer._getHtmlChannel(unifiedChannel);
    let htmlItemList = [];
    feedItems.sort((item1, item2) => {
      if (item1.pubDate > item2.pubDate) return -1;
      if (item1.pubDate < item2.pubDate) return 1;
      return 0;
    });
    for (let i = 0; i < feedItems.length && i < DefaultValues.maxItemsInUnifiedView; i++) {
      let htmlItem = FeedRenderer._getHtmlItem(feedItems[i], i + 1);
      htmlItemList.push(htmlItem);
    }
    feedHtml += htmlItemList.join('\n');
    feedHtml += FeedRenderer._getHtmFoot();
    return feedHtml;
  }

  //private stuffs

  static _feedInfoToHtml(feedInfo) {
    let htmlHead = FeedRenderer._getHtmlHead(feedInfo.channel);
    let feedHtml = '';
    feedHtml += htmlHead;
    feedHtml += FeedRenderer._getHtmlChannel(feedInfo.channel, feedInfo.isError);
    let htmlItemList = [];
    feedInfo.itemList = ItemSorter.instance.sort(feedInfo.itemList);
    for (let i = 0; i < feedInfo.itemList.length; i++) {
      let htmlItem = FeedRenderer._getHtmlItem(feedInfo.itemList[i], i + 1, feedInfo.isError);
      htmlItemList.push(htmlItem);
    }
    feedHtml += htmlItemList.join('\n');
    feedHtml += FeedRenderer._getHtmFoot();
    return feedHtml;
  }

  static _getHtmlHead(channel) {
    let iconUrl = browser.runtime.getURL(ThemeManager.instance.iconDF32Url);
    let cssUrl1 = browser.runtime.getURL(ThemeManager.instance.getRenderCssTemplateUrl());
    let cssUrl2 = browser.runtime.getURL(ThemeManager.instance.getRenderCssUrl());
    let encoding = 'utf-8'; // Conversion is now done in downloadTextFileEx_async()
    let htmlHead = '';
    htmlHead += '<html>\n';
    htmlHead += '  <head>\n';
    htmlHead += '    <meta http-equiv="Content-Type" content="text/html; charset=' + encoding + '">\n';
    htmlHead += '    <link rel="icon" type="image/png" href="' + iconUrl + '">\n';
    htmlHead += '    <link rel="stylesheet" type="text/css" href="' + cssUrl1 + '">\n';
    htmlHead += '    <link rel="stylesheet" type="text/css" href="' + cssUrl2 + '">\n';
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

  static _getHtmlChannel(channel, isError) {
    let htmlChannel = '';
    let title = channel.title;
    if (!title) { title = '(No Title)'; }
    let error = (isError ? 'error' : '');
    htmlChannel += '    <div class="channelHead ' + error + '">\n';
    if (channel.title) { htmlChannel += '      <h1 class="channelTitle"><a class="channelLink" href="' + channel.link + '">' + channel.title + '</a></h1>\n'; }
    if (channel.description) { htmlChannel += '      <p class="channelDescription">' + channel.description + '</p>\n'; } else { htmlChannel += '<p class="channelDescription"/>'; }
    htmlChannel += '    </div>\n';
    return htmlChannel;
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

  static _getHtmlItem(item, itemNumber, isError) {
    let htmlItem = '';
    let title = item.title;
    if (!title) { title = '(No Title)'; }
    let error = (isError ? 'error' : '');
    htmlItem += '    <div class="item">\n';
    htmlItem += '      <h2 class="itemTitle ' + error + '">\n';
    htmlItem += '        <span class="itemNumber">' + (itemNumber ? itemNumber : item.number) + '.</span>\n';
    let linkTarget = RenderOptions.instance.itemNewTab ? 'target="_blank" rel="noopener noreferrer"' : '';
    htmlItem += '        <a ' + linkTarget + ' href="' + item.link + '">' + title + '</a>\n';
    htmlItem += '      </h2>\n';
    if (item.description) { htmlItem += '      <div class="itemDescription">' + item.description + ' </div>\n'; }
    htmlItem += '      <div class="itemInfo">\n';
    if (item.category) { htmlItem += '        <div class="itemCat">[' + item.category + ']</div>\n'; }
    if (item.author) { htmlItem += '        <div class="itemAuthor">Posted by ' + item.author + '</div>\n'; }
    if (item.pubDate) { htmlItem += '        <div class="itemPubDate">' + item.pubDateText + '</div>\n'; }
    if (item.enclosure) { htmlItem += '        <div class="itemEnclosure">' + FeedRenderer._getEnclosureHTML(item) + ' </div>\n'; }
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
    let visited = undefined;
    try { visited = (await BrowserManager.isVisitedLink_async(item.link)) ? ' visited' : ''; }
    catch (e) { }
    let tooltipText = FeedParser.getItemTooltipText(item, num);
    let tooltip = (tooltipsVisible ? 'title' : 'title1') + '="' + BrowserManager.htmlToText(tooltipText) + '"';
    let htmlItemLine = '<span class="item' + visited + '" ' + tooltip + '" ' + target + ' href="' + item.link + '" num="' + num + '">' + num + '. ' + title + '</span><br/>';

    return htmlItemLine;
  }
}