/*global browser FeedRendererOptions ItemSorter Transfer TextTools ThemeManager BrowserManager*/
'use strict';

class FeedTransform { /*exported FeedTransform*/

  static async transformFeedToHtml_async(feedInfo, subscribeButtonTarget) {
    let xmlDoc = await FeedTransform._exportFeedToXml_async(feedInfo);
    let htmlText = await FeedTransform._transform_async(xmlDoc, feedInfo.isError, subscribeButtonTarget);
    return htmlText;
  }

  static async _exportFeedToXml_async(feedInfo, xsltUrl) {
    let feedXml = await FeedTransform._getFeedXml_async(feedInfo, xsltUrl);
    return feedXml;
  }

  static async _getFeedXml_async(feedInfo) {
    let iconUrl = browser.runtime.getURL(ThemeManager.instance.iconDF32Url);
    let subscribeButtonCssUrl = BrowserManager.getRuntimeUrl(ThemeManager.instance.getRenderSubscribeButtonCssUrl());
    let templateCssUrl = BrowserManager.getRuntimeUrl(await ThemeManager.instance.getRenderCssTemplateUrl_async(feedInfo.isError));
    let xsltUrl = BrowserManager.getRuntimeUrl(await ThemeManager.instance.getRenderXslTemplateUrl_async(feedInfo.isError));
    let themeUrl = BrowserManager.getRuntimeUrl(await ThemeManager.instance.getRenderCssUrl_async());
    let scriptUrl = BrowserManager.getRuntimeUrl(await ThemeManager.instance.getThemeResourceUrl_async(ThemeManager.instance.kinds.renderTemplate, 'js/template.js'));
    let description = (feedInfo.channel.description || '');
    let feedXml = '<?xml-stylesheet type="text/xsl" href= "' + xsltUrl + `" ?>
<render>
  <context>
    <icon><![CDATA[` + iconUrl + `]]></icon>
    <subscribeButtonStyle><![CDATA[` + subscribeButtonCssUrl + `]]></subscribeButtonStyle>
    <template><![CDATA[` + templateCssUrl + `]]></template>
    <theme><![CDATA[` + themeUrl + `]]></theme>
    <script><![CDATA[` + scriptUrl + `]]></script>
  </context>
  <channel>
    <title><![CDATA[` + FeedTransform._transformEncode((feedInfo.channel.title || '(no title)')) + `]]></title>
    <link><![CDATA[` + feedInfo.channel.link + `]]></link>
    <description>
      <![CDATA[` + FeedTransform._transformEncode(description) + `]]>
    </description>
    </channel>
  <items>`
      + FeedTransform._getItemsXmlFragments(feedInfo) + `
  </items>
</render>`;

    return feedXml;
  }

  static _getItemsXmlFragments(feedInfo) {
    feedInfo.itemList = ItemSorter.instance.sort(feedInfo.itemList);
    let itemsXmlFragments = '';
    for (let i = 0; i < feedInfo.itemList.length; i++) {
      itemsXmlFragments += FeedTransform._getItemXmlFragments(feedInfo.itemList[i], i + 1);
    }
    return itemsXmlFragments;
  }

  static _getItemXmlFragments(item, itemNumber) {
    let pubDateText = (item.pubDateText ? item.pubDateText : String.fromCharCode(160));
    let itemXmlFragments = '';
    itemXmlFragments = `
    <item>
      <number><![CDATA[` + (itemNumber ? itemNumber : item.number) + `]]></number>
      <title>` + FeedTransform._transformEncode(item.title) + `</title>
      <target><![CDATA[` + (FeedRendererOptions.instance.itemNewTab ? '_blank' : '') + `]]></target>
      <link><![CDATA[` + item.link + `]]></link>
      <description>
        <![CDATA[` + FeedTransform._transformEncode(item.description) + ']]>' + `
      </description>
      <category><![CDATA[` + item.category + `]]></category>
      <author><![CDATA[` + item.author + `]]></author>
      <pubDateText><![CDATA[` + pubDateText + `]]></pubDateText>
      <enclosures>
        <enclosure>
          <mimetype><![CDATA[` + (item.enclosure ? item.enclosure.mimetype : '') + `]]></mimetype>
          <link><![CDATA[` + (item.enclosure ? item.enclosure.url : '') + `]]></link>
        </enclosure>      
      </enclosures>
    </item>\n`;
    return itemXmlFragments;
  }

