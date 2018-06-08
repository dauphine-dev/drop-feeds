/* global browser TextTools Transfer*/
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
    let syntaxJson = await Transfer.downloadTextFile_async(syntaxFileUrl);
    let syntaxData = JSON.parse(syntaxJson);
    this._loadSyntaxCss(syntaxData.cssPath);
    this._pairPatternClassList = SyntaxHighlighter.unStringifyPairPatternClassList(syntaxData.pairPatternClassList);
  }

  _loadSyntaxCss(cssSyntaxPath) {
    let jsHighlightCss = document.createElement('link');
    jsHighlightCss.setAttribute('href', cssSyntaxPath);
    jsHighlightCss.setAttribute('rel', 'stylesheet');
    jsHighlightCss.setAttribute('type', 'text/css');
    document.head.appendChild(jsHighlightCss);
  }

  static stringifyPairPatternClassList(pairPatternClassList) {
    let pairPatternClassListStringified = [];
    for (let pairPatternClass of pairPatternClassList) {
      pairPatternClassListStringified.push({ pattern: pairPatternClass.pattern.source, class: pairPatternClass.class });
    }
    return pairPatternClassListStringified;
  }

  static unStringifyPairPatternClassList(pairPatternClassListStringified) {
    let pairPatternClassList = [];
    for (let ptCl of pairPatternClassListStringified) {
      let regExpPattern = new RegExp(ptCl.pattern, 'g');
      pairPatternClassList.push({ pattern: regExpPattern, class: ptCl.class });
    }
    return pairPatternClassList;
  }

}