/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global browser, getInnerText1, occurrences, dateTimeMaxValue, isValidDate, storageLocalSetItemAsync, storageLocalGetItemAsync*/
/*global dateTimeMinValue, timeZoneToGmt, checkFeedsAsync, XSLTProcessor, downloadFileAsync, decodeHtml, getThemeCssUrlMozExtAsync*/
'use strict';
//----------------------------------------------------------------------
const FeedStatusEnum = {
  UPDATED: 'updated',
  OLD: 'old',
  ERROR: 'error'
};
const TAG_RSS_LIST = ['?xml', 'rss'];
const TAG_CHANNEL_LIST = ['channel', 'feed'];
const TAG_LASTBUILDDATE_LIST = ['lastBuildDate', 'pubDate'];

const TAG_ITEM_LIST = ['item', 'entry'];
const TAG_ID_LIST = ['guid', 'id'];
const TAG_TITLE_LIST = ['title'];
const TAG_LINK_LIST = ['link'];
const ATT_LINK_LIST = ['href'];
const TAG_DESC_LIST = ['content:encoded', 'description', 'content', 'summary', 'subtitle'];
const TAG_CAT_LIST = ['category'];
const TAG_AUTHOR_LIST = ['author', 'dc:creator'];
const TAG_PUBDATE_LIST = ['pubDate', 'published', 'dc:date', 'updated', 'a10:updated', 'lastBuildDate'];
//---------------------------------------------------------------------- 
function getItemId(itemText) {  
  let result = extractValue(itemText, TAG_ID_LIST);
  if (!result) {    
    let hasIdTag = get1stUsedTag(itemText, TAG_ID_LIST);
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
//---------------------------------------------------------------------- 
function getEncoding(text) {
  let pattern = 'encoding="';
  let encodingStart = text.indexOf(pattern);
  if (encodingStart==-1) { return null; }
  encodingStart += pattern.length;
  let encodingEnd = text.indexOf('"', encodingStart);
  let encoding = text.substring(encodingStart, encodingEnd);
  return encoding;
  
}
//---------------------------------------------------------------------- 
function extractValue(text, tagList, startIndex_optional, out_endIndex_optional) {
  let result = null;
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
//----------------------------------------------------------------------
function extractOpenTag(text, tagList) {
  let result = null;
  for (let tag of tagList) {
    let tagStart = '<' + tag;
    let tagEnd = '</' + tag + '>';    
    let valueStart = text.indexOf(tagStart);
    if (valueStart==-1) { continue; }
    let valueEnd = text.indexOf('>', valueStart);
    if (valueEnd==-1) { continue; }    
    let result = text.substring(valueStart, valueEnd + 1).trim();    
    return result;
  }
  return null;
}
//----------------------------------------------------------------------
function extractAttribute(text, tagList, attributeList) {
  let textOpenTag = extractOpenTag(text, tagList);
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
//----------------------------------------------------------------------
function getFeedPubdate(feedObj) {
  if (!feedObj.feedText) return null;  
  let tagItem = get1stUsedTag(feedObj.feedText, TAG_ITEM_LIST);
  let tagId = get1stUsedTag(feedObj.feedText, TAG_ID_LIST);  
  let itemNumber = occurrences(feedObj.feedText, '</' + tagItem + '>');
  let pubDateList=[];
  
  let itemText = getNextItem(feedObj.feedText, '---', tagItem); // use a fake id to start
  for (let i=0; i<itemNumber; i++) { 
    let itemId = getItemId(itemText);
    let pubDateText = extractValue(itemText, TAG_PUBDATE_LIST);
    let pubDate = extracDateTime(pubDateText);    
    pubDateList.push(pubDate);
    itemText = getNextItem(feedObj.feedText, itemId, tagItem);
  }
  
  pubDateList.sort((date1, date2) => {
    if (date1 > date2) return -1;
    if (date1 < date2) return 1;
    return 0;});
    
  let pubDate = pubDateList[0];
  if (!pubDate || pubDate == new Date(null)) {
    let lastBuildDateText = extractValue(feedObj.feedText, TAG_LASTBUILDDATE_LIST);
    pubDate = extracDateTime(lastBuildDateText);    
  }
  return pubDate;
}
//----------------------------------------------------------------------
function extracDateTime(dateTimeText) {
  let dateTime = null;
  if (dateTimeText) {
    dateTimeText = dateTimeText.replace(/\s+/g, ' ');
    dateTime = new Date(dateTimeText);
    if (!isValidDate(dateTime)) {
      dateTime = new Date(timeZoneToGmt(dateTimeText));
      if (!isValidDate(dateTime)) {
        //dateTime = new Date(null);
        dateTime = null;
      }
    }
  }
  return dateTime;
}

//----------------------------------------------------------------------
function get1stUsedTag(text, tagArray) {
  for (let tag of tagArray) {
    if (text.includes('</' + tag + '>')) { return tag; }
  }
  return null;
}
//----------------------------------------------------------------------
function getNextItem(feedText, itemId, tagItem) {
  let itemIdPattern = '>' + itemId + '<';
  let idIndex = feedText.indexOf(itemIdPattern); if (idIndex < 0) idIndex = 0;
  
  let startNextItemIndex = feedText.indexOf('<' + tagItem, idIndex + 1);
  if (startNextItemIndex == -1) return '';
  let tagItemEnd = '</' + tagItem + '>';
  let endNextItemIndex = feedText.indexOf(tagItemEnd, startNextItemIndex);
  if (endNextItemIndex < 1) return '';
  let result = feedText.substring(startNextItemIndex, endNextItemIndex + tagItemEnd.length);
  return result;
}
//----------------------------------------------------------------------
async function updateFeedStatusAsync(storageObj, feedId, feedStatus, pubDate, name) {
  let storedFeedObj = await getStoredFeedAsync(null, feedId, name);
  let feedUiItem = document.getElementById(feedId);
  storedFeedObj.status = feedStatus;
  
  switch(feedStatus) {
  case FeedStatusEnum.UPDATED:
    feedUiItem.classList.remove('feedError');
    feedUiItem.classList.remove('feedRead');
    feedUiItem.classList.add('feedUnread');
    break;
  case FeedStatusEnum.OLD:
    feedUiItem.classList.remove('feedError');
    feedUiItem.classList.remove('feedUnread');
    feedUiItem.classList.add('feedRead');
    break;
  case FeedStatusEnum.ERROR:
    feedUiItem.classList.remove('feedRead');
    feedUiItem.classList.remove('feedUnread');
    feedUiItem.classList.add('feedError');
    break;
  }
  storedFeedObj.pubDate = pubDate;
  if (storedFeedObj.bkmrkId) {
    storedFeedObj = {id: storedFeedObj.id, pubDate: storedFeedObj.pubDate, isBkmrk: true, status: storedFeedObj.status, name: name};
  }
  await storageLocalSetItemAsync(storedFeedObj.id, storedFeedObj);  
}
//----------------------------------------------------------------------
async function getStoredFeedAsync(storageObj, feedId, name) {
  let storedFeedObj = null;
  if (storageObj) {
    storedFeedObj = storageObj[feedId];
  }
  else {
    storedFeedObj = await storageLocalGetItemAsync(feedId);
  }
  if (!storedFeedObj) {
    storedFeedObj = {id: feedId, pubDate: dateTimeMinValue(), isBkmrk: true, status:FeedStatusEnum.OLD, name: name};
  }
  return storedFeedObj;
}
//----------------------------------------------------------------------
function getFolderFromStorageObj(storageObj, folderId) {
  let storedFolder =  storageObj[folderId];
  if (!storedFolder) {
    storedFolder = defaultStoredFolder(folderId);
  }
  return storedFolder;
}
//----------------------------------------------------------------------
function defaultStoredFolder(folderId) {
  return {id: folderId, checked: true};
}
//----------------------------------------------------------------------
async function getFeedItemClassAsync(storageObj, feedId, name) {
  let itemClass = null;  
  let storedFeedObj = await getStoredFeedAsync(storageObj, feedId, name);
  let feedStatus = storedFeedObj.status;
  switch(feedStatus) {
  case FeedStatusEnum.UPDATED:
    itemClass = 'feedUnread';
    break;
  case FeedStatusEnum.OLD:
    itemClass = 'feedRead';
    break;
  case FeedStatusEnum.ERROR:
    itemClass = 'feedError';
    break;
  }
  return itemClass;
}
//----------------------------------------------------------------------
async function checkFeedsForFolderAsync(id) {
  let baseElement = document.getElementById(id);
  checkFeedsAsync(null, baseElement);
}
//----------------------------------------------------------------------
async function OpenAllUpdatedFeedsAsync(id) {
  let feeds = document.getElementById(id).querySelectorAll('.feedUnread, .feedError');
  for (let i = 0; i < feeds.length; i++) {
    let feedId = feeds[i].getAttribute('id');        
    let bookmarkItems = await browser.bookmarks.get(feedId);
    let itemUrl = bookmarkItems[0].url;    
    openFeedAsync(itemUrl);
    let storedFeedObj = await getStoredFeedAsync(null, bookmarkItems[0].id, bookmarkItems[0].id);
    await updateFeedStatusAsync(null, bookmarkItems[0].id, FeedStatusEnum.OLD, new Date(), bookmarkItems[0].title);
  }
}
//----------------------------------------------------------------------
async function MarkAllFeedsAsReadAsync(id) {
  let feeds = document.getElementById(id).querySelectorAll('.feedUnread, .feedError');
  for (let i = 0; i < feeds.length; i++) {      
    let feedId = feeds[i].getAttribute('id');
    feeds[i].classList.remove('feedError');
    feeds[i].classList.remove('feedUnread');
    feeds[i].classList.add('feedRead');
    let storedFeed = getStoredFeedAsync(null, feedId);
    storedFeed.then(function (storedFeedObj) {
      updateFeedStatusAsync(null, storedFeedObj.id, FeedStatusEnum.OLD, new Date(), '');
    });
  }
}
//----------------------------------------------------------------------
async function MarkAllFeedsAsUpdatedAsync(id) {
  let feeds = document.getElementById(id).querySelectorAll('.feedRead, .feedError');
  for (let i = 0; i < feeds.length; i++) {
    let feedId = feeds[i].getAttribute('id');
    feeds[i].classList.remove('feedError');
    feeds[i].classList.remove('feedRead');
    feeds[i].classList.add('feedUnread');
    let storedFeed = getStoredFeedAsync(null, feedId);    
    storedFeed.then(function (storedFeedObj) {
      updateFeedStatusAsync(null, storedFeedObj.id, FeedStatusEnum.UPDATED, new Date(), '') ;   
    });    
  }
}
//----------------------------------------------------------------------
/*
async function openFeedOld(feedUrl) {
  let doc = loadAndTransformFeed(feedUrl); 
  let docBlob = new Blob([getHtmlText(doc)]);
  let docUrl = URL.createObjectURL(docBlob);
  browser.tabs.create({url:docUrl});
}
*/
//----------------------------------------------------------------------
/*
function getHtmlText(doc) {
  let htmlText = doc.documentElement.outerHTML.replace( /&lt;(([^&]|\&[^g]|&g[^t]|&gt[^;])+)&gt;/g, "<$1>");
  return htmlText;
}
*/
//----------------------------------------------------------------------
/*
function loadAndTransformFeed(feedUrl) {
  let xslUrl = browser.extension.getURL("transform/stylesheet.xsl");
  let xmlDoc = loadXmlFile(feedUrl);  
  let xslStyleDoc = loadXslFileAndAddingCss(xslUrl, 'feed/feed.css');
  let htmlDoc = transformToHtmlDoc(xmlDoc, xslStyleDoc);
  return htmlDoc;
} 
*/ 
//----------------------------------------------------------------------
/*
function transformToHtmlDoc(xmlDoc, xslStyleDoc) {
  try {
    let  xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xslStyleDoc);
    let htmlDoc = xsltProcessor.transformToDocument(xmlDoc);    
    return htmlDoc;
  }
  catch(e) { console.log('e', e); }
}
*/
//----------------------------------------------------------------------
/*
function loadXslFileAndAddingCss(xslUrl, relativeCssUrl) {
  let xslDoc = loadXmlFile(xslUrl);    
  let cssUrl = browser.extension.getURL(relativeCssUrl);
  let elCssLink = xslDoc.getElementById('cssLink');
  elCssLink.setAttribute('href', cssUrl);  
  return xslDoc;
}
//----------------------------------------------------------------------
function loadXmlFile(xmlUrl) {
  let xmlHttpRequest = new XMLHttpRequest();
  xmlHttpRequest.open("GET", xmlUrl, false);
  xmlHttpRequest.send(null);
  let xmlDoc = xmlHttpRequest.responseXML;
  return xmlDoc;
}
*/
//----------------------------------------------------------------------
async function openFeedAsync(feedUrl) {
  let feedText = await downloadFileAsync(feedUrl);
  let feedHtml = await parseFeedAsync(feedText);
  let feedBlob = new Blob([feedHtml]);
  let feedHtmlUrl = URL.createObjectURL(feedBlob);
  browser.tabs.create({url:feedHtmlUrl, active: false});
}
//----------------------------------------------------------------------
async function parseFeedAsync(feedText) {
  let feedHtml = '';
  let tagItem = get1stUsedTag(feedText, TAG_ITEM_LIST);  
  let channelObj = parseChannelToObj(feedText, tagItem);
  let htmlHead = await getHtmlHeadAsync(channelObj);  
  feedHtml += htmlHead;
  feedHtml += channelObj.htmlChannel;
  let htmlItemList = parseItemsToHtmlList(feedText, tagItem);
  feedHtml += htmlItemList.join('\n');
  feedHtml += getHtmFoot();
  return feedHtml;
}
//----------------------------------------------------------------------
async function getHtmlHeadAsync(channel) {
  let iconUrl = browser.extension.getURL('icons/drop-feeds-32.png');
  let cssUrl = await getThemeCssUrlMozExtAsync('feed.css');
  let encoding = channel.encoding ? channel.encoding : 'UTF-8';
  if (encoding == 'iso-8859-15') { encoding = 'UTF-8'; }
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
//----------------------------------------------------------------------
function getHtmFoot() {
  let htmlFoot = '';
  htmlFoot += '  </body>\n';
  htmlFoot += '</html>\n';
  return htmlFoot;
}
//----------------------------------------------------------------------
function parseChannelToObj(feedText, tagItem) {
  let channel = {encoding: '', title: '', link: '', description: '', category : '', pubDate: '', htmlChannel: ''};
  channel.encoding =  getEncoding(feedText);
  let tagChannel = get1stUsedTag(feedText, TAG_CHANNEL_LIST);
  let channelText = getInnerText1(feedText, tagChannel, tagItem);
  channel.link = extractValue(channelText, TAG_LINK_LIST);
  if (!channel.link) {
    channel.link = extractAttribute(channelText, TAG_LINK_LIST, ATT_LINK_LIST);    
  }
  channel.title = decodeHtml(extractValue(channelText, TAG_TITLE_LIST));
  if (!channel.title) { channel.title = channel.link; }
  channel.description = decodeHtml(extractValue(channelText, TAG_DESC_LIST));
  channel.htmlChannel = getHtmlChannel(channel);
  return channel;
  
}
//----------------------------------------------------------------------
function getHtmlChannel(channel) {
  let htmlChannel = '';
  let title = channel.title;
  if (!title) { title = '(No Title)'; }
  htmlChannel                            += '    <div class="channelHead">\n';
  if (channel.title      ) { htmlChannel += '      <h1 class="channelTitle"><a class="channelLink" href="' + channel.link + '">' + channel.title + '</a></h1>\n'; }
  if (channel.description) { htmlChannel += '      <p class="channelDescription">' + channel.description + '</p>\n'; } else { htmlChannel += '<p class="channelDescription"/>'; }
  htmlChannel                            += '    </div>\n';
  return htmlChannel;
}
//----------------------------------------------------------------------
function parseItemsToHtmlList(feedText, tagItem) {
  if (!feedText) return null;
  let tagId = get1stUsedTag(feedText, TAG_ID_LIST);
  let itemNumber = occurrences(feedText, '</' + tagItem + '>');
  let htmlItemList=[];
  let item = {number: 0, title: '', link: '', description: '', category : '', author: '', pubDate: '', pubDateText: ''};
  let itemText = getNextItem(feedText, '---', tagItem); // use a fake id to start
  for (let i=0; i<itemNumber; i++) { 
    let itemId = getItemId(itemText);
    item.number = i + 1;
    item.link = extractValue(itemText, TAG_LINK_LIST);
    if (! item.link) {
      item.link = extractAttribute(itemText, TAG_LINK_LIST, ATT_LINK_LIST);
    }
    item.title = decodeHtml(extractValue(itemText, TAG_TITLE_LIST));
    if (!item.title) { item.title = item.link; }
    item.description = decodeHtml(extractValue(itemText, TAG_DESC_LIST));
    item.category = getItemCatagory(itemText);
    item.author = decodeHtml(extractValue(itemText, TAG_AUTHOR_LIST));
    let pubDateText = extractValue(itemText, TAG_PUBDATE_LIST);
    item.pubDate = extracDateTime(pubDateText);
    let optionsDateTime = { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit', hour :'2-digit',  minute:'2-digit' };
    item.pubDateText = item.pubDate ? item.pubDate.toLocaleString(window.navigator.language, optionsDateTime) : pubDateText;
    let htmlItem = getHtmlItem(item);
    htmlItemList.push(htmlItem);
    itemText = getNextItem(feedText, itemId, tagItem);
  }    
  return htmlItemList;
}
//---------------------------------------------------------------------- 
function getItemCatagory(itemText){
  let category = '';
  let endIndexRef = [];
  let catCmpt = 0;
  let nextStartIndex = 1;
  const MAX_CAT = 10;
  while (nextStartIndex && catCmpt < MAX_CAT) { 
    let tmp = extractValue(itemText, TAG_CAT_LIST, nextStartIndex, endIndexRef);
    if (tmp) {
      category += (catCmpt==0 ? '' : ', ')  + decodeHtml(tmp);
    } 
    nextStartIndex = endIndexRef[0];
    catCmpt++;
  }
  return category;
}
//---------------------------------------------------------------------- 
function getHtmlItem(item) {  
  let htmlItem = '';
  let title = item.title;
  if (!title) { title = '(No Title)'; }
  htmlItem +=                         '    <div class="item">\n';
  htmlItem +=                         '      <h2 class="itemTitle">\n';
  htmlItem +=                         '        <span class="itemNumber">' + item.number + '.</span>\n';
  htmlItem +=                         '        <a href="' + item.link + '">' + title + '</a>\n';
  htmlItem +=                         '      </h2>\n';
  if (item.description) { htmlItem += '      <div class="itemDescription">' + fixDescriptionTags(item.description) + ' </div>\n'; }
  htmlItem +=                         '      <div class="itemInfo">\n';
  if (item.category) { htmlItem +=    '        <div class="itemCat">[' + item.category + ']</div>\n'; }
  if (item.author) { htmlItem +=      '        Posted by ' + item.author + '<br/>\n'; }
  if (item.pubDate) { htmlItem +=     '        ' + item.pubDateText + '<br/>\n'; }
  htmlItem +=                         '      </div>\n';
  htmlItem +=                         '    </div>\n';
  return htmlItem;
}
//---------------------------------------------------------------------- 
function fixDescriptionTags(text) {
  if (!text.includes('<')) { return text; }
  let lastTtPos = text.lastIndexOf('<');
  let lastGtPos = text.lastIndexOf('>');
  if (lastTtPos > lastGtPos) {
    text = text.concat('>');
  }
  return text;
}
