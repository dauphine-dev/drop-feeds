/* global browser*/
/*cSpell:ignore ACDT, ACST, AEDT, AEST,AKDT, AKST, AWST, AMST, AWDT, AZOST, BIOT, CEDT, CEST, CHADT, CHAS, CHAST, CHST, CIST, CLST */
/*cSpell:ignore EEDT, EEST, FKST, GALT, HADT, HAEC, IRKT, IRST, KRAT, LHST, MAGT,MEST, NZDT, NZST, OMST, PETT, PHOT, SAMT, SAST, TAHT */
'use strict';

class DateTime { /*exported DateTime*/
  static get timeZoneList () {
    return  {'ACDT':'GMT+10:30', 'ACST':'GMT+9:30', 'ADT':'GMT−3', 'AEDT':'GMT+11', 'AEST':'GMT+10', 'AFT':'GMT+4:30', 'AKDT':'GMT−8',
      'AKST':'GMT−9', 'AMST':'GMT+5', 'AMT':'GMT+4', 'ART':'GMT−3', 'AST':'GMT−4', 'AWDT':'GMT+9',
      'AWST':'GMT+8', 'AZOST':'GMT−1', 'AZT':'GMT+4', 'BDT':'GMT+8', 'BIOT':'GMT+6', 'BIT':'GMT−12', 'BOT':'GMT−4', 'BRT':'GMT−3',
      'BST':'GMT+1', 'BTT':'GMT+6', 'CAT':'GMT+2', 'CCT':'GMT+6:30', 'CDT':'GMT−5', 'CEDT':'GMT+2', 'CEST':'GMT+2', 'CET':'GMT+1', 'CHADT':'GMT+13:45',
      'CHAST':'GMT+12:45', 'CIST':'GMT−8', 'CKT':'GMT−10', 'CLST':'GMT−3', 'CLT':'GMT−4', 'COST':'GMT−4', 'COT':'GMT−5', 'CST':'GMT+8',
      'CT':'GMT+8', 'CVT':'GMT−1', 'CXT':'GMT+7', 'CHST':'GMT+10', 'DFT':'GMT+1', 'EAST':'GMT−6', 'EAT':'GMT+3', 'ECT':'GMT−4',
      'EDT':'GMT−4', 'EEDT':'GMT+3', 'EEST':'GMT+3', 'EET':'GMT+2', 'EST':'GMT−5', 'FJT':'GMT+12', 'FKST':'GMT−3', 'FKT':'GMT−4',
      'GALT':'GMT−6', 'GET':'GMT+4', 'GFT':'GMT−3', 'GILT':'GMT+12', 'GIT':'GMT−9', 'GMT':'GMT', 'GST':'GMT+4', 'GYT':'GMT−4',
      'HADT':'GMT−9', 'HAEC':'GMT+2', 'HAST':'GMT−10', 'HKT':'GMT+8', 'HMT':'GMT+5', 'HST':'GMT−10', 'ICT':'GMT+7', 'IDT':'GMT+3', 'IRKT':'GMT+8',
      'IRST':'GMT+3:30', 'IST':'GMT+2', 'JST':'GMT+9', 'KRAT':'GMT+7', 'KST':'GMT+9', 'LHST':'GMT+10:30', 'LINT':'GMT+14',
      'MAGT':'GMT+11', 'MDT':'GMT−6', 'MET':'GMT+1', 'MEST':'GMT+2', 'MIT':'GMT−9:30', 'MSD':'GMT+4', 'MSK':'GMT+3', 'MST':'GMT−7',
      'MUT':'GMT+4', 'MYT':'GMT+8', 'NDT':'GMT−2:30', 'NFT':'GMT+11:30', 'NPT':'GMT+5:45', 'NST':'GMT−3:30', 'NT':'GMT−3:30', 'NZDT':'GMT+13',
      'NZST':'GMT+12', 'OMST':'GMT+6', 'PDT':'GMT−7', 'PETT':'GMT+12', 'PHOT':'GMT+13', 'PKT':'GMT+5', 'PST':'GMT−8', 'RET':'GMT+4',
      'SAMT':'GMT+4', 'SAST':'GMT+2', 'SBT':'GMT+11', 'SCT':'GMT+4', 'SGT':'GMT+8', 'SLT':'GMT+5:30', 'SST':'GMT+8', 'TAHT':'GMT−10', 'THA':'GMT+7'
    };
  }

  static maxValue() {
    return new Date(9999, 12, 31, 23, 59, 59, 9999999);
  }

  static minValue() {
    return new Date(null);
  }

  static isValid(date) {
    let bOk = false;
    if ( Object.prototype.toString.call(date) === '[object Date]' ) {
      if ( ! isNaN( date.getTime() ) ) {
        bOk = true;
      }
    }
    return bOk;
  }

  static delay_async(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static timeZoneToGmt(dateTimeText) {
    for(let keyTz in DateTime.timeZoneList) {
      if (dateTimeText.endsWith(' ' + keyTz)) {
        dateTimeText = dateTimeText.replace(' ' + keyTz, ' ' + DateTime.timeZoneList[keyTz]);
        return dateTimeText;
      }
      if (dateTimeText.includes('(' + keyTz + ')')) {
        dateTimeText = dateTimeText.replace('(' + keyTz + ')', ' ' + DateTime.timeZoneList[keyTz] + ' ');
        return dateTimeText;
      }
    }
    return dateTimeText;
  }

  static getDateDiff(dateNew, dateOld) {
    let seconds = Math.floor((dateNew - dateOld) / 1000);

    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
      let plural =  browser.i18n.getMessage(interval>1 ? 'dtMany' : 'dtSingle');
      return browser.i18n.getMessage('dtYears', [interval, plural]);
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      let plural =  browser.i18n.getMessage(interval>1 ? 'dtMany' : 'dtSingle');
      return browser.i18n.getMessage('dtMonths', [interval, plural]);
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      let plural =  browser.i18n.getMessage(interval>1 ? 'dtMany' : 'dtSingle');
      return browser.i18n.getMessage('dtDays', [interval, plural]);
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      let plural =  browser.i18n.getMessage(interval>1 ? 'dtMany' : 'dtSingle');
      return browser.i18n.getMessage('dtHours', [interval, plural]);
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      let plural =  browser.i18n.getMessage(interval>1 ? 'dtMany' : 'dtSingle');
      return browser.i18n.getMessage('dtMinutes', [interval, plural]);
    }
    interval = Math.floor(seconds);
    let plural =  browser.i18n.getMessage(interval>1 ? 'dtMany' : 'dtSingle');
    return browser.i18n.getMessage('dtSeconds', [interval, plural]);
  }
}
