/*global browser*/
'use strict';

/**
 * MurmurHash3 (32-bit) implementation for consistent hashing
 *
 * @param {string} key - Key to hash
 * @param {number} seed - Seed value for the hash function
 * @returns {number} Unsigned 32-bit hash value
 */
function murmurHash3(key, seed) { /*exported murmurHash3*/
  const remainder = key.length & 3;
  const bytes = key.length - remainder;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  let h1 = seed;
  let i = 0;

  for (; i < bytes; i += 4) {
    let k1 = (key.charCodeAt(i) & 0xff) |
             ((key.charCodeAt(i + 1) & 0xff) << 8) |
             ((key.charCodeAt(i + 2) & 0xff) << 16) |
             ((key.charCodeAt(i + 3) & 0xff) << 24);

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = (Math.imul(h1, 5) + 0xe6546b64) | 0;
  }

  let k1 = 0;
  switch (remainder) {
    /* falls through */
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    /* falls through */
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    /* falls through */
    case 1:
      k1 ^= (key.charCodeAt(i) & 0xff);
      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);
      h1 ^= k1;
  }

  h1 ^= key.length;

  // fmix32
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}
