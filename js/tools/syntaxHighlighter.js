/* global TextTools*/
class SyntaxHighlighter { /*exported SyntaxHighlighter */
  constructor(pairKeywordsClassList) {
    this._pairKeywordsClassList = pairKeywordsClassList;
  }

  highlighText(text) {
    text = TextTools.replaceAll(text, '\n', '<br/>');
    text = TextTools.replaceAll(text, 'span class=', 'span_reserved=');
    for (let kwCl of this._pairKeywordsClassList) {
      text = this._highlighMatches(text, kwCl.keywords, kwCl.class);
    }
    text = TextTools.replaceAll(text, 'span_reserved=', 'span class=');
    return text;
  }

  _highlighMatches(text, regExString, cssClass) {
    let matches = text.match(regExString);
    if (matches) {
      for (let m of matches) {
        let parsed = '<span_reserved="' + cssClass + '">' + m + '</span>';
        text = TextTools.replaceAll(text, m, parsed);
      }
    }
    return text;
  }
}