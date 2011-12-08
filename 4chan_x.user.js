// ==UserScript==
// @name           4chan x
// @namespace      aeosynth
// @description    Adds various features.
// @copyright      2009-2011 James Campos <james.r.campos@gmail.com>
// @license        MIT; http://en.wikipedia.org/wiki/Mit_license
// @include        http://boards.4chan.org/*
// @include        http://sys.4chan.org/*
// @run-at         document-start
// @icon           https://raw.github.com/aeosynth/4chan-x/gh-pages/favicon.png
// ==/UserScript==

/* LICENSE
 *
 * Copyright (c) 2009-2011 James Campos <james.r.campos@gmail.com>
 * http://aeosynth.github.com/4chan-x/
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/* HACKING
 *
 * 4chan x is written in CoffeeScript[1], and developed on github[2].
 *
 * [1]: http://jashkenas.github.com/coffee-script/
 * [2]: http://github.com/aeosynth/4chan-x
 */

/* CONTRIBUTORS
 *
 * Zixaphir - fix qr textarea - captcha-image gap
 * Mayhem - various features / fixes
 * Ongpot - sfw favicon
 * thisisanon - nsfw + 404 favicons
 * Anonymous - empty favicon
 * Seiba - chrome quick reply focusing
 * herpaderpderp - recaptcha fixes
 * wakimoko - recaptcha tab order http://userscripts.org/scripts/show/82657
 * xat- new favicons
 *
 * All the people who've taken the time to write bug reports.
 *
 * Thank you.
 */

