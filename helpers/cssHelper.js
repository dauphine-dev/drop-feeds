'use strict';
//----------------------------------------------------------------------
function getSheetAndRuleIndex(styleName) {
  let styleNameLower = styleName.toLowerCase();
  let styleNumber = document.styleSheets.length;
  for (let sheetIndex = 0; sheetIndex<styleNumber; sheetIndex++) {
    let cssRuleList = document.styleSheets[sheetIndex].cssRules;
    for(let ruleIndex=0; ruleIndex<cssRuleList.length; ruleIndex++) {
      if(cssRuleList[ruleIndex].selectorText.toLowerCase() == styleNameLower) {
        return { sheetIndex:sheetIndex, ruleIndex:ruleIndex };
      }
    } 
  }
  return null;
}
//---------------------------------------------------------------------- 
function replaceStyle(styleName, styleText) {
  let sheetAndRuleIndex = getSheetAndRuleIndex(styleName);
  if (sheetAndRuleIndex==null) { 
    console.log('replaceStyle() styleName "' + styleName + '" not found!');
    return; 
  }
  let styleSheetList = document.styleSheets[sheetAndRuleIndex.sheetIndex];
  styleSheetList.deleteRule(sheetAndRuleIndex.ruleIndex);
  styleSheetList.insertRule(styleName + '{' + styleText + '}', styleSheetList.cssRules.length);
}
//---------------------------------------------------------------------- 
function getStyleText(styleName) {
  let sheetAndRuleIndex = getSheetAndRuleIndex(styleName);
  if (sheetAndRuleIndex==null) { 
    console.log('getStyleText() styleName "' + styleName + '" not found!');
    return ''; 
  }
  let styleSheetList = document.styleSheets[sheetAndRuleIndex.sheetIndex];
  let cssRuleList = document.styleSheets[sheetAndRuleIndex.sheetIndex].cssRules;
  let style = cssRuleList[sheetAndRuleIndex.ruleIndex];
  return style.cssText;
}
//----------------------------------------------------------------------