  static async _transform_async(xmlText, isError, subscribeButtonTarget) {
    let xslDocUrl = browser.runtime.getURL(await ThemeManager.instance.getRenderXslTemplateUrl_async(isError));
    let xslStylesheet = await Transfer.downloadXlsFile_async(xslDocUrl);
    let xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xslStylesheet);
    let oParser = new DOMParser();
    let xmlDoc = oParser.parseFromString(xmlText, 'application/xml');
    let htmlDoc = xsltProcessor.transformToDocument(xmlDoc);
    FeedTransform._decodeElements(htmlDoc);
    if (subscribeButtonTarget) { FeedTransform._addSubscribeButton(htmlDoc, subscribeButtonTarget); }
    let htmlText = htmlDoc.documentElement.outerHTML;
    return htmlText;
  }

  static _addSubscribeButton(doc, subscribeButtonTarget) {
    try {
      let subscribeButtonHtml = `
      <div id="dropFeeds_FeedHandler">
        <div id="rssLogo">
          <div>
            <label id="txtSubscribeUsing">#Subscribe to this feed using&nbsp;</label>
              <select id="handlersMenuList1">
                <option selected="true">Drop Feeds&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </option>
              </select>        
            <button id="subscribeNow">#Subscribe now</button>
          </div>
        </div>
      </div>
      `;
      let subscribeButton = document.createRange().createContextualFragment(subscribeButtonHtml);
      doc.body.prepend(subscribeButton);
      doc.getElementById('subscribeNow').setAttribute('target', subscribeButtonTarget);

      let scriptUrl = browser.extension.getURL('/js/ui/subscribeButton/subscribeButton.js');
      let subscribeButtonScriptHtml = '\r\n<script src="' + scriptUrl + '"></script>';
      let subscribeButtonScript = document.createRange().createContextualFragment(subscribeButtonScriptHtml);
      doc.body.append(subscribeButtonScript);

    }
    catch (e) { }
  }

  static _decodeElements(htmlDoc) {
    FeedTransform._decodeEncodedText(htmlDoc);
    FeedTransform._decodeEncodedHtml(htmlDoc);
  }

  static _decodeEncodedText(htmlDoc) {
    let element = htmlDoc.querySelector('.encodedText');
    while (element) {
      let decodedContent = FeedTransform._transformDecode(element.innerHTML);
      let unescapedContent = TextTools.unescapeHtml(decodedContent);
      let decodedElement = document.createTextNode(unescapedContent);
      element.parentNode.replaceChild(decodedElement, element);
      element = htmlDoc.querySelector('.encodedText');
    }
  }

  static _decodeEncodedHtml(htmlDoc) {
    let element = htmlDoc.querySelector('.encodedHtml');
    while (element) {
      let decodedHtml = FeedTransform._transformDecode(element.innerHTML);
      let decodedElement = document.createRange().createContextualFragment(decodedHtml);
      element.parentNode.replaceChild(decodedElement, element);
      element = htmlDoc.querySelector('.encodedHtml');
    }
  }


  static _transformEncode(decodedText) {
    /* Firefox doesn't manage disable-output-escaping="yes" during xslt transform
    then I have found this workaround about encoding character before translation 
    and decoding then after. Note: 1st I have tried to use base64 encoding but it 
    wasn't working for all characters then I made a simple encoding with character code */
    let encodedText = TextTools.toTextCharCodeArray(decodedText);
    return encodedText;
  }

  static _transformDecode(encodedText) {
    let decodedText = TextTools.fromTextCharCodeArray(encodedText);
    return decodedText;
  }
}
