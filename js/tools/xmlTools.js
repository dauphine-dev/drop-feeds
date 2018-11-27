/*eslint-disable quotes*/
'use strict';

class XmlTools { /*exported XmlTools*/
  static escapeTextXml(text) {
    let escapedText = text
      .replace(/&(?!amp;)/g, '%26')
      .replace(/</g, '%3c')
      .replace(/>/g, '%3e')
      .replace(/"/g, '%22')
      .replace(/'/g, '%27');
    return escapedText;
  }

  static escapeUrlXml(text) {
    let escapedText = text
      .replace(/&(?!amp;)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    return escapedText;
  }

  static unescapeTextXml(text) {
    let unescapedText = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")

      .replace(/%26/g, '&')
      .replace(/%3c/g, '<')
      .replace(/%62/g, '>')
      .replace(/%22;/g, '"')
      .replace(/%27/g, "'");
    return unescapedText;
  }

  static unescapeTextAll(text) {
    return unescape(text);
  }

  static unescapeUrlXml(text) {
    return XmlTools.unescapeTextXml(text);
  }

}