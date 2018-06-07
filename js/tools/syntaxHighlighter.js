/* global TextTools Transfer browser*/
'use strict';
class SyntaxHighlighter { /*exported SyntaxHighlighter */
  constructor(syntaxFilePath) {
    this._pairPatternClassList = [];
    this._syntaxFilePath = syntaxFilePath;
  }

  async init_async() {
    await this._loadSyntaxFile_async();
  }

  highlightText(text) {
    text = TextTools.replaceAll(text, '&nbsp;', ' ');
    text = TextTools.replaceAll(text, '\n', '<br/>');
    text = TextTools.replaceAll(text, 'span class=', 'span_reserved=');
    for (let ptCl of this._pairPatternClassList) {
      text = this._highlightMatches(text, ptCl.pattern, ptCl.class);
    }
    text = TextTools.replaceAll(text, ' ', '&nbsp;');
    text = TextTools.replaceAll(text, 'span_reserved=', 'span class=');
    text = TextTools.replaceAll(text, '<br/>', '<br/>\n');

    return text;
  }

  _highlightMatches(text, regExp, cssClass) {
    let matches = text.match(regExp);
    if (matches) {
      for (let m of matches) {
        let parsed = '<span_reserved="' + cssClass + '">' + m + '</span>';
        text = TextTools.replaceAll(text, m, parsed);
      }
    }
    return text;
  }

  async _loadSyntaxFile_async() {
    let syntaxFileUrl = browser.extension.getURL(this._syntaxFilePath);
    let syntaxFileJsonText = await Transfer.downloadTextFile_async(syntaxFileUrl);
    let jsonSyntaxFile = JSON.parse(syntaxFileJsonText);
    this._pairPatternClassList = [];
    for (let ptCl of jsonSyntaxFile) {
      let regExpPattern = new RegExp(ptCl.pattern, 'g');
      this._pairPatternClassList.push({ pattern: regExpPattern, class: ptCl.class });
    }
  }

  static pairPatternClassListToJson(pairPatternClassList) {
    let pairPatternClassListFixed = [];
    for (let pairPatternClass of  pairPatternClassList) {
      pairPatternClassListFixed.push({pattern: pairPatternClass.pattern.source, class: pairPatternClass.class});
    }
    let json = JSON.stringify(pairPatternClassListFixed);
    /*eslint-disable no-console*/
    console.log('json:\n', json);
    /*eslint-enable no-console*/
  }

}