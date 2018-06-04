/* global BrowserManager TextTools*/
let _keywords1 = /\b(new|var|if|do|function|while|switch|for|foreach|in|continue|break)(?=[^\w])/g;
let _keywords2 = /\b(catch|class|const|debugger|default|delete|else|export|extends|finally|import|instanceof|return|super|this|throw|try|typeof|void|with|yield|async|await)(?=[^\w])/g;
let _keywords3 = /\b(document|window|Array|String|Object|Number|\$)(?=[^\w])/g;
let _commentsMultiLines = /(\/\*.*\*\/)/g;
let _commentInline = /(\/\/.*)/g;
let _strings = /'(.*?)'/g;

class SyntaxHighlighter { /*exported SyntaxHighlighter */

  static process() {
    let contentEditable = document.getElementById('contentEditable');
    let parsed = SyntaxHighlighter._parse(contentEditable.innerText);
    BrowserManager.setInnerHtmlByElement(contentEditable, parsed);


  }

  static _parse(text) {
    text = TextTools.replaceAll(text, '<br/>', '\n');
    text = TextTools.replaceAll(text, '\n', '<br/>');

    text = SyntaxHighlighter._highlighText(text, _keywords1, 'jsKeyword1');

    text = TextTools.replaceAll(text, 'span class=', 'span_reserved=');
    text = SyntaxHighlighter._highlighText(text, _keywords2, 'jsKeyword2');
    text = TextTools.replaceAll(text, 'span_reserved=', 'span class=');

    text = SyntaxHighlighter._highlighText(text, _keywords3, 'jsKeyword3');
    text = SyntaxHighlighter._highlighText(text, _commentsMultiLines, 'jsComment');


    text = SyntaxHighlighter._highlighText(text, _commentInline, 'jsComment');
    text = SyntaxHighlighter._highlighText(text, _strings, 'jsString');

    return text;
  }

  static _highlighText(text, regExString, cssClass) {
    let matches = text.match(regExString);
    if (matches) {
      for (let m of matches) {
        let parsed = '<span class="' + cssClass + '">' + m + '</span>';
        text = TextTools.replaceAll(text, m, parsed);
      }
    }
    return text;
  }
}