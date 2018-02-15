//----------------------------------------------------------------------
String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length == 0) {
    return hash;
  }
  for (var i = 0; i < this.length; i++) {
    let char = this.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  if (hash < 0) { hash = 0xFFFFFFFF + hash + 1; }
  hash = hash.toString(16);
  return hash;
};
//----------------------------------------------------------------------
