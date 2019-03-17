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
      console.error('replaceStyle() styleName "' + styleName + '" not found!');
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
      console.error('getStyleText() styleName "' + styleName + '" not found!');
      /*eslint-enable no-console*/
      return '';
    }
    let cssRuleList = document.styleSheets[sheetAndRuleIndex.sheetIndex].cssRules;
    let style = cssRuleList[sheetAndRuleIndex.ruleIndex];
    return style.cssText;
  }

  static setElementEnableById(elementId, enabled) {
    if (enabled) {
      CssManager.enableElementById(elementId);
    }
    else {
      CssManager.disableElementById(elementId);
    }
  }
  
  static setElementEnableByIdEx(elementId, textId, enabled) {
    document.getElementById(elementId).disabled = !enabled;
    CssManager.setElementEnableById(elementId, enabled);
    if (textId) { CssManager.setElementEnableById(textId, enabled); }
  }

  static enableElementById(elementId) {
    CssManager.enableElement(document.getElementById(elementId));
  }

  static enableElement(element) {
    element.style.opacity = '';
    element.style.filter = '';
  }

  static disableElementById(elementId) {
    CssManager.disableElement(document.getElementById(elementId));
  }

  static disableElement(element) {
    element.style.opacity = '0.66';
    element.style.filter = 'grayscale(100%)';
  }

}
