/*global DefaultValues DOMPurify*/
'use strict';

/**
 * Feed Sanitizer
 *
 * Thin wrapper around DOMPurify that applies the tag/attribute whitelist
 * defined in DefaultValues.allowedTagList. Used to scrub RSS/Atom content
 * (channel, items, descriptions, enclosures) before it is rendered.
 */
class FeedSanitizer { /*exported FeedSanitizer*/

  static _getConfig() {
    if (FeedSanitizer._cachedConfig) { return FeedSanitizer._cachedConfig; }

    var allowedTags = new Set();
    var allowedAttrs = new Set();
    var list = DefaultValues.allowedTagList;
    for (var i = 0; i < list.length; i++) {
      var entry = list[i];
      for (var key in entry) {
        if (!Object.prototype.hasOwnProperty.call(entry, key)) { continue; }
        var attrs = Array.isArray(entry[key]) ? entry[key] : [];
        if (key !== '*') { allowedTags.add(key.toLowerCase()); }
        for (var j = 0; j < attrs.length; j++) {
          allowedAttrs.add(String(attrs[j]).toLowerCase());
        }
      }
    }

    FeedSanitizer._cachedConfig = {
      ALLOWED_TAGS: Array.from(allowedTags),
      ALLOWED_ATTR: Array.from(allowedAttrs),
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[#/]|(?!(?:\w+):))/i,
      KEEP_CONTENT: true,
      IN_PLACE: false,
      WHOLE_DOCUMENT: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false
    };
    return FeedSanitizer._cachedConfig;
  }

  /**
   * Escape a string for safe inclusion as HTML text content.
   * Uses the DOM to guarantee correct entity encoding.
   */
  static sanitizeText(text) {
    if (typeof text !== 'string') { return ''; }
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Validate a URL against the safe-scheme allowlist.
   * Entities are decoded first so that an HTML-entity-encoded scheme
   * (e.g. &#x6A;avascript:) cannot slip through and rehydrate after the
   * output HTML is reparsed.
   *
   * @returns {string|null} The decoded URL when safe, otherwise null.
   */
  static sanitizeUrl(url) {
    if (typeof url !== 'string') { return null; }
    var trimmed = url.trim();
    if (!trimmed) { return ''; }
    if (trimmed === '#') { return trimmed; }

    // Decode HTML entities without building real DOM nodes (a <textarea>
    // is a raw-text element - setting innerHTML only decodes entities and
    // never parses child elements, so no image/script side effects fire).
    var ta = document.createElement('textarea');
    ta.innerHTML = trimmed;
    var decoded = (ta.value || '').trim();
    if (!decoded) { return ''; }

    // Normalize: remove all whitespace including Unicode variants and control characters
    var normalized = decoded.replace(/[\s\u0000-\u001f\u0080-\u009f\u2000-\u200b\u2028\u2029\u3000]+/g, '').toLowerCase();
    
    // Explicit blocklist of dangerous protocols (check first, before any URL parsing)
    var dangerousProtocols = [
      'javascript:', 'vbscript:', 'livescript:',
      'data:text/html', 'data:text/javascript', 'data:application/javascript', 'data:application/xhtml',
      'file://', 'ftp://', 'blob:', 'about:'
    ];
    for (var i = 0; i < dangerousProtocols.length; i++) {
      if (normalized.indexOf(dangerousProtocols[i]) === 0) {
        return null;
      }
    }

    // Allow only safe absolute protocols
    if (normalized.indexOf('http://') === 0 ||
        normalized.indexOf('https://') === 0 ||
        normalized.indexOf('mailto:') === 0) {
      return decoded;
    }

    // Allow relative URLs starting with /, #, ?, or .
    var first = decoded.charAt(0);
    if (first === '/' || first === '#' || first === '?' || first === '.') {
      return decoded;
    }

    // Final validation via URL constructor - only allow safe protocols
    try {
      var u = new URL(decoded, 'http://example.invalid/');
      var protocol = u.protocol.toLowerCase();
      if (protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:') {
        return decoded;
      }
    } catch (e) {
      // Invalid URL format - reject
      return null;
    }
    
    // Any other protocol is rejected
    return null;
  }

  /**
   * Sanitize an HTML fragment, keeping only whitelisted tags/attributes.
   */
  static sanitizeHtml(html) {
    if (typeof html !== 'string') { return ''; }
    return DOMPurify.sanitize(html, FeedSanitizer._getConfig());
  }

  /**
   * Sanitize a feed item, preserving non-string fields (id, number,
   * pubDate, text, etc.) untouched so downstream consumers - including
   * read-state tracking and pubDate rendering - continue to work.
   */
  static sanitizeFeedItem(item) {
    if (!item || typeof item !== 'object') { return null; }

    var sanitized = Object.assign({}, item);

    var textKeys = ['title', 'category', 'author', 'pubDateText'];
    for (var i = 0; i < textKeys.length; i++) {
      var tk = textKeys[i];
      if (typeof item[tk] === 'string') {
        sanitized[tk] = FeedSanitizer.sanitizeText(item[tk]);
      }
    }

    if (typeof item.description === 'string') {
      sanitized.description = FeedSanitizer.sanitizeHtml(item.description);
    }

    if ('link' in item) {
      sanitized.link = FeedSanitizer.sanitizeUrl(item.link) || '#';
    }
    if ('thumbnail' in item && item.thumbnail != null && item.thumbnail !== '') {
      sanitized.thumbnail = FeedSanitizer.sanitizeUrl(String(item.thumbnail)) || '';
    }

    if (item.enclosure && typeof item.enclosure === 'object') {
      var enc = Object.assign({}, item.enclosure);
      var encTextKeys = ['mimetype', 'type'];
      for (var k = 0; k < encTextKeys.length; k++) {
        var ek = encTextKeys[k];
        if (item.enclosure[ek] != null) {
          enc[ek] = FeedSanitizer.sanitizeText(String(item.enclosure[ek]));
        }
      }
      if ('url' in item.enclosure) {
        enc.url = FeedSanitizer.sanitizeUrl(item.enclosure.url) || '';
      }
      sanitized.enclosure = enc;
    }

    return sanitized;
  }

  /**
   * Sanitize an entire feedInfo object. The returned object always has a
   * channel property so downstream XML builders can safely read it.
   */
  static sanitizeFeedInfo(feedInfo) {
    if (!feedInfo || typeof feedInfo !== 'object') { return null; }

    var sanitized = Object.assign({}, feedInfo);

    var rawChannel = (feedInfo.channel && typeof feedInfo.channel === 'object')
      ? feedInfo.channel
      : DefaultValues.getDefaultChannelInfo();
    var channel = Object.assign({}, rawChannel);

    var channelTextKeys = ['title', 'category', 'pubDate', 'encoding'];
    for (var i = 0; i < channelTextKeys.length; i++) {
      var ck = channelTextKeys[i];
      if (typeof channel[ck] === 'string') {
        channel[ck] = FeedSanitizer.sanitizeText(channel[ck]);
      }
    }
    if (typeof channel.description === 'string') {
      channel.description = FeedSanitizer.sanitizeHtml(channel.description);
    }
    if ('link' in channel) {
      channel.link = FeedSanitizer.sanitizeUrl(channel.link) || '#';
    }
    sanitized.channel = channel;

    if (Array.isArray(feedInfo.itemList)) {
      var items = [];
      for (var j = 0; j < feedInfo.itemList.length; j++) {
        var s = FeedSanitizer.sanitizeFeedItem(feedInfo.itemList[j]);
        if (s !== null) { items.push(s); }
      }
      sanitized.itemList = items;
    } else {
      sanitized.itemList = [];
    }

    return sanitized;
  }
}

FeedSanitizer._cachedConfig = null;
