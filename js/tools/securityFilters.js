/* global Listener ListenerProviders DefaultValues LocalStorageManager TextTools*/
'use strict';
const _blackListHtmlTagsTopShow = [ {'blink': []}, {'marquee': []}];
class SecurityFilters { /* exported SecurityFilters*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._allowedHtmlTagList = DefaultValues.allowedTagList;
    this._rejectedCssFragmentList = DefaultValues.rejectedCssFragmentList;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'allowedHtmlElementsList', (v) => this._setAllowedHtmlElementsList_sbscrb(v), true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'rejectedCssFragmentList', (v) => this._setRejectedCssFragmentsList_sbscrb(v), true);
  }

  async init_async() {
    this._allowedHtmlTagList = await LocalStorageManager.getValue_async('allowedHtmlElementsList', DefaultValues.allowedTagList);
    this._rejectedCssFragmentList = await LocalStorageManager.getValue_async('rejectedCssFragmentList', DefaultValues.rejectedCssFragmentList);
  }

  async _setAllowedHtmlElementsList_sbscrb(value) {
    this._allowedHtmlTagList = value;
  }

  async _setRejectedCssFragmentsList_sbscrb(value) {
    this._rejectedCssFragmentList = value;
  }

  applySecurityFilters(text) {
    if (!text) { return; }
    // Perform basic sanitization of the HTML content to disable unwanted content
    // TODO: do a real sanitization code
    let hide = null;
    let blackListShow = _blackListHtmlTagsTopShow;
    this._allowedHtmlTagList.push({ '<!': [] }); // avoid to have manage comments for now (but we will have to do)
    let textTagList = [...new Set(text.toLowerCase().match(new RegExp('(<[^</])\\w*\\s*', 'g')) || [])].map(x => x.replace('<', '').trim());
    textTagList = textTagList.map(x => TextTools.escapeRegExp(x));
    let toBlackListTagList = [...new Set(textTagList.filter(x => !this._tagListIncludes(this._allowedHtmlTagList, x)) || [])];
    let toWhiteListTagList = [...new Set(textTagList.filter(x => this._tagListIncludes(this._allowedHtmlTagList, x)) || [])];
    let toBlackListAndShowTagList = [...new Set(toBlackListTagList.filter(x => this._tagListIncludes(blackListShow, x)))];
    let toBlackListAndHideTagList = [...new Set(toBlackListTagList.filter(x => !this._tagListIncludes(blackListShow, x)))];
    hide = false; text = this._disableTags(text, toBlackListAndShowTagList, hide);
    hide = true; text = this._disableTags(text, toBlackListAndHideTagList, hide);
    text = this._disableAttributes(text, toWhiteListTagList);
    text = this._applyInlineCssRejection(text, toWhiteListTagList);
    return text;
  }
  _tagListIncludes(tagList, x) {
    return (tagList.findIndex(e => Object.keys(e) == x)) >= 0;
  }

  _disableTags(text, tagToDisableList, hide) {
    for (let tag of tagToDisableList) {
      if (!tag) { continue; }
      text = text.replace(new RegExp('<' + tag, 'gi'), '<' + tag + '-blocked-by-dropfeeds' + (hide ? ' style="display:none"' : ''));
      text = text.replace(new RegExp('<\\s*/' + tag, 'gi'), '</' + tag + '-blocked-by-dropfeeds');
    }
    return text;
  }

  _disableAttributes(text, textTagList) {
    if (!textTagList) {return; }
    let textTagListWithAllowedAtt = [...new Set(textTagList.filter(x => {
      let tagObj = this._allowedHtmlTagList.find(y => Object.keys(y) == x);
      return (tagObj[x].length !=0);
    }))];

    for (let tag of textTagList) {
      if (!tag) { continue; }
      let regexExtractAtt = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gi;
      if (textTagListWithAllowedAtt.includes(tag)) {
        let allowedAttList = this._allowedHtmlTagList.find(x => Object.keys(x) == tag)[tag];
        let regexExtractTags = new RegExp('<' + tag + '\\b[^>]*>(.*?)', 'gi');
        let textTagWithAttList = text.match(regexExtractTags);
        if (!textTagWithAttList) { continue; }
        for (let tagWithAtt of textTagWithAttList) {
          let attList = tagWithAtt.match(regexExtractAtt);
          let cleanedTag = tagWithAtt;
          if (!attList) { continue; }
          for (let att of attList) {
            let attName = att.match(/([^=]*)=/i)[0].slice(0, -1);
            if (!allowedAttList.includes(attName)) {
              cleanedTag = cleanedTag.replace(att, '');
            }
            else if (attName.toLowerCase() == 'style')  {
              let cleanedAttStyle = this._applyInlineCssRejection(att);
              cleanedTag = cleanedTag.replace(att, cleanedAttStyle);
            }
          }
          text = text.replace(tagWithAtt, cleanedTag);
        }
      }
      else {
        text = text.replace(new RegExp('<' + tag + '\\b[^>]*>(.*?)', 'gi'), '<' + tag + '>');
      }
    }
    return text;
  }

  _applyInlineCssRejection(attStyle) {    
    let cleanedAttStyle = attStyle;
    this._rejectedCssFragmentList.map(filter => cleanedAttStyle = attStyle.replace(new RegExp(filter), ''));
    return cleanedAttStyle;    
  }

}