/* global TextTools*/
'use strict';
class SyntaxHighlighter { /*exported SyntaxHighlighter */
  constructor(pairPatternClassList) {
    /*
    pairPatternClassList = [
      { pattern: /\b(foo1|bar1|...)(?=[^\w])/g, class: 'class1' },
      { pattern: /\b(foo2|bar2|...)(?=[^\w])/g, class: 'class2' },
      ...
    ];
    */
    this._pairPatternClassList = pairPatternClassList;
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

  _highlightMatches(text, regExString, cssClass) {
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