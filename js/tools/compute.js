'use strict';
class Compute { /* exported Compute*/
  static hashCode(text) {
    let hash = null;
    if (!text || text.length == 0) {
      return hash;
    }
    hash = 0;
    for (let i = 0; i < text.length; i++) {
      let char = text.charCodeAt(i);
      hash = ((hash<<5)-hash)+char;
      hash = hash & hash;
    }
    if (hash < 0) { hash = 0xFFFFFFFF + hash + 1; }
    hash = hash.toString(16);
    return hash;
  }
}
