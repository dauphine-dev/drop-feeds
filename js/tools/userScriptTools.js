/*global BrowserManager Listener ListenerProviders LocalStorageManager*/
'use strict';
const scriptVirtualProtocol = 'dropfeeds://';
const scriptListKey = 'scriptList';
const scriptObjKey = 'scriptObj-';
const scriptCodeKey = 'scriptCode-';
const scriptType = {
  feedTransformer: 0,
  virtualFeed: 1
};

class UserScriptTools { /* exported UserScriptTools */
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._scriptList = [];
    this._scriptObjList = [];
  }

  async init_async() {
    await Listener.instance.subscribe(ListenerProviders.localStorage, scriptListKey, (v) => { this._updateScriptList_sbscrb(v); }, true);
    await this._loadScriptInfos_async();
  }

  async runFeedTransformerScripts_async(url, feedText, scriptData) {
    let testMode = Boolean(scriptData);
    let testId = undefined;
    if (testMode) {
      await this._loadScriptInfos_async();
      testId = scriptData.id;
    }
    let scriptObjTransformerMatchedList = this._scriptObjList.filter(
      so => so.type == scriptType.feedTransformer && (so.enabled || testId == so.id) && this._isUrlMatch(so, url));
    for (let scriptObj of scriptObjTransformerMatchedList) {
      feedText = await this._runScript_async(scriptObj, feedText, scriptData);
    }
    return feedText;
  }

  _isUrlMatch(scriptObj, url) {
    let isUrlMatch = Boolean(url.match(new RegExp(scriptObj.urlRegEx)) || url == scriptObj.urlMatch);
    return isUrlMatch;
  }

  async _loadScriptInfos_async() {
    this._scriptList = await LocalStorageManager.getValue_async(scriptListKey, null) || [];
    this._scriptObjList = [];
    for (let scriptId of this._scriptList) {
      let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + scriptId, null);
      if (scriptObj) {
        this._scriptObjList.push(scriptObj);
      }
    }
  }

  async downloadVirtualFeed_async(url, scriptData) {
    let testMode = Boolean(scriptData);
    let enabled = false;
    let testId = undefined;
    let scriptId = url.substring(scriptVirtualProtocol.length).trim();
    if (testMode) { testId = scriptData.id; }
    let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + scriptId, null);
    if (scriptObj) { enabled = scriptObj.enabled || scriptObj.id == testId; }
    if (!enabled) { return; }

    let scriptCode = await LocalStorageManager.getValue_async(scriptCodeKey + scriptId, null);
    if (scriptCode) {
      let feedText = null, scriptError = null;
      try {
        let virtualFeedScript = (BrowserManager.newFunction(scriptCode))();
        feedText = await virtualFeedScript();
      }
      catch (e) {
        scriptError = e;
      }
      if (scriptData) {
        if (scriptError) { if (scriptData.errorCallback) { scriptData.errorCallback(scriptError); } }
        else { if (scriptData.executedCallback) { scriptData.executedCallback(); } }
      }
      return feedText;
    }
  }

  async _runScript_async(scriptObj, feedText, scriptData) {
    let scriptCode = await LocalStorageManager.getValue_async(scriptCodeKey + scriptObj.id, null);
    if (scriptCode) {
      let feedTextUpdated = null, scriptError = null;
      try {
        let userScriptFunction = (BrowserManager.newFunction(scriptCode))();
        feedTextUpdated = await userScriptFunction(feedText);
      }
      catch (e) {
        scriptError = e;
      }
      if (scriptData) {
        if (scriptError) { if (scriptData.errorCallback) { scriptData.errorCallback(scriptError); } }
        else { if (scriptData.executedCallback) { scriptData.executedCallback(); } }
      }
      feedText = feedTextUpdated || feedText;
    }
    return feedText;
  }


  async _updateScriptList_sbscrb(value) {
    this._scriptList = value;
    await this._listenScriptObjListUpdate_async();
  }

  async _listenScriptObjListUpdate_async() {
    for (let scriptId of this._scriptList) {
      Listener.instance.subscribe(ListenerProviders.localStorage, scriptObjKey + scriptId, (v) => { this._updateScriptObjList_sbscrb(v); }, false);
    }
  }

  async _updateScriptObjList_sbscrb() {
    this._scriptObjList = [];
    for (let scriptId of this._scriptList) {
      let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + scriptId, null);
      if (scriptObj) {
        this._scriptObjList.push(scriptObj);
      }
    }
  }
}
