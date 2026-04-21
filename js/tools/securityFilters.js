/* global Listener ListenerProviders DefaultValues TextTools WorkerReplace scriptListKey*/
'use strict';
const _blackListHtmlTagsTopShow = [{ 'blink': [] }, { 'marquee': [] }];
class SecurityFilters { /* exported SecurityFilters*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._allowedHtmlTagList = DefaultValues.allowedTagList;
    this._rejectedCssFragmentList = DefaultValues.rejectedCssFragmentList;
    // The `_dp` tag-suffix bypass is a user-script feature. Keep it gated on
    // the presence of at least one user script so a feed can't smuggle
    // `<iframe_dp>` (or similar) through the filter on installs that don't
    // use scripts at all.
    this._hasUserScripts = false;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'allowedHtmlElementsList', (v) => this._setAllowedHtmlElementsList_sbscrb(v), true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'rejectedCssFragmentList', (v) => this._setRejectedCssFragmentsList_sbscrb(v), true);
    Listener.instance.subscribe(ListenerProviders.localStorage, scriptListKey, (v) => this._setHasUserScripts_sbscrb(v), true);
    this._wkRplc = new WorkerReplace(20);
    this._wkRplc.init_async();
  }

  async _setAllowedHtmlElementsList_sbscrb(value) {
    this._allowedHtmlTagList = value;
  }

  async _setRejectedCssFragmentsList_sbscrb(value) {
    this._rejectedCssFragmentList = value;
  }

  async _setHasUserScripts_sbscrb(value) {
    this._hasUserScripts = Array.isArray(value) && value.length > 0;
  }

  async applySecurityFilters_async(text) {
    if (!text) { return; }
    let hide = null;
    const blackListShow = _blackListHtmlTagsTopShow;
    this._allowedHtmlTagList.push({ '<!': [] }); // avoid to have manage comments for now (but we will have to do)
    let textTagList = [...new Set(text.toLowerCase().match(new RegExp('(<[^</])\\w*\\s*', 'g')) || [])].map(x => x.replace('<', '').trim());
    textTagList = textTagList.map(x => TextTools.escapeRegExp(x));
    const allowedFromUserScriptsTagList = this._hasUserScripts
      ? textTagList.filter(tag => tag.endsWith('_dp')).map(tag => ({ [tag]: '*' }))
      : [];

    let toBlackListTagList = [...new Set(textTagList.filter(x =>
      !this._tagListIncludes(this._allowedHtmlTagList, x) && !this._tagListIncludes(allowedFromUserScriptsTagList, x)
    ) || [])];
    const toBlackListAndShowTagList = [...new Set(toBlackListTagList.filter(x => this._tagListIncludes(blackListShow, x)))];
    const toBlackListAndHideTagList = [...new Set(toBlackListTagList.filter(x => !this._tagListIncludes(blackListShow, x)))];
    hide = false; text = await this._disableTags_async(text, toBlackListAndShowTagList, hide);
    hide = true; text = await this._disableTags_async(text, toBlackListAndHideTagList, hide);

    const toWhiteListTagList = [...new Set(textTagList.filter(x => this._tagListIncludes(this._allowedHtmlTagList, x)) || [])];
    text = await this._fixAllowedTagsFromUserScript(text, allowedFromUserScriptsTagList);
    text = await this._disableAttributes_async(text, toWhiteListTagList);
    text = await this._applyInlineCssRejection_async(text, toWhiteListTagList);
    return text;
  }

  async _fixAllowedTagsFromUserScript(text, allowedFromUserScriptsTagList) {
    for (let tagEntry of allowedFromUserScriptsTagList) {
      const tag = Object.keys(tagEntry)[0];
      text = await this._wkRplc.replace_async(text, new RegExp('<' + tag, 'gi'), '<' + tag.slice(0, -3));
      text = await this._wkRplc.replace_async(text, new RegExp('<\\s*/' + tag, 'gi'), '</' + tag.slice(0, -3));
    }
    return text;
  }

  _tagListIncludes(tagList, x) {
    return (tagList.findIndex(e => Object.keys(e) == x)) >= 0;
  }

  async _disableTags_async(text, tagToDisableList, hide) {
    //use worker to try to avoid message "Warning: Unresponsive script."
    for (let tag of tagToDisableList) {
      if (!tag) { continue; }
      const blockedStartTag = '<' + tag + '-blocked-by-dropfeeds' + (hide ? ' style="display:none"' : '');
      const blockedEndTag = '</' + tag + '-blocked-by-dropfeeds';
      text = await this._wkRplc.replace_async(text, new RegExp('<' + tag, 'gi'), blockedStartTag);
      text = await this._wkRplc.replace_async(text, new RegExp('<\\s*/' + tag, 'gi'), blockedEndTag);
    }
    return text;
  }

  async _disableAttributes_async(text, textTagList) {
    if (!textTagList) { return; }
    let textTagListWithAllowedAtt = [...new Set(textTagList.filter(x => {
      let tagObj = this._allowedHtmlTagList.find(y => Object.keys(y) == x);
      return (tagObj[x].length != 0);
    }))];
    for (let tag of textTagList) {
      if (!tag) { continue; }
      // Match one attribute: name, optional '=' with quoted or unquoted value.
      // Quoted values accept any char except their own delimiter, so internal
      // spaces / commas / '=' (e.g. in srcset or JSON-in-data-* attrs) are
      // preserved instead of being mistaken for the next attribute boundary.
      let regexExtractAtt = /([a-zA-Z_:][\w:.-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
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
            else if (attName.toLowerCase() == 'style') {
              let cleanedAttStyle = await this._applyInlineCssRejection_async(att);
              cleanedTag = cleanedTag.replace(att, cleanedAttStyle);
            }
          }
          text = text.replace(tagWithAtt, cleanedTag);
        }
      }
      else {
        //use worker to try to avoid message "Warning: Unresponsive script."
        text = await this._wkRplc.replace_async(text, new RegExp('<' + tag + '\\b[^>]*>(.*?)', 'gi'), '<' + tag + '>');
      }
    }
    return text;
  }

  async _applyInlineCssRejection_async(attStyle) {
    let cleanedAttStyle = attStyle;
    //use worker to try to avoid message "Warning: Unresponsive script." (to test set dom.max_script_run_time to 1)
    await this._rejectedCssFragmentList.map(async filter => cleanedAttStyle = await this._wkRplc.replace_async(attStyle, new RegExp(filter), ''));

    return cleanedAttStyle;
  }

}