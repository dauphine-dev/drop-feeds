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
    //clean spaces
    text = TextTools.replaceAll(text, '&nbsp;', ' ');
    //replace 'span class' by 'span_reserved' to avoid confusion with the javascript keyword 'class'
    text = TextTools.replaceAll(text, 'span class=', 'span_reserved=');
    //apply syntax highlighting
    for (let ptCl of this._pairPatternClassList) {
      text = this._highlightMatches(text, ptCl);
    }
    //revert all plain text cleaning to get a html compliant text
    text = TextTools.replaceAll(text, ' ', '&nbsp;');
    text = text.replace(/<span_reserved(_e)?="/g, '<span class="');
    return text;
  }

  _highlightMatches(text, ptCl) {
    let syntaxMatches = text.match(new RegExp(ptCl.pattern));
    let enclosingMark = ptCl.enclosing ? '_e' : '';
    if (syntaxMatches) {
      //loop on all syntax matches
      syntaxMatches.map(syntaxMatch => {
        let enclosingFixed = syntaxMatch;
        //if it is a enclosing (comments or strings, ...) then remove all inner highlighted texts
        if (ptCl.enclosing) {
          enclosingFixed = enclosingFixed.replace(/<span_reserved(_e)?=".*?">/g, '');
          enclosingFixed = enclosingFixed.replace(/<\/span>/g, '');
        }

        /*
        Replace all syntax matches by highlighted text,
        but do it only if there not including in enclosing syntax (comments or strings, ...)
        */
        let parsed = '<span_reserved' + enclosingMark + '="' + ptCl.class + '">' + enclosingFixed + '</span>';
        let matches = text.match(new RegExp(TextTools.escapeRegExp(syntaxMatch, 'g')));
        matches.map(m => {
          if (!this.is1stOccurrenceIncludeInEnclosing(text, m)) {
            text = text.replace(m, parsed);
          }
        });
      });
    }
    return text;
  }

  is1stOccurrenceIncludeInEnclosing(text, pattern) {
    let posPattern = text.indexOf(pattern);
    let posPrevEnclosingStart = text.lastIndexOf('span_reserved_e', posPattern);
    let posPrevEnclosingEnd = text.indexOf('</span>', posPrevEnclosingStart);
    let isIncludeInEnclosing = (posPattern > posPrevEnclosingStart && posPattern < posPrevEnclosingEnd) && !(posPrevEnclosingStart < 0 || posPrevEnclosingEnd < 0);
    return isIncludeInEnclosing;
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
    for (let ptCl of pairPatternClassList) {
      pairPatternClassListStringified.push({ pattern: ptCl.pattern.source, class: ptCl.class, enclosing: ptCl.enclosing });
    }
    return pairPatternClassListStringified;
  }

  static unStringifyPairPatternClassList(pairPatternClassListStringified) {
    let pairPatternClassList = [];
    for (let ptCl of pairPatternClassListStringified) {
      let regExpPattern = new RegExp(ptCl.pattern, 'g');
      pairPatternClassList.push({ pattern: regExpPattern, class: ptCl.class, enclosing: Boolean(ptCl.enclosing) });
    }
    return pairPatternClassList;
  }

}