'use strict';


class CssManager { /*exported CssManager*/

  static _getSheetAndRuleIndex(styleName) {
    let sheetAndRuleIndex = null;
    let styleNameLower = styleName.toLowerCase();
    let styleNumber = document.styleSheets.length;
    for (let sheetIndex = 0; sheetIndex<styleNumber; sheetIndex++) {
      let cssRuleList = document.styleSheets[sheetIndex].cssRules;
      for(let ruleIndex=0; ruleIndex<cssRuleList.length; ruleIndex++) {
        if(cssRuleList[ruleIndex].selectorText.toLowerCase() == styleNameLower) {
          sheetAndRuleIndex = { sheetIndex:sheetIndex, ruleIndex:ruleIndex };
          break;
        }
      }
    }
    return sheetAndRuleIndex;
  }


  static replaceStyle(styleName, styleText) {
    let sheetAndRuleIndex = CssManager._getSheetAndRuleIndex(styleName);
    if (sheetAndRuleIndex == null) {
      /*eslint-disable no-console*/
      console.log('replaceStyle() styleName "' + styleName + '" not found!');
      /*eslint-enable no-console*/
      return;
    }
    let styleSheetList = document.styleSheets[sheetAndRuleIndex.sheetIndex];
    styleSheetList.deleteRule(sheetAndRuleIndex.ruleIndex);
    styleSheetList.insertRule(styleName + '{' + styleText + '}', styleSheetList.cssRules.length);
  }

  static getStyleText(styleName) {
    let sheetAndRuleIndex = CssManager._getSheetAndRuleIndex(styleName);
    if (sheetAndRuleIndex == null) {
      /*eslint-disable no-console*/
      console.log('getStyleText() styleName "' + styleName + '" not found!');
      /*eslint-enable no-console*/
      return '';
    }
    let cssRuleList = document.styleSheets[sheetAndRuleIndex.sheetIndex].cssRules;
    let style = cssRuleList[sheetAndRuleIndex.ruleIndex];
    return style.cssText;
  }
}
