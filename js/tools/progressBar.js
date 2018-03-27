'use strict';
class ProgressBar { /* exported ProgressBar*/
  constructor(progressBarId, noTextValue) {
    this._progressBarId = progressBarId;
    this._progressBarTotal = document.getElementById(this._progressBarId + 'Total');
    this._ProgressBar = document.getElementById(this._progressBarId);
    this._textValue = (noTextValue == null ?  true : ! noTextValue);
  }

  show() {
    this._progressBarTotal.style.display = 'block';
    this._ProgressBar.style.display = 'block';
  }

  hide() {
    this._progressBarTotal.style.display = 'none';
    this._ProgressBar.style.display = 'none';
  }

  set value(value) {
    this._ProgressBar.style.width = value + '%';
    if (this._textValue) {
      this._ProgressBar.innerText = value + '%';
    }
  }

  set text(text) {
    this._progressBarTotal.style.display = 'block';
    this._ProgressBar.style.display = 'block';
    this._ProgressBar.style.width = '100%';
    this._ProgressBar.innerText = text;
  }
}