(function() {
  var $, $$, DAY, Favicon, HOUR, MINUTE, Main, NAMESPACE, Post, SECOND, Time, anonymize, conf, config, d, expandComment, expandThread, filter, firstRun, flatten, g, getTitle, imgExpand, imgGif, imgHover, imgPreloading, key, keybinds, log, nav, options, quoteBacklink, quoteInline, quoteOP, quotePreview, redirect, replyHiding, reportButton, revealSpoilers, sauce, strikethroughQuotes, threadHiding, threadStats, threading, titlePost, ui, unread, updater, val, watcher;
  var __slice = Array.prototype.slice;

  config = {
    main: {
      Enhancing: {
        '404 Redirect': [true, 'Redirect dead threads'],
        'Keybinds': [true, 'Binds actions to keys'],
        'Time Formatting': [true, 'Arbitrarily formatted timestamps, using your local time'],
        'Report Button': [true, 'Add report buttons'],
        'Comment Expansion': [true, 'Expand too long comments'],
        'Thread Expansion': [true, 'View all replies'],
        'Index Navigation': [true, 'Navigate to previous / next thread'],
        'Reply Navigation': [false, 'Navigate to top / bottom of thread']
      },
      Filtering: {
        'Anonymize': [false, 'Make everybody anonymous'],
        'Filter': [false, 'Self-moderation placebo'],
        'Filter OPs': [false, 'Filter OPs along with their threads'],
        'Reply Hiding': [true, 'Hide single replies'],
        'Thread Hiding': [true, 'Hide entire threads'],
        'Show Stubs': [true, 'Of hidden threads / replies']
      },
      Imaging: {
        'Image Auto-Gif': [false, 'Animate gif thumbnails'],
        'Image Expansion': [true, 'Expand images'],
        'Image Hover': [false, 'Show full image on mouseover'],
        'Image Preloading': [false, 'Preload Images'],
        'Sauce': [true, 'Add sauce to images'],
        'Reveal Spoilers': [false, 'Replace spoiler thumbnails by the original thumbnail']
      },
      Monitoring: {
        'Thread Updater': [true, 'Update threads. Has more options in its own dialog.'],
        'Unread Count': [true, 'Show unread post count in tab title'],
        'Post in Title': [true, 'Show the op\'s post in the tab title'],
        'Thread Stats': [true, 'Display reply and image count'],
        'Thread Watcher': [true, 'Bookmark threads'],
        'Auto Watch': [true, 'Automatically watch threads that you start'],
        'Auto Watch Reply': [false, 'Automatically watch threads that you reply to']
      },
      Posting: {
        'Character Count': [false, 'Prevent "Error: Field too long." errors'],
        'Cooldown': [true, 'Prevent `flood detected` errors'],
        'Quick Reply': [true, 'Reply without leaving the page'],
        'Persistent QR': [false, 'Quick reply won\'t disappear after posting. Only in replies.'],
        'Auto Hide QR': [true, 'Automatically auto-hide the quick reply when posting'],
        'Remember Spoiler': [false, 'Remember the spoiler state, instead of resetting after posting']
      },
      Quoting: {
        'Quote Backlinks': [true, 'Add quote backlinks'],
        'OP Backlinks': [false, 'Add backlinks to the OP'],
        'Quote Highlighting': [true, 'Highlight the previewed post'],
        'Quote Inline': [true, 'Show quoted post inline on quote click'],
        'Quote Preview': [true, 'Show quote content on hover'],
        'Indicate OP quote': [true, 'Add \'(OP)\' to OP quotes']
      }
    },
    filter: {
      name: '',
      tripcode: '',
      email: '',
      subject: '',
      comment: '',
      filename: '',
      filesize: '',
      md5: ''
    },
    flavors: ['http://iqdb.org/?url=', 'http://google.com/searchbyimage?image_url=', '#http://tineye.com/search?url=', '#http://saucenao.com/search.php?db=999&url=', '#http://imgur.com/upload?url='].join('\n'),
    time: '%m/%d/%y(%a)%H:%M',
    backlink: '>>%id',
    hotkeys: {
      close: 'Esc',
      spoiler: 'ctrl+s',
      openQR: 'i',
      openEmptyQR: 'I',
      submit: 'alt+s',
      nextReply: 'J',
      previousReply: 'K',
      nextThread: 'n',
      previousThread: 'p',
      nextPage: 'L',
      previousPage: 'H',
      zero: '0',
      openThreadTab: 'o',
      openThread: 'O',
      expandThread: 'e',
      watch: 'w',
      hide: 'x',
      expandImages: 'm',
      expandAllImages: 'M',
      update: 'u',
      unreadCountTo0: 'z'
    },
    updater: {
      checkbox: {
        'Scrolling': [false, 'Scroll updated posts into view. Only enabled at bottom of page.'],
        'Scroll BG': [false, 'Scroll background tabs'],
        'Verbose': [true, 'Show countdown timer, new post count'],
        'Auto Update': [true, 'Automatically fetch new posts']
      },
      'Interval': 30
    }
  };

  if (typeof console !== "undefined" && console !== null) {
    log = function(arg) {
      return console.log(arg);
    };
  }

  if (!Object.keys) {
    Object.keys = function(o) {
      var key, _results;
      _results = [];
      for (key in o) {
        _results.push(key);
      }
      return _results;
    };
  }

  conf = {};

  (flatten = function(parent, obj) {
    var key, val, _results;
    if (obj.length) {
      if (typeof obj[0] === 'boolean') {
        return conf[parent] = obj[0];
      } else {
        return conf[parent] = obj;
      }
    } else if (typeof obj === 'object') {
      _results = [];
      for (key in obj) {
        val = obj[key];
        _results.push(flatten(key, val));
      }
      return _results;
    } else {
      return conf[parent] = obj;
    }
  })(null, config);

  NAMESPACE = 'AEOS.4chan_x.';

  SECOND = 1000;

  MINUTE = 60 * SECOND;

  HOUR = 60 * MINUTE;

  DAY = 24 * HOUR;

  d = document;

  g = {
    callbacks: []
  };

  ui = {
    dialog: function(id, position, html) {
      var el, saved, _ref;
      el = d.createElement('div');
      el.className = 'reply dialog';
      el.innerHTML = html;
      el.id = id;
      el.style.cssText = (saved = localStorage["" + NAMESPACE + id + ".position"]) ? saved : position;
      if ((_ref = el.querySelector('div.move')) != null) {
        _ref.addEventListener('mousedown', ui.dragstart, false);
      }
      return el;
    },
    dragstart: function(e) {
      var el, rect;
      e.preventDefault();
      ui.el = el = this.parentNode;
      d.addEventListener('mousemove', ui.drag, false);
      d.addEventListener('mouseup', ui.dragend, false);
      rect = el.getBoundingClientRect();
      ui.dx = e.clientX - rect.left;
      ui.dy = e.clientY - rect.top;
      ui.width = d.body.clientWidth - el.offsetWidth;
      return ui.height = d.body.clientHeight - el.offsetHeight;
    },
    drag: function(e) {
      var bottom, left, right, style, top;
      left = e.clientX - ui.dx;
      top = e.clientY - ui.dy;
      left = left < 10 ? 0 : ui.width - left < 10 ? null : left;
      top = top < 10 ? 0 : ui.height - top < 10 ? null : top;
      right = left === null ? 0 : null;
      bottom = top === null ? 0 : null;
      style = ui.el.style;
      style.top = top;
      style.right = right;
      style.bottom = bottom;
      return style.left = left;
    },
    dragend: function() {
      var el;
      el = ui.el;
      localStorage["" + NAMESPACE + el.id + ".position"] = el.style.cssText;
      d.removeEventListener('mousemove', ui.drag, false);
      return d.removeEventListener('mouseup', ui.dragend, false);
    },
    hover: function(e) {
      var clientHeight, clientWidth, clientX, clientY, el, height, style, top, _ref;
      clientX = e.clientX, clientY = e.clientY;
      el = ui.el;
      style = el.style;
      _ref = d.body, clientHeight = _ref.clientHeight, clientWidth = _ref.clientWidth;
      height = el.offsetHeight;
      top = clientY - 120;
      style.top = clientHeight < height || top < 0 ? 0 : top + height > clientHeight ? clientHeight - height : top;
      if (clientX < clientWidth - 400) {
        style.left = clientX + 45;
        return style.right = null;
      } else {
        style.left = null;
        return style.right = clientWidth - clientX + 45;
      }
    },
    hoverend: function() {
      return ui.el.parentNode.removeChild(ui.el);
    }
  };

  /*
  loosely follows the jquery api:
  http://api.jquery.com/
  not chainable
  */

  $ = function(selector, root) {
    if (root == null) root = d.body;
    return root.querySelector(selector);
  };

  $.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };

  $.extend($, {
    id: function(id) {
      return d.getElementById(id);
    },
    globalEval: function(code) {
      var script;
      script = $.el('script', {
        textContent: "(" + code + ")()"
      });
      $.add(d.head, script);
      return $.rm(script);
    },
    ajax: function(url, cb, type, data) {
      var r;
      if (type == null) type = 'get';
      r = new XMLHttpRequest();
      r.onload = cb;
      r.open(type, url, true);
      r.send(data);
      return r;
    },
    cache: function(url, cb) {
      var req;
      if (req = $.cache.requests[url]) {
        if (req.readyState === 4) {
          return cb.call(req);
        } else {
          return req.callbacks.push(cb);
        }
      } else {
        req = $.ajax(url, (function() {
          var cb, _i, _len, _ref, _results;
          _ref = this.callbacks;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cb = _ref[_i];
            _results.push(cb.call(this));
          }
          return _results;
        }));
        req.callbacks = [cb];
        return $.cache.requests[url] = req;
      }
    },
    cb: {
      checked: function() {
        $.set(this.name, this.checked);
        return conf[this.name] = this.checked;
      },
      value: function() {
        $.set(this.name, this.value);
        return conf[this.name] = this.value;
      }
    },
    addStyle: function(css) {
      var style;
      style = $.el('style', {
        textContent: css
      });
      $.add(d.head, style);
      return style;
    },
    x: function(path, root) {
      if (root == null) root = d.body;
      return d.evaluate(path, root, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
    },
    tn: function(s) {
      return d.createTextNode(s);
    },
    replace: function(root, el) {
      return root.parentNode.replaceChild(el, root);
    },
    addClass: function(el, className) {
      return el.classList.add(className);
    },
    removeClass: function(el, className) {
      return el.classList.remove(className);
    },
    rm: function(el) {
      return el.parentNode.removeChild(el);
    },
    add: function() {
      var child, children, parent, _i, _len, _results;
      parent = arguments[0], children = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _results = [];
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        child = children[_i];
        _results.push(parent.appendChild(child));
      }
      return _results;
    },
    prepend: function(parent, child) {
      return parent.insertBefore(child, parent.firstChild);
    },
    after: function(root, el) {
      return root.parentNode.insertBefore(el, root.nextSibling);
    },
    before: function(root, el) {
      return root.parentNode.insertBefore(el, root);
    },
    el: function(tag, properties) {
      var el;
      el = d.createElement(tag);
      if (properties) $.extend(el, properties);
      return el;
    },
    on: function(el, eventType, handler) {
      return el.addEventListener(eventType, handler, false);
    },
    off: function(el, eventType, handler) {
      return el.removeEventListener(eventType, handler, false);
    },
    isDST: function() {
      /*
            http://en.wikipedia.org/wiki/Eastern_Time_Zone
            Its UTC time offset is −5 hrs (UTC−05) during standard time and −4
            hrs (UTC−04) during daylight saving time.
      
            Since 2007, the local time changes at 02:00 EST to 03:00 EDT on the second
            Sunday in March and returns at 02:00 EDT to 01:00 EST on the first Sunday
            in November, in the U.S. as well as in Canada.
      
            0200 EST (UTC-05) = 0700 UTC
            0200 EDT (UTC-04) = 0600 UTC
      */
      var D, date, day, hours, month, sunday;
      D = new Date();
      date = D.getUTCDate();
      day = D.getUTCDay();
      hours = D.getUTCHours();
      month = D.getUTCMonth();
      if (month < 2 || 10 < month) return false;
      if ((2 < month && month < 10)) return true;
      sunday = date - day;
      if (month === 2) {
        if (sunday < 8) return false;
        if (sunday < 15 && day === 0) {
          if (hours < 7) return false;
          return true;
        }
        return true;
      }
      if (sunday < 1) return true;
      if (sunday < 8 && day === 0) {
        if (hours < 6) return true;
        return false;
      }
      return false;
    }
  });

  $.cache.requests = {};

  if (typeof GM_deleteValue !== "undefined" && GM_deleteValue !== null) {
    $.extend($, {
      "delete": function(name) {
        name = NAMESPACE + name;
        return GM_deleteValue(name);
      },
      get: function(name, defaultValue) {
        var value;
        name = NAMESPACE + name;
        if (value = GM_getValue(name)) {
          return JSON.parse(value);
        } else {
          return defaultValue;
        }
      },
      openInTab: function(url) {
        return GM_openInTab(url);
      },
      set: function(name, value) {
        name = NAMESPACE + name;
        localStorage[name] = JSON.stringify(value);
        return GM_setValue(name, JSON.stringify(value));
      }
    });
  } else {
    $.extend($, {
      "delete": function(name) {
        name = NAMESPACE + name;
        return delete localStorage[name];
      },
      get: function(name, defaultValue) {
        var value;
        name = NAMESPACE + name;
        if (value = localStorage[name]) {
          return JSON.parse(value);
        } else {
          return defaultValue;
        }
      },
      openInTab: function(url) {
        return window.open(url, "_blank");
      },
      set: function(name, value) {
        name = NAMESPACE + name;
        return localStorage[name] = JSON.stringify(value);
      }
    });
  }

  for (key in conf) {
    val = conf[key];
    conf[key] = $.get(key, val);
  }

  $$ = function(selector, root) {
    if (root == null) root = d.body;
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  };

  filter = {
    regexps: {},
    callbacks: [],
    init: function() {
      var f, filter, key, m, _i, _len;
      for (key in config.filter) {
        if (!(m = conf[key].match(/^\/.+\/\w*$/gm))) continue;
        this.regexps[key] = [];
        for (_i = 0, _len = m.length; _i < _len; _i++) {
          filter = m[_i];
          f = filter.match(/^\/(.+)\/(\w*)$/);
          this.regexps[key].push(RegExp(f[1], f[2]));
        }
        this.callbacks.push(this[key]);
      }
      return g.callbacks.push(this.node);
    },
    node: function(root) {
      if (!root.className) {
        if (filter.callbacks.some(function(callback) {
          return callback(root);
        })) {
          return replyHiding.hideHide($('td:not([nowrap])', root));
        }
      } else if (root.className === 'op' && !g.REPLY && conf['Filter OPs']) {
        if (filter.callbacks.some(function(callback) {
          return callback(root);
        })) {
          return threadHiding.hideHide(root.parentNode);
        }
      }
    },
    test: function(key, value) {
      return filter.regexps[key].some(function(regexp) {
        return regexp.test(value);
      });
    },
    name: function(root) {
      var name;
      name = root.className === 'op' ? $('.postername', root) : $('.commentpostername', root);
      return filter.test('name', name.textContent);
    },
    tripcode: function(root) {
      var trip;
      if (trip = $('.postertrip', root)) {
        return filter.test('tripcode', trip.textContent);
      }
    },
    email: function(root) {
      var mail;
      if (mail = $('.linkmail', root)) return filter.test('email', mail.href);
    },
    subject: function(root) {
      var sub;
      sub = root.className === 'op' ? $('.filetitle', root) : $('.replytitle', root);
      return filter.test('subject', sub.textContent);
    },
    comment: function(root) {
      return filter.test('comment', ($.el('a', {
        innerHTML: $('blockquote', root).innerHTML.replace(/<br>/g, '\n')
      })).textContent);
    },
    filename: function(root) {
      var file;
      if (file = $('.filesize span', root)) {
        return filter.test('filename', file.title);
      }
    },
    filesize: function(root) {
      var img;
      if (img = $('img[md5]', root)) return filter.test('filesize', img.alt);
    },
    md5: function(root) {
      var img;
      if (img = $('img[md5]', root)) {
        return filter.test('md5', img.getAttribute('md5'));
      }
    }
  };

  strikethroughQuotes = {
    init: function() {
      return g.callbacks.push(function(root) {
        var el, quote, _i, _len, _ref, _results;
        if (root.className === 'inline') return;
        _ref = $$('.quotelink', root);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          quote = _ref[_i];
          if (el = $.id(quote.hash.slice(1))) {
            if (el.parentNode.parentNode.parentNode.hidden) {
              _results.push($.addClass(quote, 'filtered'));
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    }
  };

  expandComment = {
    init: function() {
      var a, _i, _len, _ref, _results;
      _ref = $$('.abbr a');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        _results.push($.on(a, 'click', expandComment.expand));
      }
      return _results;
    },
    expand: function(e) {
      var a, replyID, threadID, _, _ref;
      e.preventDefault();
      _ref = this.href.match(/(\d+)#(\d+)/), _ = _ref[0], threadID = _ref[1], replyID = _ref[2];
      this.textContent = "Loading " + replyID + "...";
      threadID = this.pathname.split('/').pop() || $.x('ancestor::div[@class="thread"]/div', this).id;
      a = this;
      return $.cache(this.pathname, (function() {
        return expandComment.parse(this, a, threadID, replyID);
      }));
    },
    parse: function(req, a, threadID, replyID) {
      var body, bq, quote, reply, _i, _j, _len, _len2, _ref, _ref2;
      if (req.status !== 200) {
        a.textContent = "" + req.status + " " + req.statusText;
        return;
      }
      body = $.el('body', {
        innerHTML: req.responseText
      });
      if (threadID === replyID) {
        bq = $('blockquote', body);
      } else {
        _ref = $$('td[id]', body);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          reply = _ref[_i];
          if (reply.id === replyID) {
            bq = $('blockquote', reply);
            break;
          }
        }
      }
      _ref2 = $$('.quotelink', bq);
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        quote = _ref2[_j];
        if (quote.getAttribute('href') === quote.hash) {
          quote.pathname = "/" + g.BOARD + "/res/" + threadID;
        }
        if (quote.hash.slice(1) === threadID) quote.innerHTML += '&nbsp;(OP)';
        if (conf['Quote Preview']) {
          $.on(quote, 'mouseover', quotePreview.mouseover);
          $.on(quote, 'mousemove', ui.hover);
          $.on(quote, 'mouseout', quotePreview.mouseout);
        }
        if (conf['Quote Inline']) $.on(quote, 'click', quoteInline.toggle);
      }
      return $.replace(a.parentNode.parentNode, bq);
    }
  };

  expandThread = {
    init: function() {
      var a, span, _i, _len, _ref, _results;
      _ref = $$('.omittedposts');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        span = _ref[_i];
        a = $.el('a', {
          textContent: "+ " + span.textContent,
          className: 'omittedposts'
        });
        $.on(a, 'click', expandThread.cb.toggle);
        _results.push($.replace(span, a));
      }
      return _results;
    },
    cb: {
      toggle: function() {
        var thread;
        thread = this.parentNode;
        return expandThread.toggle(thread);
      }
    },
    toggle: function(thread) {
      var a, backlink, num, pathname, prev, table, threadID, _i, _len, _ref, _ref2, _results;
      threadID = thread.firstChild.id;
      pathname = "/" + g.BOARD + "/res/" + threadID;
      a = $('.omittedposts', thread);
      switch (a.textContent[0]) {
        case '+':
          if ((_ref = $('.op .container', thread)) != null) _ref.innerHTML = '';
          a.textContent = a.textContent.replace('+', 'X Loading...');
          return $.cache(pathname, (function() {
            return expandThread.parse(this, pathname, thread, a);
          }));
        case 'X':
          a.textContent = a.textContent.replace('X Loading...', '+');
          return $.cache[pathname].abort();
        case '-':
          a.textContent = a.textContent.replace('-', '+');
          num = (function() {
            switch (g.BOARD) {
              case 'b':
                return 3;
              case 't':
                return 1;
              default:
                return 5;
            }
          })();
          table = $.x("following::br[@clear][1]/preceding::table[" + num + "]", a);
          while ((prev = table.previousSibling) && (prev.nodeName === 'TABLE')) {
            $.rm(prev);
          }
          _ref2 = $$('.op a.backlink');
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            backlink = _ref2[_i];
            if (!$.id(backlink.hash.slice(1))) {
              _results.push($.rm(backlink));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
      }
    },
    parse: function(req, pathname, thread, a) {
      var body, br, href, link, next, quote, reply, table, tables, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _results;
      if (req.status !== 200) {
        a.textContent = "" + req.status + " " + req.statusText;
        $.off(a, 'click', expandThread.cb.toggle);
        return;
      }
      a.textContent = a.textContent.replace('X Loading...', '-');
      while ((next = a.nextSibling) && !next.clear) {
        $.rm(next);
      }
      br = next;
      body = $.el('body', {
        innerHTML: req.responseText
      });
      _ref = $$('td[id]', body);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        reply = _ref[_i];
        _ref2 = $$('.quotelink', reply);
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          quote = _ref2[_j];
          if ((href = quote.getAttribute('href')) === quote.hash) {
            quote.pathname = pathname;
          } else if (href !== quote.href) {
            quote.href = "res/" + href;
          }
        }
        link = $('.quotejs', reply);
        link.href = "res/" + thread.firstChild.id + "#" + reply.id;
        link.nextSibling.href = "res/" + thread.firstChild.id + "#q" + reply.id;
      }
      tables = $$('form[name=delform] table', body);
      tables.pop();
      _results = [];
      for (_k = 0, _len3 = tables.length; _k < _len3; _k++) {
        table = tables[_k];
        _results.push($.before(br, table));
      }
      return _results;
    }
  };

  replyHiding = {
    init: function() {
      return g.callbacks.push(function(root) {
        var a, dd, id, reply;
        if (!(dd = $('.doubledash', root))) return;
        dd.className = 'replyhider';
        a = $.el('a', {
          textContent: '[ - ]'
        });
        $.on(a, 'click', replyHiding.cb.hide);
        $.replace(dd.firstChild, a);
        reply = dd.nextSibling;
        id = reply.id;
        if (id in g.hiddenReplies) return replyHiding.hide(reply);
      });
    },
    cb: {
      hide: function() {
        var reply;
        reply = this.parentNode.nextSibling;
        return replyHiding.hide(reply);
      },
      show: function() {
        var div, table;
        div = this.parentNode;
        table = div.nextSibling;
        replyHiding.show(table);
        return $.rm(div);
      }
    },
    hide: function(reply) {
      var id, quote, _i, _len, _ref;
      replyHiding.hideHide(reply);
      id = reply.id;
      _ref = $$(".quotelink[href='#" + id + "'], .backlink[href='#" + id + "']");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        $.addClass(quote, 'filtered');
      }
      g.hiddenReplies[id] = Date.now();
      return $.set("hiddenReplies/" + g.BOARD + "/", g.hiddenReplies);
    },
    hideHide: function(reply) {
      var a, div, name, table, trip, _ref;
      table = reply.parentNode.parentNode.parentNode;
      if (table.hidden) return;
      table.hidden = true;
      if (conf['Show Stubs']) {
        name = $('.commentpostername', reply).textContent;
        trip = ((_ref = $('.postertrip', reply)) != null ? _ref.textContent : void 0) || '';
        a = $.el('a', {
          textContent: "[ + ] " + name + " " + trip
        });
        $.on(a, 'click', replyHiding.cb.show);
        div = $.el('div', {
          className: 'stub'
        });
        $.add(div, a);
        return $.before(table, div);
      }
    },
    show: function(table) {
      var id, quote, _i, _len, _ref;
      table.hidden = false;
      id = $('td[id]', table).id;
      _ref = $$(".quotelink[href='#" + id + "'], .backlink[href='#" + id + "']");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        $.removeClass(quote, 'filtered');
      }
      delete g.hiddenReplies[id];
      return $.set("hiddenReplies/" + g.BOARD + "/", g.hiddenReplies);
    }
  };

  keybinds = {
    init: function() {
      var node, _i, _len, _ref;
      _ref = $$('[accesskey]');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        node.removeAttribute('accesskey');
      }
      return $.on(d, 'keydown', keybinds.keydown);
    },
    keydown: function(e) {
      var o, range, selEnd, selStart, ta, thread, valEnd, valMid, valStart, value, _ref, _ref2, _ref3;
      updater.focus = true;
      if (((_ref = e.target.nodeName) === 'TEXTAREA' || _ref === 'INPUT') && !e.altKey && !e.ctrlKey && !(e.keyCode === 27)) {
        return;
      }
      if (!(key = keybinds.keyCode(e))) return;
      thread = nav.getThread();
      switch (key) {
        case conf.close:
          if (o = $('#overlay')) {
            $.rm(o);
          } else if (Post.qr) {
            Post.rm();
          }
          break;
        case conf.spoiler:
          ta = e.target;
          if (ta.nodeName !== 'TEXTAREA') return;
          value = ta.value;
          selStart = ta.selectionStart;
          selEnd = ta.selectionEnd;
          valStart = value.slice(0, selStart) + '[spoiler]';
          valMid = value.slice(selStart, selEnd);
          valEnd = '[/spoiler]' + value.slice(selEnd);
          ta.value = valStart + valMid + valEnd;
          range = valStart.length + valMid.length;
          ta.setSelectionRange(range, range);
          break;
        case conf.zero:
          window.location = "/" + g.BOARD + "/0#0";
          break;
        case conf.openEmptyQR:
          keybinds.qr(thread);
          break;
        case conf.nextReply:
          keybinds.hl.next(thread);
          break;
        case conf.previousReply:
          keybinds.hl.prev(thread);
          break;
        case conf.expandAllImages:
          keybinds.img(thread, true);
          break;
        case conf.openThread:
          keybinds.open(thread);
          break;
        case conf.expandThread:
          expandThread.toggle(thread);
          break;
        case conf.openQR:
          keybinds.qr(thread, true);
          break;
        case conf.expandImages:
          keybinds.img(thread);
          break;
        case conf.nextThread:
          nav.next();
          break;
        case conf.openThreadTab:
          keybinds.open(thread, true);
          break;
        case conf.previousThread:
          nav.prev();
          break;
        case conf.update:
          updater.update();
          break;
        case conf.watch:
          watcher.toggle(thread);
          break;
        case conf.hide:
          threadHiding.toggle(thread);
          break;
        case conf.nextPage:
          if ((_ref2 = $('input[value=Next]')) != null) _ref2.click();
          break;
        case conf.previousPage:
          if ((_ref3 = $('input[value=Previous]')) != null) _ref3.click();
          break;
        case conf.submit:
          if (Post.qr) {
            Post.submit();
          } else {
            $('.postarea form').submit();
          }
          break;
        case conf.unreadCountTo0:
          unread.replies.length = 0;
          unread.updateTitle();
          Favicon.update();
          break;
        default:
          return;
      }
      return e.preventDefault();
    },
    keyCode: function(e) {
      var c, kc;
      key = (function() {
        switch (kc = e.keyCode) {
          case 8:
            return '';
          case 27:
            return 'Esc';
          case 37:
            return 'Left';
          case 38:
            return 'Up';
          case 39:
            return 'Right';
          case 40:
            return 'Down';
          case 48:
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
          case 56:
          case 57:
          case 65:
          case 66:
          case 67:
          case 68:
          case 69:
          case 70:
          case 71:
          case 72:
          case 73:
          case 74:
          case 75:
          case 76:
          case 77:
          case 78:
          case 79:
          case 80:
          case 81:
          case 82:
          case 83:
          case 84:
          case 85:
          case 86:
          case 87:
          case 88:
          case 89:
          case 90:
            c = String.fromCharCode(kc);
            if (e.shiftKey) {
              return c;
            } else {
              return c.toLowerCase();
            }
            break;
          default:
            return null;
        }
      })();
      if (key) {
        if (e.altKey) key = 'alt+' + key;
        if (e.ctrlKey) key = 'ctrl+' + key;
      }
      return key;
    },
    img: function(thread, all) {
      var root, thumb;
      if (all) {
        return $("#imageExpand").click();
      } else {
        root = $('td.replyhl', thread) || thread;
        thumb = $('img[md5]', root);
        return imgExpand.toggle(thumb.parentNode);
      }
    },
    qr: function(thread, quote) {
      var link;
      link = $('.quotejs + a', $('.replyhl', thread) || thread);
      if (quote) {
        return Post.quote.call(link, {
          preventDefault: function() {}
        });
      } else {
        if (!Post.qr) Post.dialog(link);
        return $('textarea', Post.qr).focus();
      }
    },
    open: function(thread, tab) {
      var id, url;
      id = thread.firstChild.id;
      url = "http://boards.4chan.org/" + g.BOARD + "/res/" + id;
      if (tab) {
        return $.openInTab(url);
      } else {
        return location.href = url;
      }
    },
    hl: {
      next: function(thread) {
        var next, rect, replies, reply, td, top, _i, _len;
        if (td = $('td.replyhl', thread)) {
          td.className = 'reply';
          rect = td.getBoundingClientRect();
          if (rect.top > 0 && rect.bottom < d.body.clientHeight) {
            next = $.x('following::td[@class="reply"]', td);
            if ($.x('ancestor::div[@class="thread"]', next) !== thread) return;
            rect = next.getBoundingClientRect();
            if (rect.top > 0 && rect.bottom < d.body.clientHeight) {
              next.className = 'replyhl';
            }
            return;
          }
        }
        replies = $$('td.reply', thread);
        for (_i = 0, _len = replies.length; _i < _len; _i++) {
          reply = replies[_i];
          top = reply.getBoundingClientRect().top;
          if (top > 0) {
            reply.className = 'replyhl';
            return;
          }
        }
      },
      prev: function(thread) {
        var bot, height, prev, rect, replies, reply, td, _i, _len;
        if (td = $('td.replyhl', thread)) {
          td.className = 'reply';
          rect = td.getBoundingClientRect();
          if (rect.top > 0 && rect.bottom < d.body.clientHeight) {
            prev = $.x('preceding::td[@class="reply"][1]', td);
            rect = prev.getBoundingClientRect();
            if (rect.top > 0 && rect.bottom < d.body.clientHeight) {
              prev.className = 'replyhl';
            }
            return;
          }
        }
        replies = $$('td.reply', thread);
        replies.reverse();
        height = d.body.clientHeight;
        for (_i = 0, _len = replies.length; _i < _len; _i++) {
          reply = replies[_i];
          bot = reply.getBoundingClientRect().bottom;
          if (bot < height) {
            reply.className = 'replyhl';
            return;
          }
        }
      }
    }
  };

  nav = {
    init: function() {
      var next, prev, span;
      span = $.el('span', {
        id: 'navlinks'
      });
      prev = $.el('a', {
        textContent: '▲'
      });
      next = $.el('a', {
        textContent: '▼'
      });
      $.on(prev, 'click', nav.prev);
      $.on(next, 'click', nav.next);
      $.add(span, prev, $.tn(' '), next);
      return $.add(d.body, span);
    },
    prev: function() {
      return nav.scroll(-1);
    },
    next: function() {
      return nav.scroll(+1);
    },
    threads: [],
    getThread: function(full) {
      var bottom, i, rect, thread, _len, _ref;
      nav.threads = $$('div.thread:not([hidden])');
      _ref = nav.threads;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        thread = _ref[i];
        rect = thread.getBoundingClientRect();
        bottom = rect.bottom;
        if (bottom > 0) {
          if (full) return [thread, i, rect];
          return thread;
        }
      }
      return null;
    },
    scroll: function(delta) {
      var i, rect, thread, top, _ref;
      if (g.REPLY) {
        if (delta === -1) {
          window.scrollTo(0, 0);
        } else {
          window.scrollTo(0, d.body.scrollHeight);
        }
        return;
      }
      _ref = nav.getThread(true), thread = _ref[0], i = _ref[1], rect = _ref[2];
      top = rect.top;
      if (!((delta === -1 && Math.ceil(top) < 0) || (delta === +1 && top > 1))) {
        i += delta;
      }
      if (i === -1) {
        if (g.PAGENUM === 0) {
          window.scrollTo(0, 0);
        } else {
          window.location = "" + (g.PAGENUM - 1) + "#0";
        }
        return;
      }
      if (delta === +1) {
        if (i === nav.threads.length || (innerHeight + pageYOffset === d.body.scrollHeight)) {
          if ($('table.pages input[value="Next"]')) {
            window.location = "" + (g.PAGENUM + 1) + "#0";
            return;
          }
        }
      }
      top = nav.threads[i].getBoundingClientRect().top;
      return window.scrollBy(0, top);
    }
  };

  options = {
    init: function() {
      var a, home;
      home = $('#navtopr a');
      a = $.el('a', {
        textContent: '4chan X'
      });
      $.on(a, 'click', options.dialog);
      $.replace(home, a);
      home = $('#navbotr a');
      a = $.el('a', {
        textContent: '4chan X'
      });
      $.on(a, 'click', options.dialog);
      return $.replace(home, a);
    },
    dialog: function() {
      var arr, back, checked, description, dialog, hiddenNum, hiddenThreads, input, key, li, obj, overlay, ta, time, ul, _i, _j, _len, _len2, _ref, _ref2, _ref3;
      dialog = ui.dialog('options', '', '\
<div id=optionsbar>\
  <div id=credits>\
    <a target=_blank href=http://aeosynth.github.com/4chan-x/>4chan X</a>\
    | <a target=_blank href=https://github.com/aeosynth/4chan-x/issues>Issues</a>\
    | <a target=_blank href=https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=2DBVZBUAM4DHC&lc=US&item_name=Aeosynth&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted>Donate</a>\
  </div>\
  <div>\
    <label for=main_tab>Main</label>\
    | <label for=filter_tab>Filter</label>\
    | <label for=flavors_tab>Sauce</label>\
    | <label for=rice_tab>Rice</label>\
    | <label for=keybinds_tab>Keybinds</label>\
  </div>\
</div>\
<hr>\
<div id=content>\
  <input type=radio name=tab hidden id=main_tab checked>\
  <div id=main></div>\
  <input type=radio name=tab hidden id=flavors_tab>\
  <textarea name=flavors id=flavors></textarea>\
  <input type=radio name=tab hidden id=filter_tab>\
  <div id=filter>\
    Use <a href=https://developer.mozilla.org/en/JavaScript/Guide/Regular_Expressions>regular expressions</a>, one per line.<br>\
    For example, <code>/weeaboo/i</code> will filter posts containing `weeaboo` case-insensitive.\
    <p>Name:<br><textarea name=name></textarea></p>\
    <p>Tripcode:<br><textarea name=tripcode></textarea></p>\
    <p>E-mail:<br><textarea name=email></textarea></p>\
    <p>Subject:<br><textarea name=subject></textarea></p>\
    <p>Comment:<br><textarea name=comment></textarea></p>\
    <p>Filename:<br><textarea name=filename></textarea></p>\
    <p>Filesize:<br><textarea name=filesize></textarea></p>\
    <p>Image MD5:<br><textarea name=md5></textarea></p>\
  </div>\
  <input type=radio name=tab hidden id=rice_tab>\
  <div id=rice>\
    <ul>\
      Backlink formatting\
      <li><input type=text name=backlink> : <span id=backlinkPreview></span></li>\
    </ul>\
    <ul>\
      Time formatting\
      <li><input type=text name=time> : <span id=timePreview></span></li>\
      <li>Supported <a href=http://en.wikipedia.org/wiki/Date_%28Unix%29#Formatting>format specifiers</a>:</li>\
      <li>Day: %a, %A, %d, %e</li>\
      <li>Month: %m, %b, %B</li>\
      <li>Year: %y</li>\
      <li>Hour: %k, %H, %l (lowercase L), %I (uppercase i), %p, %P</li>\
      <li>Minutes: %M</li>\
    </ul>\
  </div>\
  <input type=radio name=tab hidden id=keybinds_tab>\
  <div id=keybinds>\
    <table><tbody>\
      <tr><th>Actions</th><th>Keybinds</th></tr>\
      <tr><td>Close Options or QR</td><td><input name=close></td></tr>\
      <tr><td>Quick spoiler</td><td><input name=spoiler></td></tr>\
      <tr><td>Open QR with post number inserted</td><td><input name=openQR></td></tr>\
      <tr><td>Open QR without post number inserted</td><td><input name=openEmptyQR></td></tr>\
      <tr><td>Submit post</td><td><input name=submit></td></tr>\
      <tr><td>Select next reply</td><td><input name=nextReply ></td></tr>\
      <tr><td>Select previous reply</td><td><input name=previousReply></td></tr>\
      <tr><td>See next thread</td><td><input name=nextThread></td></tr>\
      <tr><td>See previous thread</td><td><input name=previousThread></td></tr>\
      <tr><td>Jump to the next page</td><td><input name=nextPage></td></tr>\
      <tr><td>Jump to the previous page</td><td><input name=previousPage></td></tr>\
      <tr><td>Jump to page 0</td><td><input name=zero></td></tr>\
      <tr><td>Open thread in current tab</td><td><input name=openThread></td></tr>\
      <tr><td>Open thread in new tab</td><td><input name=openThreadTab></td></tr>\
      <tr><td>Expand thread</td><td><input name=expandThread></td></tr>\
      <tr><td>Watch thread</td><td><input name=watch></td></tr>\
      <tr><td>Hide thread</td><td><input name=hide></td></tr>\
      <tr><td>Expand selected image</td><td><input name=expandImages></td></tr>\
      <tr><td>Expand all images</td><td><input name=expandAllImages></td></tr>\
      <tr><td>Update now</td><td><input name=update></td></tr>\
      <tr><td>Reset the unread count to 0</td><td><input name=unreadCountTo0></td></tr>\
    </tbody></table>\
  </div>\
</div>');
      _ref = config.main;
      for (key in _ref) {
        obj = _ref[key];
        ul = $.el('ul', {
          textContent: key
        });
        for (key in obj) {
          arr = obj[key];
          checked = conf[key] ? 'checked' : '';
          description = arr[1];
          li = $.el('li', {
            innerHTML: "<label><input type=checkbox name='" + key + "' " + checked + ">" + key + "</label><span class=description>: " + description + "</span>"
          });
          $.on($('input', li), 'click', $.cb.checked);
          $.add(ul, li);
        }
        $.add($('#main', dialog), ul);
      }
      hiddenThreads = $.get("hiddenThreads/" + g.BOARD + "/", {});
      hiddenNum = Object.keys(g.hiddenReplies).length + Object.keys(hiddenThreads).length;
      li = $.el('li', {
        innerHTML: "<button>hidden: " + hiddenNum + "</button> <span class=description>: Forget all hidden posts. Useful if you accidentally hide a post and have `Show Stubs` disabled."
      });
      $.on($('button', li), 'click', options.clearHidden);
      $.add($('ul:nth-child(2)', dialog), li);
      _ref2 = $$('textarea', dialog);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        ta = _ref2[_i];
        ta.textContent = conf[ta.name];
        $.on(ta, 'change', $.cb.value);
      }
      (back = $('[name=backlink]', dialog)).value = conf['backlink'];
      (time = $('[name=time]', dialog)).value = conf['time'];
      $.on(back, 'keyup', options.backlink);
      $.on(time, 'keyup', options.time);
      _ref3 = $$('#keybinds input', dialog);
      for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
        input = _ref3[_j];
        input.type = 'text';
        input.value = conf[input.name];
        $.on(input, 'keydown', options.keybind);
      }
      overlay = $.el('div', {
        id: 'overlay'
      });
      $.on(overlay, 'click', function() {
        return $.rm(overlay);
      });
      $.on(dialog, 'click', function(e) {
        return e.stopPropagation();
      });
      $.add(overlay, dialog);
      $.add(d.body, overlay);
      options.time.call(time);
      return options.backlink.call(back);
    },
    clearHidden: function() {
      $["delete"]("hiddenReplies/" + g.BOARD + "/");
      $["delete"]("hiddenThreads/" + g.BOARD + "/");
      this.textContent = "hidden: 0";
      return g.hiddenReplies = {};
    },
    keybind: function(e) {
      e.preventDefault();
      e.stopPropagation();
      if ((key = keybinds.keyCode(e)) == null) return;
      this.value = key;
      $.set(this.name, key);
      return conf[this.name] = key;
    },
    time: function() {
      $.set('time', this.value);
      conf['time'] = this.value;
      Time.foo();
      Time.date = new Date();
      return $('#timePreview').textContent = Time.funk(Time);
    },
    backlink: function() {
      $.set('backlink', this.value);
      conf['backlink'] = this.value;
      return $('#backlinkPreview').textContent = conf['backlink'].replace(/%id/, '123456789');
    }
  };

  Post = {
    init: function() {
      var holder;
      if (!($('form[name=post]') && $('#recaptcha_response_field'))) return;
      if (conf['Cooldown']) {
        $.on(window, 'storage', function(e) {
          if (e.key === ("" + NAMESPACE + "cooldown/" + g.BOARD)) {
            return Post.cooldown();
          }
        });
      }
      Post.spoiler = $('input[name=spoiler]') ? '<label>[<input name=spoiler type=checkbox>Spoiler Image?]</label>' : '';
      $('#recaptcha_response_field').removeAttribute('id');
      holder = $('#recaptcha_challenge_field_holder');
      $.on(holder, 'DOMNodeInserted', Post.captchaNode);
      Post.captchaNode({
        target: holder.firstChild
      });
      $.add(d.body, $.el('iframe', {
        id: 'iframe',
        hidden: true,
        src: g.XHR2 ? "http://sys.4chan.org/" + g.BOARD + "/src" : 'about:blank'
      }));
      Post.MAX_FILE_SIZE = $('[name=MAX_FILE_SIZE]').value;
      g.callbacks.push(Post.node);
      if (g.REPLY && conf['Persistent QR']) {
        Post.dialog();
        if (conf['Auto Hide QR']) return $('#autohide', Post.qr).checked = true;
      }
    },
    node: function(root) {
      var link;
      link = $('.quotejs + a', root);
      return $.on(link, 'click', Post.quote);
    },
    quote: function(e) {
      var i, id, qr, root, s, selection, ss, ta, text, v, _ref;
      e.preventDefault();
      qr = Post.qr || Post.dialog(this);
      $('#autohide', qr).checked = false;
      id = this.textContent;
      text = ">>" + id + "\n";
      selection = getSelection();
      root = $.x('ancestor::td', selection.anchorNode);
      if (id === ((_ref = $('input', root)) != null ? _ref.name : void 0)) {
        if (s = selection.toString().replace(/\n/g, '\n>')) text += ">" + s + "\n";
      }
      ta = $('textarea', qr);
      v = ta.value;
      ss = ta.selectionStart;
      ta.value = v.slice(0, ss) + text + v.slice(ss);
      i = ss + text.length;
      ta.setSelectionRange(i, i);
      ta.focus();
      return Post.charCount.call(ta);
    },
    stats: function() {
      var captchas, images, qr;
      qr = Post.qr;
      images = $$('#items li', qr);
      captchas = $.get('captchas', []);
      return $('#pstats', qr).textContent = "captchas: " + captchas.length + " / images: " + images.length;
    },
    dialog: function(link) {
      var hidden, qr, resto;
      if (g.REPLY) {
        resto = g.THREAD_ID;
      } else {
        resto = $.x('ancestor::div[@class="thread"]/div', link).id;
      }
      hidden = conf['Character Count'] ? '' : 'hidden';
      qr = Post.qr = ui.dialog('post', 'top: 0; right: 0', "    <a class=close>X</a>    <input type=checkbox id=autohide title=autohide>    <div class=move>      <span id=pstats></span>    </div>    <div class=autohide>      <form enctype=multipart/form-data method=post action=http://sys.4chan.org/" + g.BOARD + "/post target=iframe id=qr_form>        <input type=hidden name=mode value=regist>        <input type=hidden name=resto value=" + resto + ">        <input type=hidden name=recaptcha_challenge_field>        <input type=hidden name=recaptcha_response_field>        <div id=foo>          <input class=inputtext placeholder=Name    name=name>          <input class=inputtext placeholder=Email   name=email>          <input class=inputtext placeholder=Subject name=sub>        </div>        <textarea class=inputtext placeholder=Comment name=com></textarea>        <div><img id=captchaImg></div>      </form>      <div id=reholder>        <input class=inputtext id=recaptcha_response_field placeholder=Verification autocomplete=off>        <span id=charCount " + hidden + "></span>        <span id=fileSpan>          <img src=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41Ljg3O4BdAAAAXUlEQVQ4T2NgoAH4DzQTHyZoJckGENJASB6nc9GdCjdo6tSptkCsCPUqVgNAmtFtxiYGUkO0QrBibOqJtWkIGYDTqTgSGOnRiGYQ3mRLKBFhjUZiNCGrIZg3aKsAAGu4rTMFLFBMAAAAAElFTkSuQmCC>        </span>      </div>      <ul id=items></ul>      <div>        <button id=submit>Submit</button>        " + Post.spoiler + "        <label><input id=autosubmit type=checkbox>autosubmit</label>      </div>    </div>    ");
      Post.reset();
      Post.captchaImg();
      Post.file();
      if (conf['cooldown']) Post.cooldown();
      $.on($('.close', qr), 'click', Post.rm);
      $.on($('#submit', qr), 'click', Post.submit);
      $.on($('#recaptcha_response_field', qr), 'keydown', Post.captchaKeydown);
      $.on($('img', qr), 'click', Post.captchaReload);
      $.on($('textarea', qr), 'keyup', Post.charCount);
      Post.stats();
      $.add(d.body, qr);
      return qr;
    },
    charCount: function(e) {
      return $('#charCount', Post.qr).textContent = this.value.length + ' / 2000';
    },
    rm: function() {
      $.rm(Post.qr);
      return Post.qr = null;
    },
    captchaGet: function() {
      var captcha, captchas, cutoff, el, v;
      captchas = $.get('captchas', []);
      cutoff = Date.now() - 25 * MINUTE;
      while (captcha = captchas.shift()) {
        if (captcha.time > cutoff) break;
      }
      $.set('captchas', captchas);
      if (!captcha) {
        el = $('#recaptcha_response_field', Post.qr);
        if (v = el.value) {
          el.value = '';
          captcha = Post.captcha;
          captcha.response = v;
          Post.captchaReload();
        }
      }
      return captcha;
    },
    captchaImg: function() {
      var _ref;
      return (_ref = $('#captchaImg', Post.qr)) != null ? _ref.src = 'http://www.google.com/recaptcha/api/image?c=' + Post.captcha.challenge : void 0;
    },
    captchaKeydown: function(e) {
      var kc, v;
      kc = e.keyCode;
      v = this.value;
      if (kc === 8 && !v) {
        Post.captchaReload();
        return;
      }
      if (e.keyCode === 13 && v) {
        Post.captchaSet.call(this);
        return Post.submit();
      }
    },
    captchaNode: function(e) {
      Post.captcha = {
        challenge: e.target.value,
        time: Date.now()
      };
      return Post.captchaImg();
    },
    captchaReload: function() {
      return window.location = 'javascript:Recaptcha.reload()';
    },
    captchaSet: function() {
      var captcha, captchas, response;
      response = this.value;
      this.value = '';
      captchas = $.get('captchas', []);
      captcha = Post.captcha;
      captcha.response = response;
      captchas.push(captcha);
      $.set('captchas', captchas);
      Post.captchaReload();
      return Post.stats();
    },
    pushFile: function() {
      var file, items, self, _fn, _i, _len, _ref;
      self = this;
      items = $('#items', Post.qr);
      _ref = this.files;
      _fn = function(file) {
        var fr, img, input, item;
        if (file.size > Post.MAX_FILE_SIZE) {
          alert('Error: File too large.');
          return;
        }
        item = $.el('li', {
          innerHTML: '<a class=close>X</a><img>'
        });
        $.on($('a', item), 'click', Post.rmFile);
        $.add(items, item);
        if (g.XHR2) {
          input = $.el('input', {
            type: 'file'
          });
          $.on(input, 'change', Post.fileChange);
          $.add(item, input);
        } else {
          $.add(item, self);
        }
        fr = new FileReader();
        img = $('img', item);
        fr.onload = function(e) {
          return img.src = e.target.result;
        };
        return fr.readAsDataURL(file);
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        _fn(file);
      }
      Post.stats();
      return Post.file();
    },
    fileChange: function() {
      var file, fr, img;
      file = this.files[0];
      if (file.size > Post.MAX_FILE_SIZE) {
        alert('Error: File too large.');
        return;
      }
      fr = new FileReader();
      img = $('img', this.parentNode);
      fr.onload = function(e) {
        return img.src = e.target.result;
      };
      return fr.readAsDataURL(file);
    },
    file: function() {
      var fileSpan, input;
      fileSpan = $('#fileSpan', Post.qr);
      if (input = $('input', fileSpan)) $.rm(input);
      input = $.el('input', {
        type: 'file',
        name: 'upfile',
        accept: 'image/*'
      });
      if (g.XHR2) input.multiple = true;
      $.add(fileSpan, input);
      return $.on($('input', fileSpan), 'change', Post.pushFile);
    },
    rmFile: function() {
      $.rm(this.parentNode);
      return Post.stats();
    },
    submit: function(e) {
      var captcha, challenge, el, form, img, o, op, qr, response, _i, _len, _ref;
      qr = Post.qr;
      o = {};
      _ref = $$('[name]', qr);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        if (el.type !== 'checkbox') {
          o[el.name] = el.value;
        } else if (el.checked) {
          o[el.name] = true;
        }
      }
      delete o.upfile;
      img = $('#items img[src]', qr);
      if (!(o.com || img)) {
        if (e) alert('Error: No text entered.');
        return;
      }
      if ($('button', qr).disabled) {
        $('#autosubmit', qr).checked = true;
        return;
      }
      if (!(captcha = Post.captchaGet())) {
        if (e) alert('You forgot to type in the verification.');
        return;
      }
      Post.stats();
      if (img) {
        img.setAttribute('data-submit', true);
        if (g.XHR2) {
          o.upfile = atob(img.src.split(',')[1]);
        } else {
          $('input', img.parentNode).setAttribute('form', 'qr_form');
        }
      }
      Post.sage = /sage/i.test(o.email);
      challenge = captcha.challenge, response = captcha.response;
      if (g.XHR2) {
        o.recaptcha_challenge_field = challenge;
        o.recaptcha_response_field = response;
        o.to = 'sys';
        postMessage(o, '*');
      } else {
        form = $('form', qr);
        form.recaptcha_challenge_field.value = challenge;
        form.recaptcha_response_field.value = response;
        form.submit();
      }
      if (conf['Auto Hide QR']) $('#autohide', qr).checked = true;
      if (conf['Thread Watcher'] && conf['Auto Watch Reply']) {
        op = $.id(o.resto);
        if ($('img.favicon', op).src === Favicon.empty) {
          return watcher.watch(op, id);
        }
      }
    },
    sys: function() {
      var data, node, recaptcha, _ref;
      if (recaptcha = $('#recaptcha_response_field')) {
        $.on(recaptcha, 'keydown', Post.keydown);
        return;
      }
      $.globalEval(function() {
        /*
              http://code.google.com/p/chromium/issues/detail?id=20773
              Let content scripts see other frames (instead of them being undefined)
        
              To access the parent, we have to break out of the sandbox and evaluate
              in the global context.
        */        return window.addEventListener('message', function(e) {
          var data;
          data = e.data;
          if (data.to === 'Post.message') return parent.postMessage(data, '*');
        }, false);
      });
      if (!g.XHR2) {
        data = {
          to: 'Post.message'
        };
        if (node = (_ref = $('table font b')) != null ? _ref.firstChild : void 0) {
          data.error = node.textContent;
        } else if (node = $('meta')) {
          data.url = node.content.match(/url=(.+)/)[1];
        }
        postMessage(data, '*');
        return;
      }
      return $.on(window, 'message', function(e) {
        var bb, fd, i, key, l, to, ui8a, upfile, val;
        data = e.data;
        to = data.to;
        if (to !== 'sys') return;
        delete data.to;
        fd = new FormData();
        upfile = data.upfile;
        if (upfile) {
          l = upfile.length;
          ui8a = new Uint8Array(l);
          for (i = 0; 0 <= l ? i < l : i > l; 0 <= l ? i++ : i--) {
            ui8a[i] = upfile.charCodeAt(i);
          }
          bb = new (window.MozBlobBuilder || window.WebKitBlobBuilder)();
          bb.append(ui8a.buffer);
          data.upfile = bb.getBlob();
        }
        for (key in data) {
          val = data[key];
          fd.append(key, val);
        }
        return $.ajax('post', Post.sysCallback, 'post', fd);
      });
    },
    sysCallback: function() {
      var body, data, node, _ref;
      data = {
        to: 'Post.message'
      };
      body = $.el('body', {
        innerHTML: this.responseText
      });
      if (node = (_ref = $('table font b', body)) != null ? _ref.firstChild : void 0) {
        data.error = node.textContent;
      }
      return postMessage(data, '*');
    },
    message: function(data) {
      var cooldown, error, img, qr, url;
      qr = Post.qr;
      if (!g.XHR2) $('#iframe').src = 'about:blank';
      error = data.error, url = data.url;
      img = $('img[data-submit]', qr);
      if (url) return window.location = url;
      if (error) {
        if (error === 'Error: Duplicate file entry detected.') {
          $.rm(img.parentNode);
          Post.stats();
          setTimeout(Post.submit, 1000);
        } else if (error === 'You seem to have mistyped the verification.') {
          setTimeout(Post.submit, 1000);
        } else {
          $('#autohide', qr).checked = false;
          alert(error);
        }
        return;
      }
      if (img = $('img[data-submit]', qr)) {
        $.rm(img.parentNode);
        Post.stats();
      }
      if (conf['Persistent QR'] || $('#items img[src]', qr)) {
        Post.reset();
      } else {
        Post.rm();
      }
      if (conf['Cooldown']) {
        cooldown = Date.now() + (Post.sage ? 60 : 30) * SECOND;
        $.set("cooldown/" + g.BOARD, cooldown);
        return Post.cooldown();
      }
    },
    reset: function() {
      var c, m, qr, ta;
      qr = Post.qr;
      ta = $('textarea', qr);
      ta.value = '';
      Post.charCount.call(ta);
      c = d.cookie;
      $('[name=name]', qr).value = (m = c.match(/4chan_name=([^;]+)/)) ? decodeURIComponent(m[1]) : '';
      return $('[name=email]', qr).value = (m = c.match(/4chan_email=([^;]+)/)) ? decodeURIComponent(m[1]) : '';
    },
    cooldown: function() {
      var b, cooldown, n, now, qr;
      qr = Post.qr;
      if (!qr) return;
      cooldown = $.get("cooldown/" + g.BOARD, 0);
      now = Date.now();
      n = Math.ceil((cooldown - now) / 1000);
      b = $('button', qr);
      if (n > 0) {
        $.extend(b, {
          textContent: n,
          disabled: true
        });
        return setTimeout(Post.cooldown, 1000);
      } else {
        $.extend(b, {
          textContent: 'Submit',
          disabled: false
        });
        if ($('#autosubmit', qr).checked) return Post.submit();
      }
    }
  };

  threading = {
    init: function() {
      return threading.thread($('body > form').firstChild);
    },
    op: function(node) {
      var op;
      op = $.el('div', {
        className: 'op'
      });
      $.before(node, op);
      while (node.nodeName !== 'BLOCKQUOTE') {
        $.add(op, node);
        node = op.nextSibling;
      }
      $.add(op, node);
      op.id = $('input', op).name;
      return op;
    },
    thread: function(node) {
      var div;
      node = threading.op(node);
      if (g.REPLY) return;
      div = $.el('div', {
        className: 'thread'
      });
      $.before(node, div);
      while (node.nodeName !== 'HR') {
        $.add(div, node);
        node = div.nextSibling;
      }
      node = node.nextElementSibling;
      if (!(node.align || node.nodeName === 'CENTER')) {
        return threading.thread(node);
      }
    }
  };

  threadHiding = {
    init: function() {
      var a, hiddenThreads, op, thread, _i, _len, _ref, _results;
      hiddenThreads = $.get("hiddenThreads/" + g.BOARD + "/", {});
      _ref = $$('.thread');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        thread = _ref[_i];
        op = thread.firstChild;
        a = $.el('a', {
          textContent: '[ - ]'
        });
        $.on(a, 'click', threadHiding.cb.hide);
        $.prepend(op, a);
        if (op.id in hiddenThreads) {
          _results.push(threadHiding.hideHide(thread));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    cb: {
      hide: function() {
        var thread;
        thread = this.parentNode.parentNode;
        return threadHiding.hide(thread);
      },
      show: function() {
        var thread;
        thread = this.parentNode.parentNode;
        return threadHiding.show(thread);
      }
    },
    toggle: function(thread) {
      if (/\bstub\b/.test(thread.className) || thread.hidden) {
        return threadHiding.show(thread);
      } else {
        return threadHiding.hide(thread);
      }
    },
    hide: function(thread) {
      var hiddenThreads, id;
      threadHiding.hideHide(thread);
      id = thread.firstChild.id;
      hiddenThreads = $.get("hiddenThreads/" + g.BOARD + "/", {});
      hiddenThreads[id] = Date.now();
      return $.set("hiddenThreads/" + g.BOARD + "/", hiddenThreads);
    },
    hideHide: function(thread) {
      var a, div, name, num, span, text, trip, _ref;
      if (conf['Show Stubs']) {
        if (/stub/.test(thread.className)) return;
        if (span = $('.omittedposts', thread)) {
          num = Number(span.textContent.match(/\d+/)[0]);
        } else {
          num = 0;
        }
        num += $$('table', thread).length;
        text = num === 1 ? "1 reply" : "" + num + " replies";
        name = $('.postername', thread).textContent;
        trip = ((_ref = $('.postername + .postertrip', thread)) != null ? _ref.textContent : void 0) || '';
        a = $.el('a', {
          textContent: "[ + ] " + name + trip + " (" + text + ")"
        });
        $.on(a, 'click', threadHiding.cb.show);
        div = $.el('div', {
          className: 'block'
        });
        $.add(div, a);
        $.add(thread, div);
        return $.addClass(thread, 'stub');
      } else {
        thread.hidden = true;
        return thread.nextSibling.hidden = true;
      }
    },
    show: function(thread) {
      var hiddenThreads, id;
      $.rm($('div.block', thread));
      $.removeClass(thread, 'stub');
      thread.hidden = false;
      thread.nextSibling.hidden = false;
      id = thread.firstChild.id;
      hiddenThreads = $.get("hiddenThreads/" + g.BOARD + "/", {});
      delete hiddenThreads[id];
      return $.set("hiddenThreads/" + g.BOARD + "/", hiddenThreads);
    }
  };

  updater = {
    init: function() {
      var checkbox, checked, dialog, html, input, name, title, _i, _len, _ref;
      if (!$('form[name=post]')) return;
      if (conf['Scrolling']) {
        if (conf['Scroll BG']) {
          updater.focus = true;
        } else {
          $.on(window, 'focus', (function() {
            return updater.focus = true;
          }));
          $.on(window, 'blur', (function() {
            return updater.focus = false;
          }));
        }
      }
      html = "<div class=move><span id=count></span> <span id=timer>-" + conf['Interval'] + "</span></div>";
      checkbox = config.updater.checkbox;
      for (name in checkbox) {
        title = checkbox[name][1];
        checked = conf[name] ? 'checked' : '';
        html += "<div><label title='" + title + "'>" + name + "<input name='" + name + "' type=checkbox " + checked + "></label></div>";
      }
      checked = conf['Auto Update'] ? 'checked' : '';
      html += "      <div><label title='Controls whether *this* thread automatically updates or not'>Auto Update This<input name='Auto Update This' type=checkbox " + checked + "></label></div>      <div><label>Interval (s)<input name=Interval value=" + conf['Interval'] + " type=text></label></div>      <div><input value='Update Now' type=button></div>";
      dialog = ui.dialog('updater', 'bottom: 0; right: 0;', html);
      updater.count = $('#count', dialog);
      updater.timer = $('#timer', dialog);
      updater.br = $('br[clear]');
      _ref = $$('input', dialog);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        if (input.type === 'checkbox') {
          $.on(input, 'click', $.cb.checked);
          $.on(input, 'click', function() {
            return conf[this.name] = this.checked;
          });
          if (input.name === 'Verbose') {
            $.on(input, 'click', updater.cb.verbose);
            updater.cb.verbose.call(input);
          } else if (input.name === 'Auto Update This') {
            $.on(input, 'click', updater.cb.autoUpdate);
            updater.cb.autoUpdate.call(input);
          }
        } else if (input.name === 'Interval') {
          $.on(input, 'change', function() {
            return conf['Interval'] = this.value = parseInt(this.value) || conf['Interval'];
          });
          $.on(input, 'change', $.cb.value);
        } else if (input.type === 'button') {
          $.on(input, 'click', updater.update);
        }
      }
      return $.add(d.body, dialog);
    },
    cb: {
      verbose: function() {
        if (conf['Verbose']) {
          updater.count.textContent = '+0';
          return updater.timer.hidden = false;
        } else {
          $.extend(updater.count, {
            className: '',
            textContent: 'Thread Updater'
          });
          return updater.timer.hidden = true;
        }
      },
      autoUpdate: function() {
        if (this.checked) {
          return updater.timeoutID = setTimeout(updater.timeout, 1000);
        } else {
          return clearTimeout(updater.timeoutID);
        }
      },
      update: function() {
        var arr, body, id, input, replies, reply, scroll, _i, _len, _ref, _ref2;
        if (this.status === 404) {
          updater.timer.textContent = '';
          updater.count.textContent = 404;
          updater.count.className = 'error';
          clearTimeout(updater.timeoutID);
          _ref = $$('#com_submit');
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            input = _ref[_i];
            input.disabled = true;
            input.value = 404;
          }
          d.title = d.title.match(/.+-/)[0] + ' 404';
          g.dead = true;
          Favicon.update();
          return;
        }
        updater.timer.textContent = '-' + conf['Interval'];
        body = $.el('body', {
          innerHTML: this.responseText
        });
        if ($('title', body).textContent === '4chan - Banned') {
          updater.count.textContent = 'banned';
          updater.count.className = 'error';
          return;
        }
        replies = $$('.reply', body);
        id = Number(((_ref2 = $('td[id]', updater.br.previousElementSibling)) != null ? _ref2.id : void 0) || 0);
        arr = [];
        while ((reply = replies.pop()) && (reply.id > id)) {
          arr.push(reply.parentNode.parentNode.parentNode);
        }
        scroll = conf['Scrolling'] && updater.focus && arr.length && (d.body.scrollHeight - d.body.clientHeight - window.scrollY < 20);
        if (conf['Verbose']) {
          updater.count.textContent = '+' + arr.length;
          if (arr.length === 0) {
            updater.count.className = '';
          } else {
            updater.count.className = 'new';
          }
        }
        while (reply = arr.pop()) {
          $.before(updater.br, reply);
        }
        if (scroll) return scrollTo(0, d.body.scrollHeight);
      }
    },
    timeout: function() {
      var n;
      updater.timeoutID = setTimeout(updater.timeout, 1000);
      n = 1 + Number(updater.timer.textContent);
      if (n === 0) {
        return updater.update();
      } else if (n === 10) {
        return updater.retry();
      } else {
        return updater.timer.textContent = n;
      }
    },
    retry: function() {
      updater.count.textContent = 'retry';
      updater.count.className = '';
      return updater.update();
    },
    update: function() {
      var cb, url, _ref;
      updater.timer.textContent = 0;
      if ((_ref = updater.request) != null) _ref.abort();
      url = location.pathname + '?' + Date.now();
      cb = updater.cb.update;
      return updater.request = $.ajax(url, cb);
    }
  };

  watcher = {
    init: function() {
      var favicon, html, input, inputs, _i, _len;
      html = '<div class=move>Thread Watcher</div>';
      watcher.dialog = ui.dialog('watcher', 'top: 50px; left: 0px;', html);
      $.add(d.body, watcher.dialog);
      inputs = $$('.op input');
      for (_i = 0, _len = inputs.length; _i < _len; _i++) {
        input = inputs[_i];
        favicon = $.el('img', {
          className: 'favicon'
        });
        $.on(favicon, 'click', watcher.cb.toggle);
        $.before(input, favicon);
      }
      watcher.refresh();
      return $.on(window, 'storage', function(e) {
        if (e.key === ("" + NAMESPACE + "watched")) return watcher.refresh();
      });
    },
    refresh: function() {
      var board, div, favicon, id, link, props, watched, watchedBoard, x, _i, _j, _len, _len2, _ref, _ref2, _ref3, _results;
      watched = $.get('watched', {});
      _ref = $$('div:not(.move)', watcher.dialog);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        div = _ref[_i];
        $.rm(div);
      }
      for (board in watched) {
        _ref2 = watched[board];
        for (id in _ref2) {
          props = _ref2[id];
          div = $.el('div');
          x = $.el('a', {
            textContent: 'X'
          });
          $.on(x, 'click', watcher.cb.x);
          link = $.el('a', props);
          $.add(div, x, $.tn(' '), link);
          $.add(watcher.dialog, div);
        }
      }
      watchedBoard = watched[g.BOARD] || {};
      _ref3 = $$('img.favicon');
      _results = [];
      for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
        favicon = _ref3[_j];
        id = favicon.nextSibling.name;
        if (id in watchedBoard) {
          _results.push(favicon.src = Favicon["default"]);
        } else {
          _results.push(favicon.src = Favicon.empty);
        }
      }
      return _results;
    },
    cb: {
      toggle: function() {
        return watcher.toggle(this.parentNode);
      },
      x: function() {
        var board, id, _, _ref;
        _ref = this.nextElementSibling.getAttribute('href').substring(1).split('/'), board = _ref[0], _ = _ref[1], id = _ref[2];
        return watcher.unwatch(board, id);
      }
    },
    toggle: function(thread) {
      var favicon, id;
      favicon = $('img.favicon', thread);
      id = favicon.nextSibling.name;
      if (favicon.src === Favicon.empty) {
        return watcher.watch(thread, id);
      } else {
        return watcher.unwatch(g.BOARD, id);
      }
    },
    unwatch: function(board, id) {
      var watched;
      watched = $.get('watched', {});
      delete watched[board][id];
      $.set('watched', watched);
      return watcher.refresh();
    },
    watch: function(thread, id) {
      var props, text, watched, _name;
      text = getTitle(thread);
      props = {
        href: "/" + g.BOARD + "/res/" + id,
        textContent: text,
        title: text
      };
      watched = $.get('watched', {});
      watched[_name = g.BOARD] || (watched[_name] = {});
      watched[g.BOARD][id] = props;
      $.set('watched', watched);
      return watcher.refresh();
    }
  };

  anonymize = {
    init: function() {
      return g.callbacks.push(function(root) {
        var name, trip;
        name = $('.commentpostername, .postername', root);
        name.textContent = 'Anonymous';
        if (trip = $('.postertrip', root)) {
          if (trip.parentNode.nodeName === 'A') {
            return $.rm(trip.parentNode);
          } else {
            return $.rm(trip);
          }
        }
      });
    }
  };

  sauce = {
    init: function() {
      sauce.prefixes = conf['flavors'].match(/^[^#].+$/gm);
      sauce.names = sauce.prefixes.map(function(prefix) {
        return prefix.match(/(\w+)\./)[1];
      });
      return g.callbacks.push(function(root) {
        var i, link, prefix, span, suffix, thumb, _len, _ref, _results;
        if (root.className === 'inline' || !(thumb = $('img[md5]', root))) return;
        span = $('.filesize', root);
        suffix = thumb.src;
        _ref = sauce.prefixes;
        _results = [];
        for (i = 0, _len = _ref.length; i < _len; i++) {
          prefix = _ref[i];
          link = $.el('a', {
            textContent: sauce.names[i],
            href: prefix + suffix,
            target: '_blank'
          });
          _results.push($.add(span, $.tn(' '), link));
        }
        return _results;
      });
    }
  };

  revealSpoilers = {
    init: function() {
      return g.callbacks.push(function(root) {
        var board, img, imgID, _, _ref;
        if (!(img = $('img[alt^=Spoiler]', root)) || root.className === 'inline') {
          return;
        }
        img.removeAttribute('height');
        img.removeAttribute('width');
        _ref = img.parentNode.href.match(/(\w+)\/src\/(\d+)/), _ = _ref[0], board = _ref[1], imgID = _ref[2];
        return img.src = "http://0.thumbs.4chan.org/" + board + "/thumb/" + imgID + "s.jpg";
      });
    }
  };

  Time = {
    init: function() {
      var chanOffset;
      Time.foo();
      chanOffset = 5 - new Date().getTimezoneOffset() / 60;
      if ($.isDST()) chanOffset--;
      this.parse = Date.parse('10/11/11(Tue)18:53') ? function(node) {
        return new Date(Date.parse(node.textContent) + chanOffset * HOUR);
      } : function(node) {
        var day, hour, min, month, year, _, _ref;
        _ref = node.textContent.match(/(\d+)\/(\d+)\/(\d+)\(\w+\)(\d+):(\d+)/), _ = _ref[0], month = _ref[1], day = _ref[2], year = _ref[3], hour = _ref[4], min = _ref[5];
        year = "20" + year;
        month -= 1;
        hour = chanOffset + Number(hour);
        return new Date(year, month, day, hour, min);
      };
      return g.callbacks.push(Time.node);
    },
    node: function(root) {
      var node, posttime, time;
      if (root.className === 'inline') return;
      node = (posttime = $('.posttime', root)) ? posttime : $('span[id]', root).previousSibling;
      Time.date = Time.parse(node);
      time = $.el('time', {
        textContent: ' ' + Time.funk(Time) + ' '
      });
      return $.replace(node, time);
    },
    foo: function() {
      var code;
      code = conf['time'].replace(/%([A-Za-z])/g, function(s, c) {
        if (c in Time.formatters) {
          return "' + Time.formatters." + c + "() + '";
        } else {
          return s;
        }
      });
      return Time.funk = Function('Time', "return '" + code + "'");
    },
    day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    zeroPad: function(n) {
      if (n < 10) {
        return '0' + n;
      } else {
        return n;
      }
    },
    formatters: {
      a: function() {
        return Time.day[Time.date.getDay()].slice(0, 3);
      },
      A: function() {
        return Time.day[Time.date.getDay()];
      },
      b: function() {
        return Time.month[Time.date.getMonth()].slice(0, 3);
      },
      B: function() {
        return Time.month[Time.date.getMonth()];
      },
      d: function() {
        return Time.zeroPad(Time.date.getDate());
      },
      e: function() {
        return Time.date.getDate();
      },
      H: function() {
        return Time.zeroPad(Time.date.getHours());
      },
      I: function() {
        return Time.zeroPad(Time.date.getHours() % 12 || 12);
      },
      k: function() {
        return Time.date.getHours();
      },
      l: function() {
        return Time.date.getHours() % 12 || 12;
      },
      m: function() {
        return Time.zeroPad(Time.date.getMonth() + 1);
      },
      M: function() {
        return Time.zeroPad(Time.date.getMinutes());
      },
      p: function() {
        if (Time.date.getHours() < 12) {
          return 'AM';
        } else {
          return 'PM';
        }
      },
      P: function() {
        if (Time.date.getHours() < 12) {
          return 'am';
        } else {
          return 'pm';
        }
      },
      y: function() {
        return Time.date.getFullYear() - 2000;
      }
    }
  };

  getTitle = function(thread) {
    var el, span;
    el = $('.filetitle', thread);
    if (!el.textContent) {
      el = $('blockquote', thread);
      if (!el.textContent) el = $('.postername', thread);
    }
    span = $.el('span', {
      innerHTML: el.innerHTML.replace(/<br>/g, ' ')
    });
    return "/" + g.BOARD + "/ - " + span.textContent;
  };

  titlePost = {
    init: function() {
      return d.title = getTitle();
    }
  };

  quoteBacklink = {
    init: function() {
      var format;
      format = conf['backlink'].replace(/%id/, "' + id + '");
      quoteBacklink.funk = Function('id', "return'" + format + "'");
      return g.callbacks.push(function(root) {
        var a, container, el, id, link, qid, quote, quotes, _i, _len, _ref, _results;
        if (/\binline\b/.test(root.className)) return;
        quotes = {};
        _ref = $$('.quotelink', root);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          quote = _ref[_i];
          if (!(qid = quote.hash.slice(1))) continue;
          quotes[qid] = quote;
        }
        id = $('input', root).name;
        a = $.el('a', {
          href: "#" + id,
          className: root.hidden ? 'filtered backlink' : 'backlink',
          textContent: quoteBacklink.funk(id)
        });
        _results = [];
        for (qid in quotes) {
          if (!(el = $.id(qid))) continue;
          if (el.className === 'op' && !conf['OP Backlinks']) continue;
          link = a.cloneNode(true);
          if (conf['Quote Preview']) {
            $.on(link, 'mouseover', quotePreview.mouseover);
            $.on(link, 'mousemove', ui.hover);
            $.on(link, 'mouseout', quotePreview.mouseout);
          }
          if (conf['Quote Inline']) $.on(link, 'click', quoteInline.toggle);
          if (!((container = $('.container', el)) && container.parentNode === el)) {
            container = $.el('span', {
              className: 'container'
            });
            root = $('.reportbutton', el) || $('span[id]', el);
            $.after(root, container);
          }
          _results.push($.add(container, $.tn(' '), link));
        }
        return _results;
      });
    }
  };

  quoteInline = {
    init: function() {
      return g.callbacks.push(function(root) {
        var quote, _i, _len, _ref, _results;
        _ref = $$('.quotelink, .backlink', root);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          quote = _ref[_i];
          if (!quote.hash) continue;
          quote.removeAttribute('onclick');
          _results.push($.on(quote, 'click', quoteInline.toggle));
        }
        return _results;
      });
    },
    toggle: function(e) {
      var id;
      if (e.shiftKey || e.altKey || e.ctrlKey || e.button !== 0) return;
      e.preventDefault();
      id = this.hash.slice(1);
      if (/\binlined\b/.test(this.className)) {
        quoteInline.rm(this, id);
      } else {
        if ($.x("ancestor::*[@id='" + id + "']", this)) return;
        quoteInline.add(this, id);
      }
      return this.classList.toggle('inlined');
    },
    add: function(q, id) {
      var el, inline, pathname, root, threadID;
      root = q.parentNode.nodeName === 'FONT' ? q.parentNode : q.nextSibling ? q.nextSibling : q;
      if (el = $.id(id)) {
        inline = quoteInline.table(id, el.innerHTML);
        if (q.className === 'backlink') {
          $.after(q.parentNode, inline);
          $.x('ancestor::table', el).hidden = true;
          return;
        }
        return $.after(root, inline);
      } else {
        inline = $.el('td', {
          className: 'reply inline',
          id: "i" + id,
          innerHTML: "Loading " + id + "..."
        });
        $.after(root, inline);
        pathname = q.pathname;
        threadID = pathname.split('/').pop();
        return $.cache(pathname, (function() {
          return quoteInline.parse(this, pathname, id, threadID, inline);
        }));
      }
    },
    rm: function(q, id) {
      var inlined, table, _i, _len, _ref;
      table = $.x("following::*[@id='i" + id + "']", q);
      _ref = $$('.backlink.inlined:not(.filtered)', table);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        inlined = _ref[_i];
        $.x('ancestor::table', $.id(inlined.hash.slice(1))).hidden = false;
      }
      if (/\bbacklink\b/.test(q.className) && !/\bfiltered\b/.test(q.className)) {
        $.x('ancestor::table', $.id(id)).hidden = false;
      }
      return $.rm(table);
    },
    parse: function(req, pathname, id, threadID, inline) {
      var body, href, html, link, newInline, op, quote, reply, _i, _j, _len, _len2, _ref, _ref2;
      if (!inline.parentNode) return;
      if (req.status !== 200) {
        inline.innerHTML = "" + req.status + " " + req.statusText;
        return;
      }
      body = $.el('body', {
        innerHTML: req.responseText
      });
      if (id === threadID) {
        op = threading.op($('body > form', body).firstChild);
        html = op.innerHTML;
      } else {
        _ref = $$('td.reply', body);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          reply = _ref[_i];
          if (reply.id === id) {
            html = reply.innerHTML;
            break;
          }
        }
      }
      newInline = quoteInline.table(id, html);
      _ref2 = $$('.quotelink', newInline);
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        quote = _ref2[_j];
        if ((href = quote.getAttribute('href')) === quote.hash) {
          quote.pathname = pathname;
        } else if (!g.REPLY && href !== quote.href) {
          quote.href = "res/" + href;
        }
      }
      link = $('.quotejs', newInline);
      link.href = "" + pathname + "#" + id;
      link.nextSibling.href = "" + pathname + "#q" + id;
      $.addClass(newInline, 'crossquote');
      return $.replace(inline, newInline);
    },
    table: function(id, html) {
      return $.el('table', {
        className: 'inline',
        id: "i" + id,
        innerHTML: "<tbody><tr><td class=reply>" + html + "</td></tr></tbody>"
      });
    }
  };

  quotePreview = {
    init: function() {
      return g.callbacks.push(function(root) {
        var quote, _i, _len, _ref, _results;
        _ref = $$('.quotelink, .backlink', root);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          quote = _ref[_i];
          if (!quote.hash) continue;
          $.on(quote, 'mouseover', quotePreview.mouseover);
          $.on(quote, 'mousemove', ui.hover);
          _results.push($.on(quote, 'mouseout', quotePreview.mouseout));
        }
        return _results;
      });
    },
    mouseover: function(e) {
      var el, id, qp, quote, replyID, threadID, _i, _len, _ref, _results;
      qp = ui.el = $.el('div', {
        id: 'qp',
        className: 'replyhl'
      });
      $.add(d.body, qp);
      id = this.hash.slice(1);
      if (el = $.id(id)) {
        qp.innerHTML = el.innerHTML;
        if (conf['Quote Highlighting']) $.addClass(el, 'qphl');
        if (/\bbacklink\b/.test(this.className)) {
          replyID = $.x('preceding::input[1]', this).name;
          _ref = $$('.quotelink', qp);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            quote = _ref[_i];
            if (quote.hash.slice(1) === replyID) {
              _results.push(quote.className = 'forwardlink');
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      } else {
        qp.innerHTML = "Loading " + id + "...";
        threadID = this.pathname.split('/').pop() || $.x('ancestor::div[@class="thread"]/div', this).id;
        $.cache(this.pathname, (function() {
          return quotePreview.parse(this, id, threadID);
        }));
        return ui.hover(e);
      }
    },
    mouseout: function() {
      var el;
      if (el = $.id(this.hash.slice(1))) $.removeClass(el, 'qphl');
      return ui.hoverend();
    },
    parse: function(req, id, threadID) {
      var body, html, op, qp, reply, _i, _len, _ref;
      if (!((qp = ui.el) && (qp.innerHTML === ("Loading " + id + "...")))) return;
      if (req.status !== 200) {
        qp.innerHTML = "" + req.status + " " + req.statusText;
        return;
      }
      body = $.el('body', {
        innerHTML: req.responseText
      });
      if (id === threadID) {
        op = threading.op($('body > form', body).firstChild);
        html = op.innerHTML;
      } else {
        _ref = $$('td.reply', body);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          reply = _ref[_i];
          if (reply.id === id) {
            html = reply.innerHTML;
            break;
          }
        }
      }
      qp.innerHTML = html;
      return Time.node(qp);
    }
  };

  quoteOP = {
    init: function() {
      return g.callbacks.push(function(root) {
        var quote, tid, _i, _len, _ref, _results;
        if (root.className === 'inline') return;
        tid = g.THREAD_ID || $.x('ancestor::div[contains(@class,"thread")]/div', root).id;
        _ref = $$('.quotelink', root);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          quote = _ref[_i];
          if (quote.hash.slice(1) === tid) {
            _results.push(quote.innerHTML += '&nbsp;(OP)');
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    }
  };

  reportButton = {
    init: function() {
      return g.callbacks.push(function(root) {
        var a, span;
        if (!(a = $('.reportbutton', root))) {
          span = $('span[id]', root);
          a = $.el('a', {
            className: 'reportbutton',
            innerHTML: '[&nbsp;!&nbsp;]'
          });
          $.after(span, a);
          $.after(span, $.tn(' '));
        }
        return $.on(a, 'click', reportButton.report);
      });
    },
    report: function() {
      var id, set, url;
      url = "http://sys.4chan.org/" + g.BOARD + "/imgboard.php?mode=report&no=" + ($.x('preceding-sibling::input', this).name);
      id = "" + NAMESPACE + "popup";
      set = "toolbar=0,scrollbars=0,location=0,status=1,menubar=0,resizable=1,width=685,height=200";
      return window.open(url, id, set);
    }
  };

  threadStats = {
    init: function() {
      var dialog, html;
      threadStats.posts = 1;
      threadStats.images = $('.op img[md5]') ? 1 : 0;
      html = "<div class=move><span id=postcount>" + threadStats.posts + "</span> / <span id=imagecount>" + threadStats.images + "</span></div>";
      dialog = ui.dialog('stats', 'bottom: 0; left: 0;', html);
      dialog.className = 'dialog';
      threadStats.postcountEl = $('#postcount', dialog);
      threadStats.imagecountEl = $('#imagecount', dialog);
      $.add(d.body, dialog);
      return g.callbacks.push(threadStats.node);
    },
    node: function(root) {
      if (root.className) return;
      threadStats.postcountEl.textContent = ++threadStats.posts;
      if ($('img[md5]', root)) {
        threadStats.imagecountEl.textContent = ++threadStats.images;
        if (threadStats.images > 150) {
          return threadStats.imagecountEl.className = 'error';
        }
      }
    }
  };

  unread = {
    init: function() {
      unread.replies = [];
      d.title = '(0) ' + d.title;
      $.on(window, 'scroll', unread.scroll);
      return g.callbacks.push(unread.node);
    },
    node: function(root) {
      if (root.hidden || root.className) return;
      unread.replies.push(root);
      unread.updateTitle();
      if (unread.replies.length === 1) return Favicon.update();
    },
    scroll: function() {
      var bottom, height, i, reply, _len, _ref;
      updater.focus = true;
      height = d.body.clientHeight;
      _ref = unread.replies;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        reply = _ref[i];
        bottom = reply.getBoundingClientRect().bottom;
        if (bottom > height) break;
      }
      if (i === 0) return;
      unread.replies = unread.replies.slice(i);
      unread.updateTitle();
      if (unread.replies.length === 0) return Favicon.update();
    },
    updateTitle: function() {
      return d.title = d.title.replace(/\d+/, unread.replies.length);
    }
  };

  Favicon = {
    init: function() {
      var favicon, href;
      favicon = $('link[rel="shortcut icon"]', d.head);
      favicon.type = 'image/x-icon';
      href = favicon.href;
      Favicon["default"] = href;
      return Favicon.unread = /ws/.test(href) ? Favicon.unreadSFW : Favicon.unreadNSFW;
    },
    dead: 'data:image/gif;base64,R0lGODlhEAAQAKECAAAAAP8AAP///////yH5BAEKAAIALAAAAAAQABAAAAIvlI+pq+D9DAgUoFkPDlbs7lFZKIJOJJ3MyraoB14jFpOcVMpzrnF3OKlZYsMWowAAOw==',
    empty: 'data:image/gif;base64,R0lGODlhEAAQAJEAAAAAAP///9vb2////yH5BAEAAAMALAAAAAAQABAAAAIvnI+pq+D9DBAUoFkPFnbs7lFZKIJOJJ3MyraoB14jFpOcVMpzrnF3OKlZYsMWowAAOw==',
    unreadDead: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAANhJREFUOMutU0EKwjAQzEPFgyBFei209gOKINh6tL3qO3yAB9OHWPTeMZsmJaRpiNjAkE1mMt1stgwA+wdsFgM1oHE4FXmSpWUcRzWBYtozNfKAYdCHCrQuosX9tlk+CBS7NKMMbMF7vXoJtC7Om8HwhXzbCWCSn6qBJHd74FIBVS1jm7czYFSsq7gvpY0s6+ThJwc4743EHnGkIW2YAW+AphkMPj6DJE1LXW3fFUhD2pHBsTznLKCIFCstC3nGNvQZnQa6kX4yMGfdyi7OZaB7wZy93Cx/4xfgv/s+XYFMrAAAAABJRU5ErkJggg%3D%3D',
    unreadSFW: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAN9JREFUOMtj+P//PwMlmIEqBkDBfxie2NdVVVFaMikzPXsuCIPYIDFkNWANSAb815t+GI5B/Jj8iQfjapafBWEQG5saDBegK0ja8Ok9EH/AJofXBTBFlUf+/wPi/7jkcYYBCLef/v9/9pX//+cAMYiNLo/uAgZQYMVVLzsLcnYF0GaQ5otv/v+/9BpiEEgMJAdSA1JLlAGXgAZcfoNswGfcBpQDowoW2vi8AFIDUothwOQJvVXIgYUrEEFsqFoGYqLxA7HRiNUAWEIiyQBkGpaUsclhMwCWFpBpvHJUyY0AmdYZKFRtAsoAAAAASUVORK5CYII%3D',
    unreadNSFW: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAOBJREFUOMtj+P//PwMlmIEqBkDBfxie2DWxqqykYlJ6dtZcEAaxQWLIasAakAz4n3bGGI5B/JiJ8QfjlsefBWEQG5saDBegKyj5lPQeiD9gk8PrApiinv+V/4D4Py55nGEAwrP+t/9f/X82EM8Bs9Hl0V3AAAqsuGXxZ0HO7vlf8Q+k+eb/i0B8CWwQSAwkB1IDUkuUAbeAmm/9v4ww4DMeA8pKyifBQhufF0BqQGoxDJjcO7kKObBwBSKIDVXLQEw0fiA2GrEaAEtIJBmATMOSMjY5bAbA0gIyjVeOKrkRAMefDK/b7ecEAAAAAElFTkSuQmCC',
    update: function() {
      var clone, favicon, l;
      l = unread.replies.length;
      favicon = $('link[rel="shortcut icon"]', d.head);
      favicon.href = g.dead ? l ? Favicon.unreadDead : Favicon.dead : l ? Favicon.unread : Favicon["default"];
      clone = favicon.cloneNode(true);
      return $.replace(favicon, clone);
    }
  };

  redirect = function() {
    var url;
    switch (g.BOARD) {
      case 'a':
      case 'jp':
      case 'm':
      case 'tg':
      case 'tv':
        url = "http://archive.foolz.us/" + g.BOARD + "/thread/" + g.THREAD_ID;
        break;
      case 'lit':
        url = "http://archive.gentoomen.org/cgi-board.pl/" + g.BOARD + "/thread/" + g.THREAD_ID;
        break;
      case 'diy':
      case 'g':
      case 'sci':
        url = "http://archive.installgentoo.net/" + g.BOARD + "/thread/" + g.THREAD_ID;
        break;
      case '3':
      case 'adv':
      case 'an':
      case 'ck':
      case 'co':
      case 'fa':
      case 'fit':
      case 'int':
      case 'k':
      case 'mu':
      case 'n':
      case 'o':
      case 'p':
      case 'po':
      case 'pol':
      case 'soc':
      case 'sp':
      case 'toy':
      case 'trv':
      case 'v':
      case 'vp':
      case 'x':
        url = "http://archive.no-ip.org/" + g.BOARD + "/thread/" + g.THREAD_ID;
        break;
      default:
        url = "http://boards.4chan.org/" + g.BOARD;
    }
    return location.href = url;
  };

  imgHover = {
    init: function() {
      return g.callbacks.push(function(root) {
        var thumb;
        if (!(thumb = $('img[md5]', root))) return;
        $.on(thumb, 'mouseover', imgHover.mouseover);
        $.on(thumb, 'mousemove', ui.hover);
        return $.on(thumb, 'mouseout', ui.hoverend);
      });
    },
    mouseover: function() {
      ui.el = $.el('img', {
        id: 'iHover',
        src: this.parentNode.href
      });
      return $.add(d.body, ui.el);
    }
  };

  imgPreloading = {
    init: function() {
      var controls, form, label;
      if (!(controls = $.id('imgControls'))) {
        controls = $.el('div', {
          id: 'imgControls'
        });
        form = $('body > form');
        $.prepend(form, controls);
      }
      label = $.el('label', {
        innerHTML: 'Preload Images<input type=checkbox id=imagePreload>'
      });
      $.on($('input', label), 'click', imgPreloading.click);
      $.add(controls, label);
      return g.callbacks.push(imgPreloading.node);
    },
    click: function() {
      var thumb, _i, _len, _ref, _results;
      if (imgPreloading.on = this.checked) {
        _ref = $$('.op > a > img[md5]:last-child, table:not([hidden]) img[md5]:last-child');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          thumb = _ref[_i];
          _results.push(imgPreloading.preload(thumb));
        }
        return _results;
      }
    },
    node: function(root) {
      var thumb;
      if (!imgPreloading.on || root.hidden || !(thumb = $('img[md5]:last-child', root))) {
        return;
      }
      return imgPreloading.preload(thumb);
    },
    preload: function(thumb) {
      return $.el('img', {
        src: thumb.parentNode.href
      });
    }
  };

  imgGif = {
    init: function() {
      return g.callbacks.push(function(root) {
        var src, thumb;
        if (!(thumb = $('img[md5]', root))) return;
        src = thumb.parentNode.href;
        if (/gif$/.test(src)) return thumb.src = src;
      });
    }
  };

  imgExpand = {
    init: function() {
      g.callbacks.push(imgExpand.node);
      return imgExpand.dialog();
    },
    node: function(root) {
      var a, thumb;
      if (!(thumb = $('img[md5]', root))) return;
      a = thumb.parentNode;
      $.on(a, 'click', imgExpand.cb.toggle);
      if (imgExpand.on && !root.hidden && root.className !== 'inline') {
        return imgExpand.expand(a.firstChild);
      }
    },
    cb: {
      toggle: function(e) {
        if (e.shiftKey || e.altKey || e.ctrlKey || e.button !== 0) return;
        e.preventDefault();
        return imgExpand.toggle(this);
      },
      all: function() {
        var thumb, _i, _j, _len, _len2, _ref, _ref2, _results, _results2;
        imgExpand.on = this.checked;
        if (imgExpand.on) {
          _ref = $$('.op > a > img[md5]:last-child, table:not([hidden]) img[md5]:last-child');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            thumb = _ref[_i];
            _results.push(imgExpand.expand(thumb));
          }
          return _results;
        } else {
          _ref2 = $$('img[md5][hidden]');
          _results2 = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            thumb = _ref2[_j];
            _results2.push(imgExpand.contract(thumb));
          }
          return _results2;
        }
      },
      typeChange: function() {
        var form, klass;
        switch (this.value) {
          case 'full':
            klass = '';
            break;
          case 'fit width':
            klass = 'fitwidth';
            break;
          case 'fit height':
            klass = 'fitheight';
            break;
          case 'fit screen':
            klass = 'fitwidth fitheight';
        }
        form = $('body > form');
        form.className = klass;
        if (/\bfitheight\b/.test(form.className)) {
          $.on(window, 'resize', imgExpand.resize);
          if (!imgExpand.style) imgExpand.style = $.addStyle('');
          return imgExpand.resize();
        } else if (imgExpand.style) {
          return $.off(window, 'resize', imgExpand.resize);
        }
      }
    },
    toggle: function(a) {
      var thumb;
      thumb = a.firstChild;
      if (thumb.hidden) {
        return imgExpand.contract(thumb);
      } else {
        return imgExpand.expand(thumb);
      }
    },
    contract: function(thumb) {
      thumb.hidden = false;
      return $.rm(thumb.nextSibling);
    },
    expand: function(thumb) {
      var a, filesize, img, max, _, _ref;
      a = thumb.parentNode;
      img = $.el('img', {
        src: a.href
      });
      if (a.parentNode.className !== 'op') {
        filesize = $('.filesize', a.parentNode);
        _ref = filesize.textContent.match(/(\d+)x/), _ = _ref[0], max = _ref[1];
        img.style.maxWidth = "-moz-calc(" + max + "px)";
      }
      $.on(img, 'error', imgExpand.error);
      thumb.hidden = true;
      return $.add(a, img);
    },
    error: function() {
      var req, thumb;
      thumb = this.previousSibling;
      imgExpand.contract(thumb);
      if (navigator.appName !== 'Opera') {
        req = $.ajax(this.src, null, 'head');
        return req.onreadystatechange = function() {
          if (this.status !== 404) {
            return setTimeout(imgExpand.retry, 10000, thumb);
          }
        };
      } else if (!g.dead) {
        return setTimeout(imgExpand.retry, 10000, thumb);
      }
    },
    retry: function(thumb) {
      if (!thumb.hidden) return imgExpand.expand(thumb);
    },
    dialog: function() {
      var controls, form, imageType, option, select, _i, _len, _ref;
      controls = $.el('div', {
        id: 'imgControls',
        innerHTML: "<select id=imageType name=imageType><option>full</option><option>fit width</option><option>fit height</option><option>fit screen</option></select>        <label>Expand Images<input type=checkbox id=imageExpand></label>"
      });
      imageType = $.get('imageType', 'full');
      _ref = $$('option', controls);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        if (option.textContent === imageType) {
          option.selected = true;
          break;
        }
      }
      select = $('select', controls);
      imgExpand.cb.typeChange.call(select);
      $.on(select, 'change', $.cb.value);
      $.on(select, 'change', imgExpand.cb.typeChange);
      $.on($('input', controls), 'click', imgExpand.cb.all);
      form = $('body > form');
      return $.prepend(form, controls);
    },
    resize: function() {
      return imgExpand.style.innerHTML = ".fitheight img + img {max-height:" + d.body.clientHeight + "px;}";
    }
  };

  firstRun = {
    init: function() {
      var dialog, style;
      style = $.addStyle("      #navtopr, #navbotr {        position: relative;      }      #navtopr::before {        content: '';        height: 50px;        width: 100px;        background: red;        -webkit-transform: rotate(-45deg);        -moz-transform: rotate(-45deg);        -o-transform: rotate(-45deg);        -webkit-transform-origin: 100% 200%;        -moz-transform-origin: 100% 200%;        -o-transform-origin: 100% 200%;        position: absolute;        top: 100%;        right: 100%;        z-index: 999;      }      #navtopr::after {        content: '';        border-top: 100px solid red;        border-left: 100px solid transparent;        position: absolute;        top: 100%;        right: 100%;        z-index: 999;      }      #navbotr::before {        content: '';        height: 50px;        width: 100px;        background: red;        -webkit-transform: rotate(45deg);        -moz-transform: rotate(45deg);        -o-transform: rotate(45deg);        -webkit-transform-origin: 100% -100%;        -moz-transform-origin: 100% -100%;        -o-transform-origin: 100% -100%;        position: absolute;        bottom: 100%;        right: 100%;        z-index: 999;      }      #navbotr::after {        content: '';        border-bottom: 100px solid red;        border-left: 100px solid transparent;        position: absolute;        bottom: 100%;        right: 100%;        z-index: 999;      }    ");
      style.className = 'firstrun';
      dialog = $.el('div', {
        id: 'overlay',
        className: 'firstrun',
        innerHTML: '\
<div id=options class="reply dialog">\
  <p>Click the <strong>4chan X</strong> buttons for options; they are at the top and bottom of the page.</p>\
  <p>Updater options are in the updater dialog in replies at the bottom-right corner of the window.</p>\
  <p>If you don\'t see the buttons, try disabling your userstyles.</p>\
</div>'
      });
      $.add(d.body, dialog);
      return $.on(window, 'click', firstRun.close);
    },
    close: function() {
      $.set('firstrun', true);
      $.rm($('style.firstrun', d.head));
      $.rm($('#overlay'));
      return $.off(window, 'click', firstRun.close);
    }
  };

  Main = {
    init: function() {
      var cutoff, hiddenThreads, id, lastChecked, now, pathname, temp, timestamp, _ref;
      g.XHR2 = typeof FormData !== "undefined" && FormData !== null;
      if (location.hostname === 'sys.4chan.org') {
        if (d.body) {
          Post.sys();
        } else {
          $.on(d, 'DOMContentLoaded', Post.sys);
        }
        return;
      }
      $.on(window, 'message', Main.message);
      pathname = location.pathname.substring(1).split('/');
      g.BOARD = pathname[0], temp = pathname[1];
      if (temp === 'res') {
        g.REPLY = temp;
        g.THREAD_ID = pathname[2];
      } else {
        g.PAGENUM = parseInt(temp) || 0;
      }
      g.hiddenReplies = $.get("hiddenReplies/" + g.BOARD + "/", {});
      lastChecked = $.get('lastChecked', 0);
      now = Date.now();
      Main.reqUpdate = lastChecked < now - 1 * DAY;
      if (Main.reqUpdate) {
        $.set('lastChecked', now);
        cutoff = now - 7 * DAY;
        hiddenThreads = $.get("hiddenThreads/" + g.BOARD + "/", {});
        for (id in hiddenThreads) {
          timestamp = hiddenThreads[id];
          if (timestamp < cutoff) delete hiddenThreads[id];
        }
        _ref = g.hiddenReplies;
        for (id in _ref) {
          timestamp = _ref[id];
          if (timestamp < cutoff) delete g.hiddenReplies[id];
        }
        $.set("hiddenThreads/" + g.BOARD + "/", hiddenThreads);
        $.set("hiddenReplies/" + g.BOARD + "/", g.hiddenReplies);
      }
      if (conf['Filter']) filter.init();
      if (conf['Reply Hiding']) replyHiding.init();
      if (conf['Filter'] || conf['Reply Hiding']) strikethroughQuotes.init();
      if (conf['Anonymize']) anonymize.init();
      if (conf['Time Formatting']) Time.init();
      if (conf['Sauce']) sauce.init();
      if (conf['Image Auto-Gif']) imgGif.init();
      if (conf['Image Hover']) imgHover.init();
      if (conf['Report Button']) reportButton.init();
      if (conf['Quote Inline']) quoteInline.init();
      if (conf['Quote Preview']) quotePreview.init();
      if (conf['Quote Backlinks']) quoteBacklink.init();
      if (conf['Indicate OP quote']) quoteOP.init();
      if (d.body) {
        return Main.onLoad();
      } else {
        return $.on(d, 'DOMContentLoaded', Main.onLoad);
      }
    },
    onLoad: function() {
      var nodes;
      $.off(d, 'DOMContentLoaded', Main.onLoad);
      if (conf['404 Redirect'] && d.title === '4chan - 404' && /^\d+$/.test(g.THREAD_ID)) {
        redirect();
        return;
      }
      if (!$('#navtopr')) return;
      Main.globalMessage();
      $.addStyle(Main.css);
      threading.init();
      Favicon.init();
      if (conf['Image Expansion']) imgExpand.init();
      if (conf['Reveal Spoilers'] && $('.postarea label')) revealSpoilers.init();
      if (conf['Quick Reply']) Post.init();
      if (conf['Thread Watcher']) watcher.init();
      if (conf['Keybinds']) keybinds.init();
      if (g.REPLY) {
        if (conf['Thread Updater']) updater.init();
        if (conf['Thread Stats']) threadStats.init();
        if (conf['Image Preloading']) imgPreloading.init();
        if (conf['Reply Navigation']) nav.init();
        if (conf['Post in Title']) titlePost.init();
        if (conf['Unread Count']) unread.init();
      } else {
        if (conf['Thread Hiding']) threadHiding.init();
        if (conf['Thread Expansion']) expandThread.init();
        if (conf['Comment Expansion']) expandComment.init();
        if (conf['Index Navigation']) nav.init();
      }
      nodes = $$('.op, a + table');
      g.callbacks.forEach(function(callback) {
        try {
          return nodes.forEach(callback);
        } catch (err) {
          return alert(err);
        }
      });
      $.on($('form[name=delform]'), 'DOMNodeInserted', Main.node);
      options.init();
      if (!$.get('firstrun')) return firstRun.init();
    },
    globalMessage: function() {
      /*
          http://code.google.com/p/chromium/issues/detail?id=20773
          Let content scripts see other frames (instead of them being undefined)
      
          To access the parent, we have to break out of the sandbox and evaluate
          in the global context.
      */      return $.globalEval(function() {
        return window.addEventListener('message', function(e) {
          var data;
          data = e.data;
          if (data.to === 'sys') {
            return document.getElementById('iframe').contentWindow.postMessage(data, '*');
          }
        }, false);
      });
    },
    message: function(e) {
      var data, to;
      data = e.data;
      to = data.to;
      switch (to) {
        case 'Post.message':
          return Post.message(data);
      }
    },
    node: function(e) {
      var target;
      target = e.target;
      if (target.nodeName !== 'TABLE') return;
      return g.callbacks.forEach(function(callback) {
        try {
          return callback(target);
        } catch (err) {

        }
      });
    },
    css: '\
      /* dialog styling */\
      div.dialog {\
        border: 1px solid;\
      }\
      div.dialog > div.move {\
        cursor: move;\
      }\
      label, a, .favicon {\
        cursor: pointer;\
      }\
\
      .new {\
        background: lime;\
      }\
      .error {\
        color: red;\
      }\
      td.replyhider {\
        vertical-align: top;\
      }\
\
      div.thread.stub > *:not(.block) {\
        display: none;\
      }\
\
      .filesize + br + a {\
        float: left;\
        pointer-events: none;\
      }\
      img[md5], img + img {\
        pointer-events: all;\
      }\
      .fitwidth img + img {\
        max-width: 100%;\
        width: -moz-calc(100%); /* hack so only firefox sees this */\
      }\
\
      #qp, #iHover {\
        position: fixed;\
      }\
\
      #iHover {\
        max-height: 100%;\
      }\
\
      #navlinks {\
        font-size: 16px;\
        position: fixed;\
        top: 25px;\
        right: 5px;\
      }\
\
      #overlay {\
        position: fixed;\
        top: 0;\
        left: 0;\
        height: 100%;\
        width: 100%;\
        text-align: center;\
        background: rgba(0,0,0,.5);\
      }\
      #overlay::before {\
        content: "";\
        display: inline-block;\
        height: 100%;\
        vertical-align: middle;\
      }\
      #options {\
        display: inline-block;\
        padding: 5px;\
        text-align: left;\
        vertical-align: middle;\
        width: 500px;\
      }\
      #credits {\
        float: right;\
      }\
      #options ul {\
        list-style: none;\
        padding: 0;\
      }\
      #options label {\
        text-decoration: underline;\
      }\
      #options [name=tab]:not(:checked) + * {\
        display: none;\
      }\
      #content > * {\
        height: 450px;\
        overflow: auto;\
      }\
      #content textarea {\
        margin: 0;\
        min-height: 100px;\
        resize: vertical;\
        width: 100%;\
      }\
\
      #updater {\
        position: fixed;\
        text-align: right;\
      }\
      #updater input[type=text] {\
        width: 50px;\
      }\
      #updater:not(:hover) {\
        border: none;\
        background: transparent;\
      }\
      #updater:not(:hover) > div:not(.move) {\
        display: none;\
      }\
\
      #stats {\
        border: none;\
        position: fixed;\
      }\
\
      #watcher {\
        position: absolute;\
      }\
      #watcher > div {\
        overflow: hidden;\
        padding-right: 5px;\
        padding-left: 5px;\
        text-overflow: ellipsis;\
        max-width: 200px;\
        white-space: nowrap;\
      }\
      #watcher > div.move {\
        text-decoration: underline;\
        padding-top: 5px;\
      }\
      #watcher > div:last-child {\
        padding-bottom: 5px;\
      }\
\
      #qp {\
        border: 1px solid;\
        padding-bottom: 5px;\
      }\
      #qp input, #qp .inline {\
        display: none;\
      }\
      .qphl {\
        outline: 2px solid rgba(216, 94, 49, .7);\
      }\
      .inlined {\
        opacity: .5;\
      }\
      .inline td.reply {\
        background-color: rgba(255, 255, 255, 0.15);\
        border: 1px solid rgba(128, 128, 128, 0.5);\
      }\
      .filetitle, .replytitle, .postername, .commentpostername, .postertrip {\
        background: none;\
      }\
      .filtered {\
        text-decoration: line-through;\
      }\
\
      /* Firefox bug: hidden tables are not hidden. fixed in 9.0 */\
      [hidden] {\
        display: none;\
      }\
\
      #files > input {\
        display: block;\
      }\
      #qr > .move {\
        text-align: right;\
      }\
      #qr textarea {\
        border: 0;\
        height: 150px;\
        width: 100%;\
      }\
      #qr #files {\
        width: 300px;\
        white-space: nowrap;\
        overflow: auto;\
        margin: 0;\
        padding: 0;\
      }\
      #qr #files a {\
        position: absolute;\
        left: 0;\
        font-size: 50px;\
        color: red;\
        z-index: 1;\
      }\
      #qr #cl {\
        right: 0;\
        padding: 2px;\
        position: absolute;\
      }\
      #qr #files input {\
        /* cannot use `display: none;`\
        https://bugs.webkit.org/show_bug.cgi?id=58208\
        http://code.google.com/p/chromium/issues/detail?id=78961\
        */\
        font-size: 100px;\
        opacity: 0;\
      }\
      #qr #files img {\
        position: absolute;\
        left: 0;\
        max-height: 100px;\
        max-width:  100px;\
      }\
      #qr button + input[type=file] {\
        position: absolute;\
        opacity: 0;\
        pointer-events: none;\
      }\
      #qr .wat {\
        display: inline-block;\
        width: 16px;\
        overflow: hidden;\
        position: relative;\
        vertical-align: text-top;\
      }\
      #qr .wat input {\
        opacity: 0;\
        position: absolute;\
        left: 0;\
      }\
\
      #post {\
        position: fixed;\
      }\
      #post ul {\
        margin: 0;\
        padding: 0;\
        width: 300px;\
        overflow: auto;\
        white-space: nowrap;\
      }\
      #post li {\
        display: inline-block;\
        position: relative;\
        overflow: hidden;\
        width: 100px;\
        height: 100px;\
      }\
      #post #items .close {\
        position: absolute;\
        color: red;\
        font-size: 14pt;\
        z-index: 1;\
      }\
      #items img {\
        max-height: 100px;\
        max-width: 100px;\
        position: absolute;\
      }\
      #post #foo input {\
        width: 95px;\
      }\
      #post form {\
        margin: 0;\
      }\
      #post textarea {\
        border: 0;\
        margin: 0;\
        padding: 0;\
        width: 300px;\
        height: 150px;\
      }\
      #post #recaptcha_response_field {\
        width: 100%;\
      }\
      #post #items input {\
        /* cannot use `display: none;`\
        https://bugs.webkit.org/show_bug.cgi?id=58208\
        http://code.google.com/p/chromium/issues/detail?id=78961\
        */\
        font-size: 100px;\
        opacity: 0;\
      }\
      #post .close, #post #autohide {\
        float: right;\
      }\
      #post .autohide {\
        clear: both;\
      }\
      #post:not(:hover) #autohide:checked ~ .autohide {\
        height: 0;\
        overflow: hidden;\
      }\
      #post #reholder {\
        position: relative;\
      }\
      #post #charCount {\
        position: absolute;\
        right: 25px;\
        top: 5px;\
      }\
      #post #fileSpan {\
        position: absolute;\
        right: 5px;\
        top: 5px;\
        width: 16px;\
        height: 16px;\
        overflow: hidden;\
      }\
      #fileSpan img {\
        position: absolute;\
      }\
      #fileSpan input {\
        opacity: 0;\
        margin: 0;\
      }\
    '
  };

  Main.init();

}).call(this);
