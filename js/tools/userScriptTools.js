/*global Listener ListenerProviders LocalStorageManager*/
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
  }

  async runFeedTransformerScripts_async(url, feedText, scriptCallbacks) {
    let testMode = Boolean(scriptCallbacks);
    if (testMode) { await this._loadScriptInfos_async(); }
    let scriptObjTransformerMatchedList = this._scriptObjList.filter(
      so => so.type == scriptType.feedTransformer && so.enabled && this._isUrlMatch(so, url));
    for (let scriptObj of scriptObjTransformerMatchedList) {
      feedText = await this._runScript_async(scriptObj, feedText, scriptCallbacks);
    }
    return feedText;
  }

  _isUrlMatch(scriptObj, url) {
    let isUrlMatch = Boolean(url.match(scriptObj.urlRegEx) || url == scriptObj.urlMatch);
    return isUrlMatch;
  }

  async _loadScriptInfos_async() {
    this._scriptObjList = await LocalStorageManager.getValue_async(scriptListKey, null);
    for (let scriptId of this._scriptList) {
      let scriptObj = await LocalStorageManager.getValue_async(scriptObjKey + scriptId, null);
      if (scriptObj) {
        this._scriptObjList.push(scriptObj);
      }
    }

  }

  async downloadVirtualFeed_async(url, scriptCallbacks) {
    let scriptId = url.substring(scriptVirtualProtocol.length).trim();
    let scriptCode = await LocalStorageManager.getValue_async(scriptCodeKey + scriptId, null);
    if (scriptCode) {
      let feedText = null, scriptError = null;
      try {
        let virtualFeedScript = (new Function(scriptCode))();
        feedText = await virtualFeedScript();
      }
      catch (e) {
        scriptError = e;
      }
      if (scriptCallbacks) {
        if (scriptError) { if (scriptCallbacks.error) { scriptCallbacks.error(scriptError); } }
        else { if (scriptCallbacks.executed) { scriptCallbacks.executed(); } }
      }
      return feedText;
    }
  }

  async _runScript_async(scriptObj, feedText, scriptCallbacks) {
    let scriptCode = await LocalStorageManager.getValue_async(scriptCodeKey + scriptObj.id, null);
    if (scriptCode) {
      let feedTextUpdated = null;
      try {
        let userScriptFunction = new Function('__feedText__', scriptCode);
        feedTextUpdated = userScriptFunction(feedText);
        if (scriptCallbacks) { if (scriptCallbacks.executed) { scriptCallbacks.executed(); } }
      }
      catch (e) {
        if (scriptCallbacks) { if (scriptCallbacks.error) { scriptCallbacks.error(e); } }
      }
      feedText = feedTextUpdated || feedText;
    }
    return feedText;
  }


  async _updateScriptList_sbscrb(value) {
    this._scriptList = value;
    this._listenScriptObjListUpdate_async();
  }

  async _listenScriptObjListUpdate_async() {
    for (let scriptId of this._scriptList) {
      Listener.instance.subscribe(ListenerProviders.localStorage, scriptObjKey + scriptId, (v) => { this._updateScriptObjList_sbscrb(v); }, true);
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
