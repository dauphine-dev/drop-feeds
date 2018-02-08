/*jshint -W097, esversion: 6, devel: true, nomen: true, indent: 2, maxerr: 50 , browser: true, bitwise: true*/ /*jslint plusplus: true */
/*global  browser*/
"use strict";
browser.runtime.onMessage.addListener(runtimeOnMessageEvent);
//----------------------------------------------------------------------
function runtimeOnMessageEvent(request) {
  let response = null;
  switch (request.req) {
    case 'isFeed':
      response = isFeed();
      break;
    case 'addSubscribeButton':
      addSubscribeButton();
      break;
  }
  return Promise.resolve(response);
}
//----------------------------------------------------------------------
function isFeed() {
  let feedHandler = null;
  try {
    feedHandler = document.getElementById('feedHandler').innerHTML;
  }
  catch(e) {}
  let result = (feedHandler ? true : false);
  return result;
}
//----------------------------------------------------------------------
function addSubscribeButton() {
  if (!document.getElementById('subscribeWithDropFeedsButton')) {
    let feedSubscribeLine = document.getElementById('feedSubscribeLine');
    let subscribeButton = document.createElement('button');
    subscribeButton.id = 'subscribeWithDropFeedsButton';
    subscribeButton.innerText = 'Subscribe with Drop feeds';
    subscribeButton.style.display = 'block';
    subscribeButton.style.marginInlineStart = 'auto';
    subscribeButton.style.marginTop = '0.5em';
    subscribeButton.addEventListener('click', addSubscribeButtonOnClickEvent);
    feedSubscribeLine.appendChild(subscribeButton);
  }
}
//----------------------------------------------------------------------
async function addSubscribeButtonOnClickEvent(event) {
  event.stopPropagation();
  event.preventDefault();
  browser.runtime.sendMessage({'req':'openSubscribeDialog'});
}
//----------------------------------------------------------------------
