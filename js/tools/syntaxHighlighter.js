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
    text = text.replace(/&nbsp;/g, ' ');
    //replace 'span class' by 'span_reserved' to avoid confusion with the javascript keyword 'class'
    text = text.replace(/span class=/g, 'span_reserved=');
    //apply syntax highlighting
    this._pairPatternClassList.map( ptCl => {
      text = this._highlightMatches(text, ptCl);
    });
    //revert all plain text cleaning to get a html compliant text
    text = text.replace(/ /g, '&nbsp;');
    text = text.replace(/<span_reserved_\w="/g, '<span class="');
    return text;
  }

  _highlightMatches(text, ptCl) {
    let syntaxMatches = Array.from(new Set(text.match(new RegExp(ptCl.pattern))));
    let enclosingMark = ptCl.enclosing ? '_e' : '_n'; //_e : enclosure, _n : not enclosure
    let highlightingOffset = ('<span_reserved_x="' + ptCl.class + '"></span>').length;
    if (syntaxMatches) {
      //loop on all syntax matches
      syntaxMatches.map(syntaxMatch => {
        let enclosingFixed = syntaxMatch;
        //if it is a enclosing (comments or strings, ...) then remove all inner highlighted texts
        if (ptCl.enclosing) {
          enclosingFixed = enclosingFixed.replace(/<span_reserved_\w=".*?">/g, '');
          enclosingFixed = enclosingFixed.replace(/<\/span>/g, '');
        }
        /*
        Replace all syntax matches by highlighted text,
        but do it only if there not including in enclosing syntax (comments or strings, ...)
        */
        let parsed = '<span_reserved' + enclosingMark + '="' + ptCl.class + '">' + enclosingFixed + '</span>';
        let bound = (ptCl.enclosing ? '' : '\\b');
        let regex = new RegExp(bound + TextTools.escapeRegExp(syntaxMatch) + bound, 'g');
        let match = null;
        while ((match = regex.exec(text))) {
          if (!this.isIncludeInEnclosing(text, match.index)) {
            text = TextTools.replaceAt(text, syntaxMatch, parsed, match.index);
            regex.lastIndex += highlightingOffset;
          }
        }
      });
    }
    return text;
  }

  isIncludeInEnclosing(text, posPattern) {
    let posPrevEnclosingStart = text.lastIndexOf('span_reserved_e', posPattern);
    let posPrevEnclosingEnd = text.indexOf('</span>', posPrevEnclosingStart);
    let isIncludeInEnclosing = (posPattern > posPrevEnclosingStart && posPattern < posPrevEnclosingEnd) && !(posPrevEnclosingStart < 0 || posPrevEnclosingEnd < 0);
    return isIncludeInEnclosing;
  }

  async _loadSyntaxFile_async() {
    let syntaxFileUrl = browser.runtime.getURL(this._syntaxFilePath);
    let syntaxJson = await Transfer.downloadTextFile_async(syntaxFileUrl);
    let syntaxData = JSON.parse(syntaxJson);
    this._pairPatternClassList = SyntaxHighlighter.unStringifyPairPatternClassList(syntaxData.pairPatternClassList);
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
      pairPatternClassList.push({ pattern: regExpPattern, class: ptCl.class, enclosing: ptCl.enclosing == 'true' });
    }
    return pairPatternClassList;
  }

}