/*global browser*/
'use strict';
//----------------------------------------------------------------------
function showProgressBar(progressBarId) {
  let progressBarTotal = document.getElementById(progressBarId + 'Total');
  let progressBar = document.getElementById(progressBarId);
  progressBarTotal.style.display = ' block';
  progressBar.style.display = ' block';
}
//----------------------------------------------------------------------
function hideProgressBar(progressBarId) {
  let progressBarTotal = document.getElementById(progressBarId + 'Total');
  let progressBar = document.getElementById(progressBarId);
  progressBarTotal.style.display = 'none';
  progressBar.style.display = 'none';
}
//----------------------------------------------------------------------
function setProgressBarValue(progressBarId, value) {
  let progressBar = document.getElementById(progressBarId);
  progressBar.style.width = value + '%';
  progressBar.innerText = value + '%';
}
//----------------------------------------------------------------------
function showMsgInProgressBar(progressBarId, message) {
  let progressBarTotal = document.getElementById(progressBarId + 'Total');
  let progressBar = document.getElementById(progressBarId);
  progressBarTotal.style.display = ' block';
  progressBar.style.display = ' block';
  progressBar.style.width = '100%';
  progressBar.innerText = message;
}
//----------------------------------------------------------------------
