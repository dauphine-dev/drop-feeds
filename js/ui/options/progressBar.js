'use strict';
class ProgressBar { /* exported ProgressBar*/
  constructor(progressBarId) {
    this.progressBarId = progressBarId;
    this.progressBarTotal = document.getElementById(this.progressBarId + 'Total');
    this.ProgressBar = document.getElementById(this.progressBarId);
  }

  show() {
    this.progressBarTotal.style.display = ' block';
    this.ProgressBar.style.display = ' block';
  }

  hide() {
    this.progressBarTotal.style.display = 'none';
    this.ProgressBar.style.display = 'none';
  }

  set value(value) {
    this.ProgressBar.style.width = value + '%';
    this.ProgressBar.innerText = value + '%';
  }

  set text(text) {
    this.progressBarTotal.style.display = ' block';
    this.ProgressBar.style.display = ' block';
    this.ProgressBar.style.width = '100%';
    this.ProgressBar.innerText = text;
  }
}
