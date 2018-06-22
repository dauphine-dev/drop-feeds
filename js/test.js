/* global USTools*/
'use strict';
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
function virtualFeedScriptTest() { /* exported virtualFeedScriptTest*/

  const _arteUrl = 'https://www.arte.tv/fr/guide/';
  //const _arteUrl = 'https://www.arte.tv/de/guide/';
  const _jsonStartPattern = 'window.__INITIAL_STATE__ = {';
  const _jsonEndPattern = '};';
  class ArteFeed {
    static get instance() { return (this._instance = this._instance || new this()); }

    async run() {
      return await this.getArteRssText();
    }

    async getArteRssText() {
      let channelTitle = 'ARTE+7';
      let channelLink = _arteUrl;
      let channelDescription = 'Le portail vidéo d&#x27;ARTE, où revoir les programmes d&#x27;ARTE gratuitement pendant 7 jours';
      let channelImage = 'https://static-cdn.arte.tv/guide/favicons/favicon-194x194.png';
      let rssText = USTools.rssHeader(channelTitle, channelLink, channelDescription, channelImage);

      let programList = await this.getProgramList();
      let itemPos = 0;
      for (let prog of programList) {
        let pictureUrl = prog.images.landscape.resolutions[prog.images.landscape.resolutions.length - 1].url;
        let img = '<a href="' + prog.url + '"><img src="' + pictureUrl + '" width="320"  height="180"></a><p/>';
        let description = img + prog.fullDescription;
        rssText += USTools.rssItem(prog.title, prog.url, prog.broadcastDates[0], description, itemPos++);
      }
      rssText += USTools.rssFooter();
      return rssText;
    }

    async getProgramList() {
      let arteHtml = await USTools.downloadTextFile(_arteUrl);
      let jsonText = '{' + USTools.getInnerText(arteHtml, _jsonStartPattern, _jsonEndPattern) + '}';
      let arteObj = JSON.parse(jsonText);

      let dayKey = Object.keys(arteObj.pages.list)[0];
      return arteObj.pages.list[dayKey].zones[1].data;
    }
  }
  //--------------------------------------------
  async function run() {
    return await ArteFeed.instance.run();
  }
  return run;

}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
function feedTransformerScriptTest() { /* exported feedTransformerScriptTest*/


  const _thumbnailStartPattern = '<media:thumbnail url="';
  const _thumbnailEndPattern = '"';
  const _idTagList = ['guid', 'id'];
  const _itemTagList = ['item', 'entry'];
  const _descTagList = ['content:encoded', 'description', 'content', 'summary', 'subtitle', 'media:description'];

  class YoutubeFeed {
    static get instance() { return (this._instance = this._instance || new this()); }

    run(feedText) {
      if (!feedText) return null;
      let itemTag = USTools.get1stUsedTag(feedText, _itemTagList);
      let itemNumber = USTools.occurrences(feedText, '</' + itemTag + '>');
      let itemText = USTools.getNextItem(feedText, '---', itemTag); // use a fake id to start
      for (let i = 0; i < itemNumber; i++) {
        let itemId = USTools.getItemId(itemText, _idTagList);
        let description = USTools.extractValue(itemText, _descTagList);
        let thumbnail = this.getItemThumbnail(itemText);
        feedText = feedText.split(description).join(thumbnail + '<p/>' + description);
        itemText = USTools.getNextItem(feedText, itemId, itemTag);
      }
      return feedText;
    }

    getItemThumbnail(itemText) {
      let thumbnail = USTools.getInnerText(itemText, _thumbnailStartPattern, _thumbnailEndPattern);
      thumbnail = thumbnail.split('hqdefault').join('mqdefault');
      let result = '<img src="' + thumbnail + '" width="320"  height="180">';
      return result;
    }

  }
  async function run(feedText) {
    return YoutubeFeed.instance.run(feedText);
  }

  return run;


}