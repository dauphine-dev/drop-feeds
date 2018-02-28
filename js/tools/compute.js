'use strict';
//----------------------------------------------------------------------
class compute {
  static hashCode(text) {
    let hash = 0;
    if (text.length == 0) {
      return hash;
    }
    for (var i = 0; i < text.length; i++) {
      let char = text.charCodeAt(i);
      hash = ((hash<<5)-hash)+char;
      hash = hash & hash;
    }
    if (hash < 0) { hash = 0xFFFFFFFF + hash + 1; }
    hash = hash.toString(16);
    return hash;
  }
}
//----------------------------------------------------------------------
