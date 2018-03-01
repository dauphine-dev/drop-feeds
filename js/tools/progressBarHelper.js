'use strict';
class progressBar { /* exported progressBar*/
  constructor(progressBarId) {
    this.progressBarId = progressBarId;
    this.progressBarTotal = document.getElementById(this.progressBarId + 'Total');
    this.progressBar = document.getElementById(this.progressBarId);
    this.setValue(0);
  }

  show() {
    this.progressBarTotal.style.display = ' block';
    this.progressBar.style.display = ' block';
  }

  hide() {
    this.progressBarTotal.style.display = 'none';
    this.progressBar.style.display = 'none';
  }

  set value(value) {
    this.progressBar.style.width = value + '%';
    this.progressBar.innerText = value + '%';
  }

  set text(text) {
    this.progressBarTotal.style.display = ' block';
    this.progressBar.style.display = ' block';
    this.progressBar.style.width = '100%';
    this.progressBar.innerText = text;
  }
}
