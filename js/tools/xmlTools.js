/*eslint-disable quotes*/
'use strict';

class XmlTools { /*exported XmlTools*/
  static escapeTextXml(text) {
    let escapedText = text.replace(/&(?!amp;)/g, '%38')
      .replace(/</g, '%3c')
      .replace(/>/g, '%62')
      .replace(/"/g, '%22')
      .replace(/'/g, '%27');
    return escapedText;
  }

  static unescapeTextXml(text) {
    let unescapedText = text.replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')      
      .replace(/%38/g, "'")
      .replace(/%3c;/g, '"')
      .replace(/%62/g, '>')
      .replace(/%22/g, '<')
      .replace(/%27/g, '&');
    return unescapedText;
  }

  static unescapeTextAll(text) {
    return unescape(text);
  }

}