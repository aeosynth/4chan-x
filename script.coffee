config =
  main:
    Enhancing:
      '404 Redirect':       [true,  'Redirect dead threads']
      'Keybinds':           [true,  'Binds actions to keys']
      'Time Formatting':    [true,  'Arbitrarily formatted timestamps, using your local time']
      'Report Button':      [true,  'Add report buttons']
      'Comment Expansion':  [true,  'Expand too long comments']
      'Thread Expansion':   [true,  'View all replies']
      'Index Navigation':   [true,  'Navigate to previous / next thread']
      'Reply Navigation':   [false, 'Navigate to top / bottom of thread']
    Filtering:
      'Anonymize':          [false, 'Make everybody anonymous']
      'Filter':             [false, 'Self-moderation placebo']
      'Filter OPs':         [false, 'Filter OPs along with their threads']
      'Reply Hiding':       [true,  'Hide single replies']
      'Thread Hiding':      [true,  'Hide entire threads']
      'Show Stubs':         [true,  'Of hidden threads / replies']
    Imaging:
      'Image Auto-Gif':     [false, 'Animate gif thumbnails']
      'Image Expansion':    [true,  'Expand images']
      'Image Hover':        [false, 'Show full image on mouseover']
      'Image Preloading':   [false, 'Preload Images']
      'Sauce':              [true,  'Add sauce to images']
      'Reveal Spoilers':    [false, 'Replace spoiler thumbnails by the original thumbnail']
    Monitoring:
      'Thread Updater':     [false,  'Update threads. Has more options in its own dialog.']
      'Unread Count':       [true,  'Show unread post count in tab title']
      'Post in Title':      [true,  'Show the op\'s post in the tab title']
      'Thread Stats':       [true,  'Display reply and image count']
      'Thread Watcher':     [true,  'Bookmark threads']
      'Auto Watch':         [true,  'Automatically watch threads that you start']
      'Auto Watch Reply':   [false, 'Automatically watch threads that you reply to']
    Posting:
      'Cooldown':           [true,  'Prevent `flood detected` errors']
      'Quick Reply':        [true,  'Reply without leaving the page']
      'Persistent QR':      [false, 'Quick reply won\'t disappear after posting. Only in replies.']
      'Auto Hide QR':       [true,  'Automatically auto-hide the quick reply when posting']
      'Remember Spoiler':   [false, 'Remember the spoiler state, instead of resetting after posting']
    Quoting:
      'Quote Backlinks':    [true,  'Add quote backlinks']
      'OP Backlinks':       [false, 'Add backlinks to the OP']
      'Quote Highlighting': [true,  'Highlight the previewed post']
      'Quote Inline':       [true,  'Show quoted post inline on quote click']
      'Quote Preview':      [true,  'Show quote content on hover']
      'Indicate OP quote':  [true,  'Add \'(OP)\' to OP quotes']
  filter:
    name: ''
    trip: ''
    mail: ''
    sub:  ''
    com:  ''
    file: ''
    md5:  ''
  flavors: [
    'http://iqdb.org/?url='
    'http://google.com/searchbyimage?image_url='
    '#http://tineye.com/search?url='
    '#http://saucenao.com/search.php?db=999&url='
    '#http://imgur.com/upload?url='
  ].join '\n'
  time: '%m/%d/%y(%a)%H:%M'
  backlink: '>>%id'
  hotkeys:
    close:           'Esc'
    spoiler:         'ctrl+s'
    openQR:          'i'
    openEmptyQR:     'I'
    submit:          'alt+s'
    nextReply:       'J'
    previousReply:   'K'
    nextThread:      'n'
    previousThread:  'p'
    nextPage:        'L'
    previousPage:    'H'
    zero:            '0'
    openThreadTab:   'o'
    openThread:      'O'
    expandThread:    'e'
    watch:           'w'
    hide:            'x'
    expandImages:    'm'
    expandAllImages: 'M'
    update:          'u'
    unreadCountTo0:  'z'
  updater:
    checkbox:
      'Scrolling':    [false, 'Scroll updated posts into view. Only enabled at bottom of page.']
      'Scroll BG':    [false, 'Scroll background tabs']
      'Verbose':      [true,  'Show countdown timer, new post count']
      'Auto Update':  [true,  'Automatically fetch new posts']
    'Interval': 30

# XXX chrome can't into `{log} = console`
if console?
  # XXX scriptish - console.log.apply is not a function
  # https://github.com/scriptish/scriptish/issues/3
  log = (arg) ->
    console.log arg

# XXX opera cannot into Object.keys
if not Object.keys
  Object.keys = (o) ->
    key for key of o

# flatten the config
conf = {}
(flatten = (parent, obj) ->
  if obj.length #array
    if typeof obj[0] is 'boolean'
      conf[parent] = obj[0]
    else
      conf[parent] = obj
  else if typeof obj is 'object'
    for key, val of obj
      flatten key, val
  else #constant
    conf[parent] = obj
) null, config

NAMESPACE = 'AEOS.4chan_x.'
SECOND = 1000
MINUTE = 60*SECOND
HOUR   = 60*MINUTE
DAY    = 24*HOUR
d = document
g = callbacks: []

ui =
  dialog: (id, position, html) ->
    el = d.createElement 'div'
    el.className = 'reply dialog'
    el.innerHTML = html
    el.id = id
    el.style.cssText = if saved = localStorage["#{NAMESPACE}#{id}.position"] then saved else position
    el.querySelector('div.move')?.addEventListener 'mousedown', ui.dragstart, false
    el
  dragstart: (e) ->
    #prevent text selection
    e.preventDefault()
    ui.el = el = @parentNode
    d.addEventListener 'mousemove', ui.drag, false
    d.addEventListener 'mouseup',   ui.dragend, false
    #distance from pointer to el edge is constant; calculate it here.
    # XXX opera reports el.offsetLeft / el.offsetTop as 0
    rect = el.getBoundingClientRect()
    ui.dx = e.clientX - rect.left
    ui.dy = e.clientY - rect.top
    #factor out el from document dimensions
    ui.width  = d.body.clientWidth  - el.offsetWidth
    ui.height = d.body.clientHeight - el.offsetHeight
  drag: (e) ->
    left = e.clientX - ui.dx
    top = e.clientY - ui.dy
    left =
      if left < 10 then 0
      else if ui.width - left < 10 then null
      else left
    top =
      if top < 10 then 0
      else if ui.height - top < 10 then null
      else top
    right = if left is null then 0 else null
    bottom = if top is null then 0 else null
    #using null instead of '' is 4% faster
    #these 4 statements are 40% faster than 1 style.cssText
    {style} = ui.el
    style.top    = top
    style.right  = right
    style.bottom = bottom
    style.left   = left
  dragend: ->
    #$ coffee -bpe '{a} = {b} = c'
    #var a, b;
    #a = (b = c.b, c).a;
    {el} = ui
    localStorage["#{NAMESPACE}#{el.id}.position"] = el.style.cssText
    d.removeEventListener 'mousemove', ui.drag, false
    d.removeEventListener 'mouseup',   ui.dragend, false
  hover: (e) ->
    {clientX, clientY} = e
    {el} = ui
    {style} = el
    {clientHeight, clientWidth} = d.body
    height = el.offsetHeight

    top = clientY - 120
    style.top =
      if clientHeight < height or top < 0
        0
      else if top + height > clientHeight
        clientHeight - height
      else
        top

    if clientX < clientWidth - 400
      style.left  = clientX + 45
      style.right = null
    else
      style.left  = null
      style.right = clientWidth - clientX + 45

  hoverend: ->
    ui.el.parentNode.removeChild ui.el

###
loosely follows the jquery api:
http://api.jquery.com/
not chainable
###
$ = (selector, root=d.body) ->
  root.querySelector selector

$.extend = (object, properties) ->
  for key, val of properties
    object[key] = val
  object

$.extend $,
  id: (id) ->
    d.getElementById id
  globalEval: (code) ->
    script = $.el 'script',
      textContent: "(#{code})()"
    $.add d.head, script
    $.rm script
  ajax: (url, cb, type='get', data) ->
    r = new XMLHttpRequest()
    r.onload = cb
    r.open type, url, true
    r.send data
    r
  cache: (url, cb) ->
    if req = $.cache.requests[url]
      if req.readyState is 4
        cb.call req
      else
        req.callbacks.push cb
    else
      req = $.ajax url, (-> cb.call @ for cb in @callbacks)
      req.callbacks = [cb]
      $.cache.requests[url] = req
  cb:
    checked: ->
      $.set @name, @checked
      conf[@name] = @checked
    value: ->
      $.set @name, @value
      conf[@name] = @value
  addStyle: (css) ->
    style = $.el 'style',
      textContent: css
    $.add d.head, style
    style
  x: (path, root=d.body) ->
    d.evaluate(path, root, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).
      singleNodeValue
  tn: (s) ->
    d.createTextNode s
  replace: (root, el) ->
    root.parentNode.replaceChild el, root
  addClass: (el, className) ->
    el.classList.add className
  removeClass: (el, className) ->
    el.classList.remove className
  rm: (el) ->
    el.parentNode.removeChild el
  add: (parent, children...) ->
    for child in children
      parent.appendChild child
  prepend: (parent, child) ->
    parent.insertBefore child, parent.firstChild
  after: (root, el) ->
    root.parentNode.insertBefore el, root.nextSibling
  before: (root, el) ->
    root.parentNode.insertBefore el, root
  el: (tag, properties) ->
    el = d.createElement tag
    $.extend el, properties if properties
    el
  on: (el, eventType, handler) ->
    el.addEventListener eventType, handler, false
  off: (el, eventType, handler) ->
    el.removeEventListener eventType, handler, false
  isDST: ->
    ###
      http://en.wikipedia.org/wiki/Eastern_Time_Zone
      Its UTC time offset is −5 hrs (UTC−05) during standard time and −4
      hrs (UTC−04) during daylight saving time.

      Since 2007, the local time changes at 02:00 EST to 03:00 EDT on the second
      Sunday in March and returns at 02:00 EDT to 01:00 EST on the first Sunday
      in November, in the U.S. as well as in Canada.

      0200 EST (UTC-05) = 0700 UTC
      0200 EDT (UTC-04) = 0600 UTC
    ###

    D = new Date()
    date  = D.getUTCDate()
    day   = D.getUTCDay()
    hours = D.getUTCHours()
    month = D.getUTCMonth()

    #this is the easy part
    if month < 2 or 10 < month
      return false
    if 2 < month < 10
      return true

    # (sunday's date) = (today's date) - (number of days past sunday)
    # date is not zero-indexed
    sunday = date - day

    if month is 2
      #before second sunday
      if sunday < 8
        return false

      #during second sunday
      if sunday < 15 and day is 0
        if hours < 7
          return false
        return true

      #after second sunday
      return true

    #month is 10
    # before first sunday
    if sunday < 1
      return true

    # during first sunday
    if sunday < 8 and day is 0
      if hours < 6
        return true
      return false

    #after first sunday
    return false

$.cache.requests = {}

if GM_deleteValue?
  $.extend $,
    delete: (name) ->
      name = NAMESPACE + name
      GM_deleteValue name
    get: (name, defaultValue) ->
      name = NAMESPACE + name
      if value = GM_getValue name
        JSON.parse value
      else
        defaultValue
    openInTab: (url) ->
      GM_openInTab url
    set: (name, value) ->
      name = NAMESPACE + name
      # for `storage` events
      localStorage[name] = JSON.stringify value
      GM_setValue name, JSON.stringify value
else
  $.extend $,
    delete: (name) ->
      name = NAMESPACE + name
      delete localStorage[name]
    get: (name, defaultValue) ->
      name = NAMESPACE + name
      if value = localStorage[name]
        JSON.parse value
      else
        defaultValue
    openInTab: (url) ->
      window.open url, "_blank"
    set: (name, value) ->
      name = NAMESPACE + name
      localStorage[name] = JSON.stringify value

#load values from localStorage
for key, val of conf
  conf[key] = $.get key, val

$$ = (selector, root=d.body) ->
  Array::slice.call root.querySelectorAll selector

filter =
  regexps: {}
  callbacks: []
  init: ->
    for key of config.filter
      unless m = conf[key].match /^\/.+\/\w*$/gm
        continue
      @regexps[key] = []
      for filter in m
        f = filter.match /^\/(.+)\/(\w*)$/
        @regexps[key].push RegExp f[1], f[2]
      #only execute what's filterable
      @callbacks.push @[key]

    g.callbacks.push @node

  node: (root) ->
    unless root.className
      if filter.callbacks.some((callback) -> callback root)
        replyHiding.hideHide $ 'td:not([nowrap])', root
    else if root.className is 'op' and not g.REPLY and conf['Filter OPs']
      if filter.callbacks.some((callback) -> callback root)
        threadHiding.hideHide root.parentNode

  test: (key, value) ->
    filter.regexps[key].some (regexp) -> regexp.test value

  name: (root) ->
    name = if root.className is 'op' then $ '.postername', root else $ '.commentpostername', root
    filter.test 'name', name.textContent
  trip: (root) ->
    if trip = $ '.postertrip', root
      filter.test 'trip', trip.textContent
  mail: (root) ->
    if mail = $ '.linkmail', root
      filter.test 'mail', mail.href
  sub: (root) ->
    sub = if root.className is 'op' then $ '.filetitle', root else $ '.replytitle', root
    filter.test 'sub', sub.textContent
  com: (root) ->
    filter.test 'com', ($.el 'a', innerHTML: $('blockquote', root).innerHTML.replace /<br>/g, '\n').textContent
  file: (root) ->
    if file = $ '.filesize span', root
      filter.test 'file', file.title
  md5: (root) ->
    if img = $ 'img[md5]', root
      filter.test 'md5', img.getAttribute('md5')

strikethroughQuotes =
  init: ->
    g.callbacks.push (root) ->
      return if root.className is 'inline'
      for quote in $$ '.quotelink', root
        if el = $.id quote.hash[1..]
          if el.parentNode.parentNode.parentNode.hidden
            $.addClass quote, 'filtered'

expandComment =
  init: ->
    for a in $$ '.abbr a'
      $.on a, 'click', expandComment.expand
  expand: (e) ->
    e.preventDefault()
    [_, threadID, replyID] = @href.match /(\d+)#(\d+)/
    @textContent = "Loading #{replyID}..."
    threadID = @pathname.split('/').pop() or $.x('ancestor::div[@class="thread"]/div', @).id
    a = @
    $.cache @pathname, (-> expandComment.parse @, a, threadID, replyID)
  parse: (req, a, threadID, replyID) ->
    if req.status isnt 200
      a.textContent = "#{req.status} #{req.statusText}"
      return

    body = $.el 'body',
      innerHTML: req.responseText

    if threadID is replyID #OP
      bq = $ 'blockquote', body
    else
      #css selectors don't like ids starting with numbers,
      # getElementById only works for root document.
      for reply in $$ 'td[id]', body
        if reply.id == replyID
          bq = $ 'blockquote', reply
          break
    for quote in $$ '.quotelink', bq
      if quote.getAttribute('href') is quote.hash
        quote.pathname = "/#{g.BOARD}/res/#{threadID}"
      if quote.hash[1..] is threadID
        quote.innerHTML += '&nbsp;(OP)'
      if conf['Quote Preview']
        $.on quote, 'mouseover', quotePreview.mouseover
        $.on quote, 'mousemove', ui.hover
        $.on quote, 'mouseout',  quotePreview.mouseout
      if conf['Quote Inline']
        $.on quote, 'click', quoteInline.toggle
    $.replace a.parentNode.parentNode, bq

expandThread =
  init: ->
    for span in $$ '.omittedposts'
      a = $.el 'a',
        textContent: "+ #{span.textContent}"
        className: 'omittedposts'
      $.on a, 'click', expandThread.cb.toggle
      $.replace span, a

  cb:
    toggle: ->
      thread = @parentNode
      expandThread.toggle thread

  toggle: (thread) ->
    threadID = thread.firstChild.id
    pathname = "/#{g.BOARD}/res/#{threadID}"
    a = $ '.omittedposts', thread

    switch a.textContent[0]
      when '+'
        $('.op .container', thread)?.innerHTML = ''
        a.textContent = a.textContent.replace '+', 'X Loading...'
        $.cache pathname, (-> expandThread.parse @, pathname, thread, a)

      when 'X'
        a.textContent = a.textContent.replace 'X Loading...', '+'
        #FIXME this will kill all callbacks
        $.cache[pathname].abort()

      when '-'
        a.textContent = a.textContent.replace '-', '+'
        #goddamit moot
        num = switch g.BOARD
          when 'b' then 3
          when 't' then 1
          else 5
        table = $.x "following::br[@clear][1]/preceding::table[#{num}]", a
        while (prev = table.previousSibling) and (prev.nodeName is 'TABLE')
          $.rm prev
        for backlink in $$ '.op a.backlink'
          $.rm backlink if !$.id backlink.hash[1..]


  parse: (req, pathname, thread, a) ->
    if req.status isnt 200
      a.textContent = "#{req.status} #{req.statusText}"
      $.off a, 'click', expandThread.cb.toggle
      return

    a.textContent = a.textContent.replace 'X Loading...', '-'

    # eat everything, then replace with fresh full posts
    while (next = a.nextSibling) and not next.clear #br[clear]
      $.rm next
    br = next

    body = $.el 'body',
      innerHTML: req.responseText

    for reply in $$ 'td[id]', body
      for quote in $$ '.quotelink', reply
        if (href = quote.getAttribute('href')) is quote.hash #add pathname to normal quotes
          quote.pathname = pathname
        else if href isnt quote.href #fix x-thread links, not x-board ones
          quote.href = "res/#{href}"
      link = $ '.quotejs', reply
      link.href = "res/#{thread.firstChild.id}##{reply.id}"
      link.nextSibling.href = "res/#{thread.firstChild.id}#q#{reply.id}"
    tables = $$ 'form[name=delform] table', body
    tables.pop()
    for table in tables
      $.before br, table

replyHiding =
  init: ->
    g.callbacks.push (root) ->
      return unless dd = $ '.doubledash', root
      dd.className = 'replyhider'
      a = $.el 'a',
        textContent: '[ - ]'
      $.on a, 'click', replyHiding.cb.hide
      $.replace dd.firstChild, a

      reply = dd.nextSibling
      id = reply.id
      if id of g.hiddenReplies
        replyHiding.hide reply

  cb:
    hide: ->
      reply = @parentNode.nextSibling
      replyHiding.hide reply

    show: ->
      div = @parentNode
      table = div.nextSibling
      replyHiding.show table

      $.rm div

  hide: (reply) ->
    replyHiding.hideHide reply

    id = reply.id
    for quote in $$ ".quotelink[href='##{id}'], .backlink[href='##{id}']"
      $.addClass quote, 'filtered'

    g.hiddenReplies[id] = Date.now()
    $.set "hiddenReplies/#{g.BOARD}/", g.hiddenReplies

  hideHide: (reply) ->
    table = reply.parentNode.parentNode.parentNode
    table.hidden = true

    if conf['Show Stubs']
      name = $('.commentpostername', reply).textContent
      trip = $('.postertrip', reply)?.textContent or ''
      a = $.el 'a',
        textContent: "[ + ] #{name} #{trip}"
      $.on a, 'click', replyHiding.cb.show

      div = $.el 'div',
        className: 'stub'
      $.add div, a
      $.before table, div

  show: (table) ->
    table.hidden = false

    id = $('td[id]', table).id
    for quote in $$ ".quotelink[href='##{id}'], .backlink[href='##{id}']"
      $.removeClass quote, 'filtered'

    delete g.hiddenReplies[id]
    $.set "hiddenReplies/#{g.BOARD}/", g.hiddenReplies

keybinds =
  init: ->
    for node in $$ '[accesskey]'
      node.removeAttribute 'accesskey'
    $.on d, 'keydown',  keybinds.keydown

  keydown: (e) ->
    updater.focus = true
    return if e.target.nodeName in ['TEXTAREA', 'INPUT'] and not e.altKey and not e.ctrlKey and not (e.keyCode is 27)
    return unless key = keybinds.keyCode e

    thread = nav.getThread()
    switch key
      when conf.close
        if o = $ '#overlay'
          $.rm o
        else if Post.qr
          Post.rm()
      when conf.spoiler
        ta = e.target
        return unless ta.nodeName is 'TEXTAREA'

        value    = ta.value
        selStart = ta.selectionStart
        selEnd   = ta.selectionEnd

        valStart = value[0...selStart] + '[spoiler]'
        valMid   = value[selStart...selEnd]
        valEnd   = '[/spoiler]' + value[selEnd..]

        ta.value = valStart + valMid + valEnd
        range = valStart.length + valMid.length
        ta.setSelectionRange range, range
      when conf.zero
        window.location = "/#{g.BOARD}/0#0"
      when conf.openEmptyQR
        keybinds.qr thread
      when conf.nextReply
        keybinds.hl.next thread
      when conf.previousReply
        keybinds.hl.prev thread
      when conf.expandAllImages
        keybinds.img thread, true
      when conf.openThread
        keybinds.open thread
      when conf.expandThread
        expandThread.toggle thread
      when conf.openQR
        keybinds.qr thread, true
      when conf.expandImages
        keybinds.img thread
      when conf.nextThread
        nav.next()
      when conf.openThreadTab
        keybinds.open thread, true
      when conf.previousThread
        nav.prev()
      when conf.update
        updater.update()
      when conf.watch
        watcher.toggle thread
      when conf.hide
        threadHiding.toggle thread
      when conf.nextPage
        $('input[value=Next]')?.click()
      when conf.previousPage
        $('input[value=Previous]')?.click()
      when conf.submit
        if Post.qr
          Post.submit()
        else
          $('.postarea form').submit()
      when conf.unreadCountTo0
        unread.replies.length = 0
        unread.updateTitle()
        Favicon.update()
      else
        return
    e.preventDefault()

  keyCode: (e) ->
    key = switch kc = e.keyCode
      when 8
        ''
      when 27
        'Esc'
      when 37
        'Left'
      when 38
        'Up'
      when 39
        'Right'
      when 40
        'Down'
      when 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90 #0-9, A-Z
        c = String.fromCharCode kc
        if e.shiftKey then c else c.toLowerCase()
      else
        null
    if key
      if e.altKey  then key = 'alt+' + key
      if e.ctrlKey then key = 'ctrl+' + key
    key

  img: (thread, all) ->
    if all
      $("#imageExpand").click()
    else
      root = $('td.replyhl', thread) or thread
      thumb = $ 'img[md5]', root
      imgExpand.toggle thumb.parentNode

  qr: (thread, quote) ->
    link = $ '.quotejs + a', $('.replyhl', thread) or thread
    if quote
      Post.quote.call link, preventDefault: ->
    else
      Post.dialog link if not Post.qr
      $('textarea', Post.qr).focus()

  open: (thread, tab) ->
    id = thread.firstChild.id
    url = "http://boards.4chan.org/#{g.BOARD}/res/#{id}"
    if tab
      $.openInTab url
    else
      location.href = url

  hl:
    next: (thread) ->
      if td = $ 'td.replyhl', thread
        td.className = 'reply'
        rect = td.getBoundingClientRect()
        if rect.top > 0 and rect.bottom < d.body.clientHeight #you're fully visible
          next = $.x 'following::td[@class="reply"]', td
          return if $.x('ancestor::div[@class="thread"]', next) isnt thread
          rect = next.getBoundingClientRect()
          if rect.top > 0 and rect.bottom < d.body.clientHeight #and so is the next
            next.className = 'replyhl'
          return

      replies = $$ 'td.reply', thread
      for reply in replies
        top = reply.getBoundingClientRect().top
        if top > 0
          reply.className = 'replyhl'
          return

    prev: (thread) ->
      if td = $ 'td.replyhl', thread
        td.className = 'reply'
        rect = td.getBoundingClientRect()
        if rect.top > 0 and rect.bottom < d.body.clientHeight #you're fully visible
          prev = $.x 'preceding::td[@class="reply"][1]', td
          rect = prev.getBoundingClientRect()
          if rect.top > 0 and rect.bottom < d.body.clientHeight #and so is the prev
            prev.className = 'replyhl'
          return

      replies = $$ 'td.reply', thread
      replies.reverse()
      height = d.body.clientHeight
      for reply in replies
        bot = reply.getBoundingClientRect().bottom
        if bot < height
          reply.className = 'replyhl'
          return

nav =
  # ◀ ▶
  init: ->
    span = $.el 'span',
      id: 'navlinks'
    prev = $.el 'a',
      textContent: '▲'
    next = $.el 'a',
      textContent: '▼'

    $.on prev, 'click', nav.prev
    $.on next, 'click', nav.next

    $.add span, prev, $.tn(' '), next
    $.add d.body, span

  prev: ->
    nav.scroll -1

  next: ->
    nav.scroll +1

  threads: []

  getThread: (full) ->
    nav.threads = $$ 'div.thread:not([hidden])'
    for thread, i in nav.threads
      rect = thread.getBoundingClientRect()
      {bottom} = rect
      if bottom > 0 #we have not scrolled past
        if full
          return [thread, i, rect]
        return thread
    return null

  scroll: (delta) ->
    if g.REPLY
      if delta is -1
        window.scrollTo 0,0
      else
        window.scrollTo 0, d.body.scrollHeight
      return

    [thread, i, rect] = nav.getThread true
    {top} = rect

    #unless we're not at the beginning of the current thread
    # (and thus wanting to move to beginning)
    # or we're above the first thread and don't want to skip it
    unless (delta is -1 and Math.ceil(top) < 0) or (delta is +1 and top > 1)
      i += delta

    if i is -1
      if g.PAGENUM is 0
        window.scrollTo 0, 0
      else
        window.location = "#{g.PAGENUM - 1}#0"
      return
    if delta is +1
      # if we're at the last thread, or we're at the bottom of the page.
      # kind of hackish, what we really need to do is make nav.getThread smarter.
      if i is nav.threads.length or (innerHeight + pageYOffset == d.body.scrollHeight)
        if $ 'table.pages input[value="Next"]'
          window.location = "#{g.PAGENUM + 1}#0"
          return
        #TODO sfx

    {top} = nav.threads[i].getBoundingClientRect()
    window.scrollBy 0, top

options =
  init: ->
    home = $ '#navtopr a'
    a = $.el 'a',
      textContent: '4chan X'
    $.on a, 'click', options.dialog
    $.replace home, a
    home = $ '#navbotr a'
    a = $.el 'a',
      textContent: '4chan X'
    $.on a, 'click', options.dialog
    $.replace home, a

  dialog: ->
    dialog = ui.dialog 'options', '', '
<div id=optionsbar>
  <div id=credits>
    <a target=_blank href=http://aeosynth.github.com/4chan-x/>4chan X</a>
    | <a target=_blank href=https://github.com/aeosynth/4chan-x/issues>Issues</a>
    | <a target=_blank href=https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=2DBVZBUAM4DHC&lc=US&item_name=Aeosynth&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted>Donate</a>
  </div>
  <div>
    <label for=main_tab>Main</label>
    | <label for=filter_tab>Filter</label>
    | <label for=flavors_tab>Sauce</label>
    | <label for=rice_tab>Rice</label>
    | <label for=keybinds_tab>Keybinds</label>
  </div>
</div>
<hr>
<div id=content>
  <input type=radio name=tab hidden id=main_tab checked>
  <div id=main></div>
  <input type=radio name=tab hidden id=flavors_tab>
  <textarea name=flavors id=flavors></textarea>
  <input type=radio name=tab hidden id=filter_tab>
  <div id=filter>
    Use <a href=https://developer.mozilla.org/en/JavaScript/Guide/Regular_Expressions>regular expressions</a>, one per line.<br>
    For example, <code>/weeaboo/i</code> will filter posts containing `weeaboo` case-insensitive.
    <p>Name:<br><textarea name=name></textarea></p>
    <p>Tripcode:<br><textarea name=trip></textarea></p>
    <p>E-mail:<br><textarea name=mail></textarea></p>
    <p>Subject:<br><textarea name=sub></textarea></p>
    <p>Comment:<br><textarea name=com></textarea></p>
    <p>Filename:<br><textarea name=file></textarea></p>
    <p>Image MD5:<br><textarea name=md5></textarea></p>
  </div>
  <input type=radio name=tab hidden id=rice_tab>
  <div id=rice>
    <ul>
      Backlink formatting
      <li><input type=text name=backlink> : <span id=backlinkPreview></span></li>
    </ul>
    <ul>
      Time formatting
      <li><input type=text name=time> : <span id=timePreview></span></li>
      <li>Supported <a href=http://en.wikipedia.org/wiki/Date_%28Unix%29#Formatting>format specifiers</a>:</li>
      <li>Day: %a, %A, %d, %e</li>
      <li>Month: %m, %b, %B</li>
      <li>Year: %y</li>
      <li>Hour: %k, %H, %l (lowercase L), %I (uppercase i), %p, %P</li>
      <li>Minutes: %M</li>
    </ul>
  </div>
  <input type=radio name=tab hidden id=keybinds_tab>
  <div id=keybinds>
    <table><tbody>
      <tr><th>Actions</th><th>Keybinds</th></tr>
      <tr><td>Close Options or QR</td><td><input name=close></td></tr>
      <tr><td>Quick spoiler</td><td><input name=spoiler></td></tr>
      <tr><td>Open QR with post number inserted</td><td><input name=openQR></td></tr>
      <tr><td>Open QR without post number inserted</td><td><input name=openEmptyQR></td></tr>
      <tr><td>Submit post</td><td><input name=submit></td></tr>
      <tr><td>Select next reply</td><td><input name=nextReply ></td></tr>
      <tr><td>Select previous reply</td><td><input name=previousReply></td></tr>
      <tr><td>See next thread</td><td><input name=nextThread></td></tr>
      <tr><td>See previous thread</td><td><input name=previousThread></td></tr>
      <tr><td>Jump to the next page</td><td><input name=nextPage></td></tr>
      <tr><td>Jump to the previous page</td><td><input name=previousPage></td></tr>
      <tr><td>Jump to page 0</td><td><input name=zero></td></tr>
      <tr><td>Open thread in current tab</td><td><input name=openThread></td></tr>
      <tr><td>Open thread in new tab</td><td><input name=openThreadTab></td></tr>
      <tr><td>Expand thread</td><td><input name=expandThread></td></tr>
      <tr><td>Watch thread</td><td><input name=watch></td></tr>
      <tr><td>Hide thread</td><td><input name=hide></td></tr>
      <tr><td>Expand selected image</td><td><input name=expandImages></td></tr>
      <tr><td>Expand all images</td><td><input name=expandAllImages></td></tr>
      <tr><td>Update now</td><td><input name=update></td></tr>
      <tr><td>Reset the unread count to 0</td><td><input name=unreadCountTo0></td></tr>
    </tbody></table>
  </div>
</div>'

    #main
    for key, obj of config.main
      ul = $.el 'ul',
        textContent: key
      for key, arr of obj
        checked = if conf[key] then 'checked' else ''
        description = arr[1]
        li = $.el 'li',
          innerHTML: "<label><input type=checkbox name='#{key}' #{checked}>#{key}</label><span class=description>: #{description}</span>"
        $.on $('input', li), 'click', $.cb.checked
        $.add ul, li
      $.add $('#main', dialog), ul

    hiddenThreads = $.get "hiddenThreads/#{g.BOARD}/", {}
    hiddenNum = Object.keys(g.hiddenReplies).length + Object.keys(hiddenThreads).length
    li = $.el 'li',
      innerHTML: "<button>hidden: #{hiddenNum}</button> <span class=description>: Forget all hidden posts. Useful if you accidentally hide a post and have `Show Stubs` disabled."
    $.on $('button', li), 'click', options.clearHidden
    $.add $('ul:nth-child(2)', dialog), li

    #filter & sauce
    for ta in $$ 'textarea', dialog
      ta.textContent = conf[ta.name]
      $.on ta, 'change', $.cb.value

    #rice
    (back = $ '[name=backlink]', dialog).value = conf['backlink']
    (time = $ '[name=time]',     dialog).value = conf['time']
    $.on back, 'keyup', options.backlink
    $.on time, 'keyup', options.time

    #keybinds
    for input in $$ '#keybinds input', dialog
      input.type  = 'text'
      input.value = conf[input.name]
      $.on input, 'keydown', options.keybind

    overlay = $.el 'div', id: 'overlay'
    $.on overlay, 'click', -> $.rm overlay
    $.on dialog, 'click', (e) -> e.stopPropagation()
    $.add overlay, dialog
    $.add d.body, overlay

    options.time.call     time
    options.backlink.call back

  clearHidden: ->
    #'hidden' might be misleading; it's the number of IDs we're *looking* for,
    # not the number of posts actually hidden on the page.
    $.delete "hiddenReplies/#{g.BOARD}/"
    $.delete "hiddenThreads/#{g.BOARD}/"
    @textContent = "hidden: 0"
    g.hiddenReplies = {}
  keybind: (e) ->
    e.preventDefault()
    e.stopPropagation()
    return unless (key = keybinds.keyCode e)?
    @value = key
    $.set @name, key
    conf[@name] = key
  time: ->
    $.set 'time', @value
    conf['time'] = @value
    Time.foo()
    Time.date = new Date()
    $('#timePreview').textContent = Time.funk Time
  backlink: ->
    $.set 'backlink', @value
    conf['backlink'] = @value
    $('#backlinkPreview').textContent = conf['backlink'].replace /%id/, '123456789'

Post =
  #captcha caching for report form
  #report queueing
  #check if captchas can be reused on eg dup file error
  init: ->
    #can't reply in some stickies, recaptcha may be blocked, eg by noscript
    return unless $('form[name=post]') and $('#recaptcha_response_field')

    if conf['Cooldown']
      $.on window, 'storage', (e) -> Post.cooldown() if e.key is "#{NAMESPACE}cooldown/#{g.BOARD}"
    Post.spoiler =
      if $('input[name=spoiler]')
        '<label>[<input name=spoiler type=checkbox>Spoiler Image?]</label>'
      else
        ''

    if not g.XHR2
      form = Post.form = $.el 'form',
        enctype: 'multipart/form-data'
        method: 'post'
        action: "http://sys.4chan.org/#{g.BOARD}/post"
        target: 'iframe'
        hidden: true
        innerHTML: "
          <input name=mode>
          <input name=resto>
          <input name=name>
          <input name=email>
          <input name=sub>
          <textarea name=com></textarea>
          <input name=recaptcha_challenge_field>
          <input name=recaptcha_response_field>
          #{Post.spoiler}
        "
      $.add d.body, form

    $('#recaptcha_response_field').removeAttribute 'id'
    holder = $ '#recaptcha_challenge_field_holder'
    $.on holder, 'DOMNodeInserted', Post.captchaNode
    Post.captchaNode target: holder.firstChild

    $.add d.body, $.el 'iframe',
      id: 'iframe'
      hidden: true
      src: if g.XHR2 then "http://sys.4chan.org/#{g.BOARD}/src" else 'about:blank'
    Post.MAX_FILE_SIZE = $('[name=MAX_FILE_SIZE]').value
    g.callbacks.push Post.node

    if g.REPLY and conf['Persistent QR']
      Post.dialog()
      #$('textarea', QR.qr).blur()
      if conf['Auto Hide QR']
        $('#autohide', Post.qr).checked = true

  node: (root) ->
    link = $ '.quotejs + a', root
    $.on link, 'click', Post.quote

  quote: (e) ->
    e.preventDefault()
    qr = Post.qr or Post.dialog @
    $('#autohide', qr).checked = false

    id = @textContent
    text = ">>#{id}\n"

    #quote selected text
    selection = getSelection()
    root = $.x 'ancestor::td', selection.anchorNode
    if id is $('input', root)?.name
      if s = selection.toString().replace /\n/g, '\n>'
        text += ">#{s}\n"

    #add text to comment
    ta = $ 'textarea', qr
    v  = ta.value
    ss = ta.selectionStart
    ta.value = v[0...ss] + text + v[ss..]
    i = ss + text.length
    ta.setSelectionRange i, i
    ta.focus()

    Post.charCount.call ta

  stats: ->
    {qr} = Post
    images = $$ '#items li', qr
    captchas = $.get 'captchas', []
    $('#pstats', qr).textContent = "captchas: #{captchas.length} / images: #{images.length}"

  dialog: (link) ->
    qr = Post.qr = ui.dialog 'post', 'top: 0; right: 0', "
    <a class=close>X</a>
    <input type=checkbox id=autohide title=autohide>
    <div class=move>
      <span id=pstats></span>
    </div>
    <div class=autohide>
      <div id=foo>
        <input placeholder=Name    name=name>
        <input placeholder=Email   name=email>
        <input placeholder=Subject name=sub>
      </div>
      <textarea placeholder=Comment name=com></textarea>
      <div><img id=captchaImg></div>
      <div id=reholder>
        <input id=recaptcha_response_field placeholder=Verification autocomplete=off>
        <span id=charCount></span>
        <span id=fileSpan>
          <img src=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41Ljg3O4BdAAAAXUlEQVQ4T2NgoAH4DzQTHyZoJckGENJASB6nc9GdCjdo6tSptkCsCPUqVgNAmtFtxiYGUkO0QrBibOqJtWkIGYDTqTgSGOnRiGYQ3mRLKBFhjUZiNCGrIZg3aKsAAGu4rTMFLFBMAAAAAElFTkSuQmCC>
        </span>
      </div>
      <ul id=items></ul>
      <div>
        <button id=submit>Submit</button>
        #{Post.spoiler}
        <label><input id=autosubmit type=checkbox>autosubmit</label>
      </div>
    </div>
    "

    Post.reset()
    if g.REPLY
      Post.resto = g.THREAD_ID
    else
      Post.resto = $.x('ancestor::div[@class="thread"]/div', link).id
    Post.captchaImg()
    Post.file()
    Post.cooldown() if conf['cooldown']
    $.on $('.close', qr), 'click', Post.rm
    $.on $('#submit', qr), 'click', Post.submit
    $.on $('#recaptcha_response_field', qr), 'keydown', Post.captchaKeydown
    $.on $('img', qr), 'click', Post.captchaReload
    $.on $('textarea', qr), 'keyup', Post.charCount
    Post.stats()
    $.add d.body, qr
    qr

  charCount: (e) ->
    $('#charCount', Post.qr).textContent = @value.length + ' / 2000'

  rm: ->
    $.rm Post.qr
    Post.qr = null

  captchaGet: ->
    captchas = $.get 'captchas', []
    cutoff = Date.now() - 5*HOUR + 5*MINUTE
    while captcha = captchas.shift()
      if captcha.time > cutoff
        break
    $.set 'captchas', captchas

    if not captcha
      el = $ '#recaptcha_response_field', Post.qr
      if v = el.value
        el.value = ''
        {captcha} = Post
        captcha.response = v
        Post.captchaReload()

    captcha

  captchaImg: ->
    $('#captchaImg', Post.qr)?.src =
      'http://www.google.com/recaptcha/api/image?c=' + Post.captcha.challenge

  captchaKeydown: (e) ->
    kc = e.keyCode
    v = @value
    if kc is 8 and not v #backspace, empty
      Post.captchaReload()
      return
    if e.keyCode is 13 and v
      Post.captchaSet.call @
      Post.submit()

  captchaNode: (e) ->
    Post.captcha =
      challenge: e.target.value
      time: Date.now()
    Post.captchaImg()

  captchaReload: ->
    window.location = 'javascript:Recaptcha.reload()'

  captchaSet: ->
    response = @value
    @value = ''

    captchas = $.get 'captchas', []
    {captcha} = Post
    captcha.response = response
    captchas.push captcha
    $.set 'captchas', captchas
    Post.captchaReload()
    Post.stats()

  pushFile: ->
    self = @
    items = $ '#items', Post.qr
    for file in @files
      do (file) ->
        if file.size > Post.MAX_FILE_SIZE
          alert 'Error: File too large.'
          return

        item = $.el 'li',
          innerHTML: '<a class=close>X</a><img><input type=file>'
        $.on $('a', item), 'click', Post.rmFile
        $.on $('input', item), 'change', Post.fileChange
        $.add items, item
        if not g.XHR2
          $.add item, self

        fr = new FileReader()
        img = $ 'img', item
        fr.onload = (e) ->
          img.src = e.target.result
        fr.readAsDataURL file

    Post.stats()
    Post.file()

  fileChange: ->
    file = @files[0]
    if file.size > Post.MAX_FILE_SIZE
      alert 'Error: File too large.'
      return
    fr = new FileReader()
    img = $ 'img', @parentNode
    fr.onload = (e) ->
      img.src = e.target.result
    fr.readAsDataURL file

  file: ->
    fileSpan = $ '#fileSpan', Post.qr
    if input = $ 'input', fileSpan
      $.rm input
    input = $.el 'input',
      type: 'file'
      name: 'upfile'
      accept: 'image/*'
    input.multiple = true if g.XHR2
    multiple = if g.XHR2 then 'multiple' else ''
    $.add fileSpan, input
    $.on $('input', fileSpan), 'change', Post.pushFile

  rmFile: ->
    $.rm @parentNode
    Post.stats()

  submit: (e) ->
    {qr, form} = Post

    o =
      resto: Post.resto
      mode: 'regist'
    for el in $$ '[name]', qr
      o[el.name] = el.value
    delete o.upfile
    img = $ '#items img[src]', qr

    if not (o.com or img)
      alert 'Error: No text entered.' if e
      return

    if $('button', qr).disabled
      $('#autosubmit', qr).checked = true
      return

    unless captcha = Post.captchaGet()
      alert 'You forgot to type in the verification.' if e
      return
    o.recaptcha_challenge_field = captcha.challenge
    o.recaptcha_response_field  = captcha.response
    Post.stats()

    if img
      img.setAttribute 'data-submit', true #XXX fx - can't use dataset in userscript, wtf?
      if g.XHR2
        o.upfile = atob img.src.split(',')[1]
      else
        $.add form, $('input', img.parentNode)

    Post.sage = /sage/i.test o.email

    if g.XHR2
      o.to = 'sys'
      postMessage o, '*'
    else
      for name, value of o
        form[name].value = value
      form.submit()

    if conf['Auto Hide QR']
      $('#autohide', qr).checked = true

    if conf['Thread Watcher'] and conf['Auto Watch Reply']
      op = $.id o.resto
      if $('img.favicon', op).src is Favicon.empty
        watcher.watch op, id

  sys: ->
    if recaptcha = $ '#recaptcha_response_field' #post reporting
      $.on recaptcha, 'keydown', Post.keydown
      return

    $.globalEval ->
      ###
      http://code.google.com/p/chromium/issues/detail?id=20773
      Let content scripts see other frames (instead of them being undefined)

      To access the parent, we have to break out of the sandbox and evaluate
      in the global context.
      ###
      window.addEventListener('message', (e) ->
        {data} = e
        if data.to is 'Post.message'
          parent.postMessage data, '*'
      , false)

    if not g.XHR2
      data = to: 'Post.message'
      if node = $('table font b')?.firstChild
        data.error = node.textContent
      else if node = $ 'meta'
        data.url = node.content.match(/url=(.+)/)[1]
      postMessage data, '*'
      #if we're an iframe, parent will blank us
      return

    $.on window, 'message', (e) ->
      {data} = e
      {to} = data
      return unless to is 'sys'
      delete data.to
      fd = new FormData()
      {upfile} = data
      if upfile
        l = upfile.length
        ui8a = new Uint8Array l
        for i in  [0...l]
          ui8a[i] = upfile.charCodeAt i
        bb = new (window.MozBlobBuilder or window.WebKitBlobBuilder)()
        bb.append ui8a.buffer
        data.upfile = bb.getBlob()
      for key, val of data
        fd.append key, val
      $.ajax 'post', Post.sysCallback, 'post', fd

  sysCallback: ->
    data = to: 'Post.message'
    body = $.el 'body',
      innerHTML: @responseText
    if node = $('table font b', body)?.firstChild
      data.error = node.textContent
    postMessage data, '*'

  message: (data) ->
    {qr} = Post
    if not g.XHR2
      $('#iframe').src = 'about:blank'
    {error, url} = data
    img = $ 'img[data-submit]', qr
    if url
      return window.location = url
    if error
      if error is 'Error: Duplicate file entry detected.'
        $.rm img.parentNode
        Post.stats()
        setTimeout Post.submit, 1000
      else if error is 'You seem to have mistyped the verification.'
        setTimeout Post.submit, 1000
      else
        $('#autohide', qr).checked = false
        alert error
      return
    if img = $ 'img[data-submit]', qr
      $.rm img.parentNode
      Post.stats()
    if conf['Persistent QR'] or $('#items img[src]', qr)
      Post.reset()
    else
      Post.rm()
    if conf['Cooldown']
      cooldown = Date.now() + (if Post.sage then 60 else 30)*SECOND
      $.set "cooldown/#{g.BOARD}", cooldown
      Post.cooldown()

  reset: ->
    {qr} = Post
    ta = $ 'textarea', qr
    ta.value = ''
    Post.charCount.call ta
    c = d.cookie
    $('[name=name]',  qr).value = if m = c.match(/4chan_name=([^;]+)/)  then decodeURIComponent m[1] else ''
    $('[name=email]', qr).value = if m = c.match(/4chan_email=([^;]+)/) then decodeURIComponent m[1] else ''

  cooldown: ->
    {qr} = Post
    return unless qr

    cooldown = $.get "cooldown/#{g.BOARD}", 0
    now = Date.now()
    n = Math.ceil (cooldown - now) / 1000

    b = $ 'button', qr
    if n > 0
      $.extend b,
        textContent: n
        disabled: true
      setTimeout Post.cooldown, 1000
    else
      $.extend b,
        textContent: 'Submit'
        disabled: false
      Post.submit() if $('#autosubmit', qr).checked

threading =
  init: ->
    threading.thread $('body > form').firstChild

  op: (node) ->
    op = $.el 'div',
      className: 'op'
    $.before node, op
    while node.nodeName isnt 'BLOCKQUOTE'
      $.add op, node
      node = op.nextSibling
    $.add op, node #add the blockquote
    op.id = $('input', op).name
    op

  thread: (node) ->
    node = threading.op node

    return if g.REPLY

    div = $.el 'div',
      className: 'thread'
    $.before node, div

    while node.nodeName isnt 'HR'
      $.add div, node
      node = div.nextSibling

    node = node.nextElementSibling #skip text node
    #{N,}SFW
    unless node.align or node.nodeName is 'CENTER'
      threading.thread node

threadHiding =
  init: ->
    hiddenThreads = $.get "hiddenThreads/#{g.BOARD}/", {}
    for thread in $$ '.thread'
      op = thread.firstChild
      a = $.el 'a',
        textContent: '[ - ]'
      $.on a, 'click', threadHiding.cb.hide
      $.prepend op, a

      if op.id of hiddenThreads
        threadHiding.hideHide thread

  cb:
    hide: ->
      thread = @parentNode.parentNode
      threadHiding.hide thread
    show: ->
      thread = @parentNode.parentNode
      threadHiding.show thread

  toggle: (thread) ->
    if /\bstub\b/.test(thread.className) or thread.hidden
      threadHiding.show thread
    else
      threadHiding.hide thread

  hide: (thread) ->
    threadHiding.hideHide thread

    id = thread.firstChild.id

    hiddenThreads = $.get "hiddenThreads/#{g.BOARD}/", {}
    hiddenThreads[id] = Date.now()
    $.set "hiddenThreads/#{g.BOARD}/", hiddenThreads

  hideHide: (thread) ->
    if conf['Show Stubs']
      if span = $ '.omittedposts', thread
        num = Number span.textContent.match(/\d+/)[0]
      else
        num = 0
      num += $$('table', thread).length
      text = if num is 1 then "1 reply" else "#{num} replies"
      name = $('.postername', thread).textContent
      trip = $('.postername + .postertrip', thread)?.textContent or ''

      a = $.el 'a',
        textContent: "[ + ] #{name}#{trip} (#{text})"
      $.on a, 'click', threadHiding.cb.show

      div = $.el 'div',
        className: 'block'

      $.add div, a
      $.add thread, div
      $.addClass thread, 'stub'
    else
      thread.hidden = true
      thread.nextSibling.hidden = true

  show: (thread) ->
    $.rm $ 'div.block', thread
    $.removeClass thread, 'stub'
    thread.hidden = false
    thread.nextSibling.hidden = false

    id = thread.firstChild.id

    hiddenThreads = $.get "hiddenThreads/#{g.BOARD}/", {}
    delete hiddenThreads[id]
    $.set "hiddenThreads/#{g.BOARD}/", hiddenThreads

updater =
  init: ->
    #thread closed
    return unless $ 'form[name=post]'
    if conf['Scrolling']
      if conf['Scroll BG']
        updater.focus = true
      else
        $.on window, 'focus', (-> updater.focus = true)
        $.on window, 'blur',  (-> updater.focus = false)
    html = "<div class=move><span id=count></span> <span id=timer>-#{conf['Interval']}</span></div>"
    {checkbox} = config.updater
    for name of checkbox
      title = checkbox[name][1]
      checked = if conf[name] then 'checked' else ''
      html += "<div><label title='#{title}'>#{name}<input name='#{name}' type=checkbox #{checked}></label></div>"

    checked = if conf['Auto Update'] then 'checked' else ''
    html += "
      <div><label title='Controls whether *this* thread automatically updates or not'>Auto Update This<input name='Auto Update This' type=checkbox #{checked}></label></div>
      <div><label>Interval (s)<input name=Interval value=#{conf['Interval']} type=text></label></div>
      <div><input value='Update Now' type=button></div>"

    dialog = ui.dialog 'updater', 'bottom: 0; right: 0;', html

    updater.count = $ '#count', dialog
    updater.timer = $ '#timer', dialog
    updater.br    = $ 'br[clear]'

    for input in $$ 'input', dialog
      if input.type is 'checkbox'
        $.on input, 'click', $.cb.checked
        $.on input, 'click', -> conf[@name] = @checked
        if input.name is 'Verbose'
          $.on input, 'click', updater.cb.verbose
          updater.cb.verbose.call input
        else if input.name is 'Auto Update This'
          $.on input, 'click', updater.cb.autoUpdate
          updater.cb.autoUpdate.call input
      else if input.name is 'Interval'
        $.on input, 'change', -> conf['Interval'] = @value = parseInt(@value) or conf['Interval']
        $.on input, 'change', $.cb.value
      else if input.type is 'button'
        $.on input, 'click', updater.update

    $.add d.body, dialog

  cb:
    verbose: ->
      if conf['Verbose']
        updater.count.textContent = '+0'
        updater.timer.hidden = false
      else
        $.extend updater.count,
          className: ''
          textContent: 'Thread Updater'
        updater.timer.hidden = true
    autoUpdate: ->
      if @checked
        updater.timeoutID = setTimeout updater.timeout, 1000
      else
        clearTimeout updater.timeoutID
    update: ->
      if @status is 404
        updater.timer.textContent = ''
        updater.count.textContent = 404
        updater.count.className = 'error'
        clearTimeout updater.timeoutID
        for input in $$ '#com_submit'
          input.disabled = true
          input.value = 404
        # XXX trailing spaces are trimmed
        d.title = d.title.match(/.+-/)[0] + ' 404'
        g.dead = true
        Favicon.update()
        return

      updater.timer.textContent = '-' + conf['Interval']

      body = $.el 'body',
        innerHTML: @responseText
      if $('title', body).textContent is '4chan - Banned'
        updater.count.textContent = 'banned'
        updater.count.className = 'error'
        return

      replies = $$ '.reply', body
      id = Number $('td[id]', updater.br.previousElementSibling)?.id or 0
      arr = []
      while (reply = replies.pop()) and (reply.id > id)
        arr.push reply.parentNode.parentNode.parentNode #table

      scroll = conf['Scrolling'] && updater.focus && arr.length && (d.body.scrollHeight - d.body.clientHeight - window.scrollY < 20)
      if conf['Verbose']
        updater.count.textContent = '+' + arr.length
        if arr.length is 0
          updater.count.className = ''
        else
          updater.count.className = 'new'

      #XXX add replies in correct order so backlinks resolve
      while reply = arr.pop()
        $.before updater.br, reply
      if scroll
        scrollTo 0, d.body.scrollHeight

  timeout: ->
    updater.timeoutID = setTimeout updater.timeout, 1000
    n = 1 + Number updater.timer.textContent

    if n is 0
      updater.update()
    else if n is 10
      updater.retry()
    else
      updater.timer.textContent = n

  retry: ->
    updater.count.textContent = 'retry'
    updater.count.className = ''
    updater.update()

  update: ->
    updater.timer.textContent = 0
    updater.request?.abort()
    url = location.pathname + '?' + Date.now() # fool the cache
    cb = updater.cb.update
    updater.request = $.ajax url, cb

watcher =
  init: ->
    html = '<div class=move>Thread Watcher</div>'
    watcher.dialog = ui.dialog 'watcher', 'top: 50px; left: 0px;', html
    $.add d.body, watcher.dialog

    #add watch buttons
    inputs = $$ '.op input'
    for input in inputs
      favicon = $.el 'img',
        className: 'favicon'
      $.on favicon, 'click', watcher.cb.toggle
      $.before input, favicon

    #populate watcher, display watch buttons
    watcher.refresh()

    $.on window, 'storage', (e) -> watcher.refresh() if e.key is "#{NAMESPACE}watched"

  refresh: ->
    watched = $.get 'watched', {}
    for div in $$ 'div:not(.move)', watcher.dialog
      $.rm div
    for board of watched
      for id, props of watched[board]
        div = $.el 'div'
        x = $.el 'a',
          textContent: 'X'
        $.on x, 'click', watcher.cb.x
        link = $.el 'a', props

        $.add div, x, $.tn(' '), link
        $.add watcher.dialog, div

    watchedBoard = watched[g.BOARD] or {}
    for favicon in $$ 'img.favicon'
      id = favicon.nextSibling.name
      if id of watchedBoard
        favicon.src = Favicon.default
      else
        favicon.src = Favicon.empty

  cb:
    toggle: ->
      watcher.toggle @parentNode
    x: ->
      [board, _, id] = @nextElementSibling
        .getAttribute('href').substring(1).split('/')
      watcher.unwatch board, id

  toggle: (thread) ->
    favicon = $ 'img.favicon', thread
    id = favicon.nextSibling.name
    if favicon.src == Favicon.empty
      watcher.watch thread, id
    else # favicon.src == Favicon.default
      watcher.unwatch g.BOARD, id

  unwatch: (board, id) ->
    watched = $.get 'watched', {}
    delete watched[board][id]
    $.set 'watched', watched
    watcher.refresh()

  watch: (thread, id) ->
    props =
      href: "/#{g.BOARD}/res/#{id}"
      textContent: getTitle(thread)

    watched = $.get 'watched', {}
    watched[g.BOARD] or= {}
    watched[g.BOARD][id] = props
    $.set 'watched', watched
    watcher.refresh()

anonymize =
  init: ->
    g.callbacks.push (root) ->
      name = $ '.commentpostername, .postername', root
      name.textContent = 'Anonymous'
      if trip = $ '.postertrip', root
        if trip.parentNode.nodeName is 'A'
          $.rm trip.parentNode
        else
          $.rm trip

sauce =
  init: ->
    sauce.prefixes = conf['flavors'].match /^[^#].+$/gm
    sauce.names = sauce.prefixes.map (prefix) -> prefix.match(/(\w+)\./)[1]
    g.callbacks.push (root) ->
      return if root.className is 'inline' or not thumb = $ 'img[md5]', root
      span = $ '.filesize', root
      suffix = thumb.src
      for prefix, i in sauce.prefixes
        link = $.el 'a',
          textContent: sauce.names[i]
          href: prefix + suffix
          target: '_blank'
        $.add span, $.tn(' '), link

revealSpoilers =
  init: ->
    g.callbacks.push (root) ->
      return if not (img = $ 'img[alt^=Spoiler]', root) or root.className is 'inline'
      img.removeAttribute 'height'
      img.removeAttribute 'width'
      [_, board, imgID] = img.parentNode.href.match /(\w+)\/src\/(\d+)/
      img.src = "http://0.thumbs.4chan.org/#{board}/thumb/#{imgID}s.jpg"

Time =
  init: ->
    Time.foo()

    # GMT -8 is given as +480; would GMT +8 be -480 ?
    chanOffset = 5 - new Date().getTimezoneOffset() / 60
    # 4chan = EST = GMT -5
    chanOffset-- if $.isDST()

    @parse =
      if Date.parse '10/11/11(Tue)18:53'
        (node) -> new Date Date.parse(node.textContent) + chanOffset*HOUR
      else # Firefox the Archaic cannot parse 4chan's time
        (node) ->
          [_, month, day, year, hour, min] =
            node.textContent.match /(\d+)\/(\d+)\/(\d+)\(\w+\)(\d+):(\d+)/
          year = "20#{year}"
          month -= 1 #months start at 0
          hour = chanOffset + Number hour
          new Date year, month, day, hour, min

    g.callbacks.push Time.node
  node: (root) ->
    return if root.className is 'inline'
    node = if posttime = $('.posttime', root) then posttime else $('span[id]', root).previousSibling
    Time.date = Time.parse node
    time = $.el 'time',
      textContent: ' ' + Time.funk(Time) + ' '
    $.replace node, time
  foo: ->
    code = conf['time'].replace /%([A-Za-z])/g, (s, c) ->
      if c of Time.formatters
        "' + Time.formatters.#{c}() + '"
      else
        s
    Time.funk = Function 'Time', "return '#{code}'"
  day: [
    'Sunday'
    'Monday'
    'Tuesday'
    'Wednesday'
    'Thursday'
    'Friday'
    'Saturday'
  ]
  month: [
    'January'
    'February'
    'March'
    'April'
    'May'
    'June'
    'July'
    'August'
    'September'
    'October'
    'November'
    'December'
  ]
  zeroPad: (n) -> if n < 10 then '0' + n else n
  formatters:
    a: -> Time.day[Time.date.getDay()][...3]
    A: -> Time.day[Time.date.getDay()]
    b: -> Time.month[Time.date.getMonth()][...3]
    B: -> Time.month[Time.date.getMonth()]
    d: -> Time.zeroPad Time.date.getDate()
    e: -> Time.date.getDate()
    H: -> Time.zeroPad Time.date.getHours()
    I: -> Time.zeroPad Time.date.getHours() % 12 or 12
    k: -> Time.date.getHours()
    l: -> Time.date.getHours() % 12 or 12
    m: -> Time.zeroPad Time.date.getMonth() + 1
    M: -> Time.zeroPad Time.date.getMinutes()
    p: -> if Time.date.getHours() < 12 then 'AM' else 'PM'
    P: -> if Time.date.getHours() < 12 then 'am' else 'pm'
    y: -> Time.date.getFullYear() - 2000

getTitle = (thread) ->
  el = $ '.filetitle', thread
  if not el.textContent
    el = $ 'blockquote', thread
    if not el.textContent
      el = $ '.postername', thread
  span = $.el 'span', innerHTML: el.innerHTML.replace /<br>/g, ' '
  "/#{g.BOARD}/ - #{span.textContent}"

titlePost =
  init: ->
    d.title = getTitle()

quoteBacklink =
  init: ->
    format = conf['backlink'].replace /%id/, "' + id + '"
    quoteBacklink.funk = Function 'id', "return'#{format}'"
    g.callbacks.push (root) ->
      return if /\binline\b/.test root.className
      quotes = {}
      for quote in $$ '.quotelink', root
        #don't process >>>/b/
        continue unless qid = quote.hash[1..]
        #duplicate quotes get overwritten
        quotes[qid] = quote
      # op or reply
      id = $('input', root).name
      a = $.el 'a',
        href: "##{id}"
        className: if root.hidden then 'filtered backlink' else 'backlink'
        textContent: quoteBacklink.funk id
      for qid of quotes
        continue unless el = $.id qid
        #don't backlink the op
        continue if el.className is 'op' and !conf['OP Backlinks']
        link = a.cloneNode true
        if conf['Quote Preview']
          $.on link, 'mouseover', quotePreview.mouseover
          $.on link, 'mousemove', ui.hover
          $.on link, 'mouseout',  quotePreview.mouseout
        if conf['Quote Inline']
          $.on link, 'click', quoteInline.toggle
        unless (container = $ '.container', el) and container.parentNode is el
          container = $.el 'span', className: 'container'
          root = $('.reportbutton', el) or $('span[id]', el)
          $.after root, container
        $.add container, $.tn(' '), link

quoteInline =
  init: ->
    g.callbacks.push (root) ->
      for quote in $$ '.quotelink, .backlink', root
        continue unless quote.hash
        quote.removeAttribute 'onclick'
        $.on quote, 'click', quoteInline.toggle
  toggle: (e) ->
    return if e.shiftKey or e.altKey or e.ctrlKey or e.button isnt 0
    e.preventDefault()
    id = @hash[1..]
    if /\binlined\b/.test @className
      quoteInline.rm @, id
    else
      return if $.x("ancestor::*[@id='#{id}']", @)
      quoteInline.add @, id
    @classList.toggle 'inlined'

  add: (q, id) ->
    root = if q.parentNode.nodeName is 'FONT' then q.parentNode else if q.nextSibling then q.nextSibling else q
    if el = $.id id
      inline = quoteInline.table id, el.innerHTML
      if q.className is 'backlink'
        $.after q.parentNode, inline
        $.x('ancestor::table', el).hidden = true
        return
      $.after root, inline
    else
      inline = $.el 'td',
        className: 'reply inline'
        id: "i#{id}"
        innerHTML: "Loading #{id}..."
      $.after root, inline
      {pathname} = q
      threadID = pathname.split('/').pop()
      $.cache pathname, (-> quoteInline.parse @, pathname, id, threadID, inline)

  rm: (q, id) ->
    #select the corresponding table or loading td
    table = $.x "following::*[@id='i#{id}']", q
    for inlined in $$ '.backlink.inlined:not(.filtered)', table
      $.x('ancestor::table', $.id inlined.hash[1..]).hidden = false
    if /\bbacklink\b/.test(q.className) and not /\bfiltered\b/.test q.className
      $.x('ancestor::table', $.id id).hidden = false
    $.rm table

  parse: (req, pathname, id, threadID, inline) ->
    return unless inline.parentNode

    if req.status isnt 200
      inline.innerHTML = "#{req.status} #{req.statusText}"
      return

    body = $.el 'body',
      innerHTML: req.responseText
    if id == threadID #OP
      op = threading.op $('body > form', body).firstChild
      html = op.innerHTML
    else
      for reply in $$ 'td.reply', body
        if reply.id == id
          html = reply.innerHTML
          break
    newInline = quoteInline.table id, html
    for quote in $$ '.quotelink', newInline
      if (href = quote.getAttribute('href')) is quote.hash #add pathname to normal quotes
        quote.pathname = pathname
      else if !g.REPLY and href isnt quote.href #fix x-thread links, not x-board ones
        quote.href = "res/#{href}"
    link = $ '.quotejs', newInline
    link.href = "#{pathname}##{id}"
    link.nextSibling.href = "#{pathname}#q#{id}"
    $.addClass newInline, 'crossquote'
    $.replace inline, newInline
  table: (id, html) ->
    $.el 'table',
      className: 'inline'
      id: "i#{id}"
      innerHTML: "<tbody><tr><td class=reply>#{html}</td></tr></tbody>"

quotePreview =
  init: ->
    g.callbacks.push (root) ->
      for quote in $$ '.quotelink, .backlink', root
        continue unless quote.hash
        $.on quote, 'mouseover', quotePreview.mouseover
        $.on quote, 'mousemove', ui.hover
        $.on quote, 'mouseout',  quotePreview.mouseout
  mouseover: (e) ->
    qp = ui.el = $.el 'div',
      id: 'qp'
      className: 'replyhl'
    $.add d.body, qp

    id = @hash[1..]
    if el = $.id id
      qp.innerHTML = el.innerHTML
      $.addClass el, 'qphl' if conf['Quote Highlighting']
      if /\bbacklink\b/.test @className
        replyID = $.x('preceding::input', @).name
        for quote in $$ '.quotelink', qp
          if quote.hash[1..] is replyID
            quote.className = 'forwardlink'
    else
      qp.innerHTML = "Loading #{id}..."
      threadID = @pathname.split('/').pop() or $.x('ancestor::div[@class="thread"]/div', @).id
      $.cache @pathname, (-> quotePreview.parse @, id, threadID)
      ui.hover e
  mouseout: ->
    $.removeClass el, 'qphl' if el = $.id @hash[1..]
    ui.hoverend()
  parse: (req, id, threadID) ->
    return unless (qp = ui.el) and (qp.innerHTML is "Loading #{id}...")

    if req.status isnt 200
      qp.innerHTML = "#{req.status} #{req.statusText}"
      return

    body = $.el 'body',
      innerHTML: req.responseText
    if id == threadID #OP
      op = threading.op $('body > form', body).firstChild
      html = op.innerHTML
    else
      for reply in $$ 'td.reply', body
        if reply.id == id
          html = reply.innerHTML
          break
    qp.innerHTML = html
    Time.node qp

quoteOP =
  init: ->
    g.callbacks.push (root) ->
      return if root.className is 'inline'
      tid = g.THREAD_ID or $.x('ancestor::div[contains(@class,"thread")]/div', root).id
      for quote in $$ '.quotelink', root
        if quote.hash[1..] is tid
          quote.innerHTML += '&nbsp;(OP)'

reportButton =
  init: ->
    g.callbacks.push (root) ->
      if not a = $ '.reportbutton', root
        span = $ 'span[id]', root
        a = $.el 'a',
          className: 'reportbutton'
          innerHTML: '[&nbsp;!&nbsp;]'
        $.after span, a
        $.after span, $.tn(' ')
      $.on a, 'click', reportButton.report
  report: ->
    url = "http://sys.4chan.org/#{g.BOARD}/imgboard.php?mode=report&no=#{$.x('preceding-sibling::input', @).name}"
    id  = "#{NAMESPACE}popup"
    set = "toolbar=0,scrollbars=0,location=0,status=1,menubar=0,resizable=1,width=685,height=200"
    window.open url, id, set

threadStats =
  init: ->
    threadStats.posts = 1
    threadStats.images = if $ '.op img[md5]' then 1 else 0
    html = "<div class=move><span id=postcount>#{threadStats.posts}</span> / <span id=imagecount>#{threadStats.images}</span></div>"
    dialog = ui.dialog 'stats', 'bottom: 0; left: 0;', html
    dialog.className = 'dialog'
    threadStats.postcountEl  = $ '#postcount',  dialog
    threadStats.imagecountEl = $ '#imagecount', dialog
    $.add d.body, dialog
    g.callbacks.push threadStats.node
  node: (root) ->
    return if root.className
    threadStats.postcountEl.textContent = ++threadStats.posts
    if $ 'img[md5]', root
      threadStats.imagecountEl.textContent = ++threadStats.images
      if threadStats.images > 150
        threadStats.imagecountEl.className = 'error'

unread =
  init: ->
    unread.replies = []
    d.title = '(0) ' + d.title
    $.on window, 'scroll', unread.scroll
    g.callbacks.push unread.node

  node: (root) ->
    return if root.hidden or root.className
    unread.replies.push root
    unread.updateTitle()
    if unread.replies.length is 1
      Favicon.update()

  scroll: ->
    updater.focus = true
    height = d.body.clientHeight
    for reply, i in unread.replies
      {bottom} = reply.getBoundingClientRect()
      if bottom > height #post is not completely read
        break
    return if i is 0

    unread.replies = unread.replies[i..]
    unread.updateTitle()
    if unread.replies.length is 0
      Favicon.update()

  updateTitle: ->
    d.title = d.title.replace /\d+/, unread.replies.length

Favicon =
  init: ->
    favicon = $ 'link[rel="shortcut icon"]', d.head
    favicon.type = 'image/x-icon'
    {href} = favicon
    Favicon.default = href
    Favicon.unread = if /ws/.test href then Favicon.unreadSFW else Favicon.unreadNSFW

  dead: 'data:image/gif;base64,R0lGODlhEAAQAKECAAAAAP8AAP///////yH5BAEKAAIALAAAAAAQABAAAAIvlI+pq+D9DAgUoFkPDlbs7lFZKIJOJJ3MyraoB14jFpOcVMpzrnF3OKlZYsMWowAAOw=='
  empty: 'data:image/gif;base64,R0lGODlhEAAQAJEAAAAAAP///9vb2////yH5BAEAAAMALAAAAAAQABAAAAIvnI+pq+D9DBAUoFkPFnbs7lFZKIJOJJ3MyraoB14jFpOcVMpzrnF3OKlZYsMWowAAOw=='
  unreadDead: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAANhJREFUOMutU0EKwjAQzEPFgyBFei209gOKINh6tL3qO3yAB9OHWPTeMZsmJaRpiNjAkE1mMt1stgwA+wdsFgM1oHE4FXmSpWUcRzWBYtozNfKAYdCHCrQuosX9tlk+CBS7NKMMbMF7vXoJtC7Om8HwhXzbCWCSn6qBJHd74FIBVS1jm7czYFSsq7gvpY0s6+ThJwc4743EHnGkIW2YAW+AphkMPj6DJE1LXW3fFUhD2pHBsTznLKCIFCstC3nGNvQZnQa6kX4yMGfdyi7OZaB7wZy93Cx/4xfgv/s+XYFMrAAAAABJRU5ErkJggg%3D%3D'
  unreadSFW: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAN9JREFUOMtj+P//PwMlmIEqBkDBfxie2NdVVVFaMikzPXsuCIPYIDFkNWANSAb815t+GI5B/Jj8iQfjapafBWEQG5saDBegK0ja8Ok9EH/AJofXBTBFlUf+/wPi/7jkcYYBCLef/v9/9pX//+cAMYiNLo/uAgZQYMVVLzsLcnYF0GaQ5otv/v+/9BpiEEgMJAdSA1JLlAGXgAZcfoNswGfcBpQDowoW2vi8AFIDUothwOQJvVXIgYUrEEFsqFoGYqLxA7HRiNUAWEIiyQBkGpaUsclhMwCWFpBpvHJUyY0AmdYZKFRtAsoAAAAASUVORK5CYII%3D'
  unreadNSFW: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAOBJREFUOMtj+P//PwMlmIEqBkDBfxie2DWxqqykYlJ6dtZcEAaxQWLIasAakAz4n3bGGI5B/JiJ8QfjlsefBWEQG5saDBegKyj5lPQeiD9gk8PrApiinv+V/4D4Py55nGEAwrP+t/9f/X82EM8Bs9Hl0V3AAAqsuGXxZ0HO7vlf8Q+k+eb/i0B8CWwQSAwkB1IDUkuUAbeAmm/9v4ww4DMeA8pKyifBQhufF0BqQGoxDJjcO7kKObBwBSKIDVXLQEw0fiA2GrEaAEtIJBmATMOSMjY5bAbA0gIyjVeOKrkRAMefDK/b7ecEAAAAAElFTkSuQmCC'

  update: ->
    l = unread.replies.length

    favicon = $ 'link[rel="shortcut icon"]', d.head
    favicon.href =
      if g.dead
        if l
          Favicon.unreadDead
        else
          Favicon.dead
      else
        if l
          Favicon.unread
        else
          Favicon.default

    #XXX `favicon.href = href` doesn't work on Firefox
    clone = favicon.cloneNode true
    $.replace favicon, clone

redirect = ->
  switch g.BOARD
    when 'a', 'jp', 'm', 'tg', 'tv'
      url = "http://archive.foolz.us/#{g.BOARD}/thread/#{g.THREAD_ID}"
    when 'lit'
      url = "http://archive.gentoomen.org/cgi-board.pl/#{g.BOARD}/thread/#{g.THREAD_ID}"
    when 'diy', 'g', 'sci'
      url = "http://archive.installgentoo.net/#{g.BOARD}/thread/#{g.THREAD_ID}"
    when '3', 'adv', 'an', 'ck', 'co', 'fa', 'fit', 'int', 'k', 'mu', 'n', 'o', 'p', 'po', 'pol', 'soc', 'sp', 'toy', 'trv', 'v', 'vp', 'x'
      url = "http://archive.no-ip.org/#{g.BOARD}/thread/#{g.THREAD_ID}"
    else
      url = "http://boards.4chan.org/#{g.BOARD}"
  location.href = url

imgHover =
  init: ->
    g.callbacks.push (root) ->
      return unless thumb = $ 'img[md5]', root
      $.on thumb, 'mouseover', imgHover.mouseover
      $.on thumb, 'mousemove', ui.hover
      $.on thumb, 'mouseout',  ui.hoverend
  mouseover: ->
    ui.el = $.el 'img'
      id: 'iHover'
      src: @parentNode.href
    $.add d.body, ui.el

imgPreloading =
  init: ->
    unless controls = $.id 'imgControls'
      controls = $.el 'div',
        id: 'imgControls'
      form = $ 'body > form'
      $.prepend form, controls

    label = $.el 'label',
      innerHTML: 'Preload Images<input type=checkbox id=imagePreload>'
    $.on $('input', label), 'click', imgPreloading.click
    $.add controls, label

    g.callbacks.push imgPreloading.node

  click: ->
    if imgPreloading.on = @checked
      for thumb in $$ 'img[md5]:last-child'
        imgPreloading.preload thumb
  node: (root) ->
    return unless imgPreloading.on and thumb = $ 'img[md5]:last-child', root
    imgPreloading.preload thumb
  preload: (thumb) ->
    $.el 'img', src: thumb.parentNode.href

imgGif =
  init: ->
    g.callbacks.push (root) ->
      return unless thumb = $ 'img[md5]', root
      src = thumb.parentNode.href
      if /gif$/.test src
        thumb.src = src

imgExpand =
  init: ->
    g.callbacks.push imgExpand.node
    imgExpand.dialog()

  node: (root) ->
    return unless thumb = $ 'img[md5]', root
    a = thumb.parentNode
    $.on a, 'click', imgExpand.cb.toggle
    if imgExpand.on and root.className isnt 'inline' then imgExpand.expand a.firstChild
  cb:
    toggle: (e) ->
      return if e.shiftKey or e.altKey or e.ctrlKey or e.button isnt 0
      e.preventDefault()
      imgExpand.toggle @
    all: ->
      imgExpand.on = @checked
      if imgExpand.on #expand
        for thumb in $$ 'img[md5]:not([hidden])'
          imgExpand.expand thumb
      else #contract
        for thumb in $$ 'img[md5][hidden]'
          imgExpand.contract thumb
    typeChange: ->
      switch @value
        when 'full'
          klass = ''
        when 'fit width'
          klass = 'fitwidth'
        when 'fit height'
          klass = 'fitheight'
        when 'fit screen'
          klass = 'fitwidth fitheight'
      form = $('body > form')
      form.className = klass
      if /\bfitheight\b/.test form.className
        $.on window, 'resize', imgExpand.resize
        unless imgExpand.style
          imgExpand.style = $.addStyle ''
        imgExpand.resize()
      else if imgExpand.style
        $.off window, 'resize', imgExpand.resize

  toggle: (a) ->
    thumb = a.firstChild
    if thumb.hidden
      imgExpand.contract thumb
    else
      imgExpand.expand thumb

  contract: (thumb) ->
    thumb.hidden = false
    $.rm thumb.nextSibling

  expand: (thumb) ->
    a = thumb.parentNode
    img = $.el 'img',
      src: a.href
    unless a.parentNode.className is 'op'
      filesize = $ '.filesize', a.parentNode
      [_, max] = filesize.textContent.match /(\d+)x/
      img.style.maxWidth = "-moz-calc(#{max}px)"
    $.on img, 'error', imgExpand.error
    thumb.hidden = true
    $.add a, img

  error: ->
    thumb = @previousSibling
    imgExpand.contract thumb
    #navigator.online is not x-browser/os yet
    if navigator.appName isnt 'Opera'
      req = $.ajax @src, null, 'head'
      req.onreadystatechange = -> setTimeout imgExpand.retry, 10000, thumb if @status isnt 404
    else unless g.dead
      setTimeout imgExpand.retry, 10000, thumb
  retry: (thumb) ->
    imgExpand.expand thumb unless thumb.hidden

  dialog: ->
    controls = $.el 'div',
      id: 'imgControls'
      innerHTML:
        "<select id=imageType name=imageType><option>full</option><option>fit width</option><option>fit height</option><option>fit screen</option></select>
        <label>Expand Images<input type=checkbox id=imageExpand></label>"
    imageType = $.get 'imageType', 'full'
    for option in $$ 'option', controls
      if option.textContent is imageType
        option.selected = true
        break
    select = $ 'select', controls
    imgExpand.cb.typeChange.call select
    $.on select, 'change', $.cb.value
    $.on select, 'change', imgExpand.cb.typeChange
    $.on $('input', controls), 'click', imgExpand.cb.all

    form = $ 'body > form'
    $.prepend form, controls

  resize: ->
    imgExpand.style.innerHTML = ".fitheight img + img {max-height:#{d.body.clientHeight}px;}"

firstRun =
  init: ->
    style = $.addStyle "
      #navtopr, #navbotr {
        position: relative;
      }
      #navtopr::before {
        content: '';
        height: 50px;
        width: 100px;
        background: red;
        -webkit-transform: rotate(-45deg);
        -moz-transform: rotate(-45deg);
        -o-transform: rotate(-45deg);
        -webkit-transform-origin: 100% 200%;
        -moz-transform-origin: 100% 200%;
        -o-transform-origin: 100% 200%;
        position: absolute;
        top: 100%;
        right: 100%;
        z-index: 999;
      }
      #navtopr::after {
        content: '';
        border-top: 100px solid red;
        border-left: 100px solid transparent;
        position: absolute;
        top: 100%;
        right: 100%;
        z-index: 999;
      }
      #navbotr::before {
        content: '';
        height: 50px;
        width: 100px;
        background: red;
        -webkit-transform: rotate(45deg);
        -moz-transform: rotate(45deg);
        -o-transform: rotate(45deg);
        -webkit-transform-origin: 100% -100%;
        -moz-transform-origin: 100% -100%;
        -o-transform-origin: 100% -100%;
        position: absolute;
        bottom: 100%;
        right: 100%;
        z-index: 999;
      }
      #navbotr::after {
        content: '';
        border-bottom: 100px solid red;
        border-left: 100px solid transparent;
        position: absolute;
        bottom: 100%;
        right: 100%;
        z-index: 999;
      }
    "
    style.className = 'firstrun'

    dialog = $.el 'div',
      id: 'overlay'
      className: 'firstrun'
      innerHTML: '
<div id=options class="reply dialog">
  <p>Click the <strong>4chan X</strong> buttons for options; they are at the top and bottom of the page.</p>
  <p>Updater options are in the updater dialog in replies at the bottom-right corner of the window.</p>
  <p>If you don\'t see the buttons, try disabling your userstyles.</p>
</div>'
    $.add d.body, dialog

    $.on window, 'click', firstRun.close

  close: ->
    $.set 'firstrun', true
    $.rm $ 'style.firstrun', d.head
    $.rm $ '#overlay'
    $.off window, 'click', firstRun.close

Main =
  init: ->
    g.XHR2 = FormData?
    if location.hostname is 'sys.4chan.org'
      if d.body
        Post.sys()
      else
        $.on d, 'DOMContentLoaded', Post.sys
      return

    $.on window, 'message', Main.message

    pathname = location.pathname.substring(1).split('/')
    [g.BOARD, temp] = pathname
    if temp is 'res'
      g.REPLY = temp
      g.THREAD_ID = pathname[2]
    else
      g.PAGENUM = parseInt(temp) or 0

    g.hiddenReplies = $.get "hiddenReplies/#{g.BOARD}/", {}

    lastChecked = $.get 'lastChecked', 0
    now = Date.now()
    Main.reqUpdate = lastChecked < now - 1*DAY

    if Main.reqUpdate
      $.set 'lastChecked', now

      cutoff = now - 7*DAY
      hiddenThreads = $.get "hiddenThreads/#{g.BOARD}/", {}

      for id, timestamp of hiddenThreads
        if timestamp < cutoff
          delete hiddenThreads[id]

      for id, timestamp of g.hiddenReplies
        if timestamp < cutoff
          delete g.hiddenReplies[id]

      $.set "hiddenThreads/#{g.BOARD}/", hiddenThreads
      $.set "hiddenReplies/#{g.BOARD}/", g.hiddenReplies


    #major features
    if conf['Filter']
      filter.init()

    if conf['Reply Hiding']
      replyHiding.init()

    if conf['Filter'] or conf['Reply Hiding']
      strikethroughQuotes.init()

    if conf['Anonymize']
      anonymize.init()

    if conf['Time Formatting']
      Time.init()

    if conf['Sauce']
      sauce.init()

    if conf['Image Auto-Gif']
      imgGif.init()

    if conf['Image Hover']
      imgHover.init()

    if conf['Report Button']
      reportButton.init()

    if conf['Quote Inline']
      quoteInline.init()

    if conf['Quote Preview']
      quotePreview.init()

    if conf['Quote Backlinks']
      quoteBacklink.init()

    if conf['Indicate OP quote']
      quoteOP.init()


    if d.body
      Main.onLoad()
    else
      $.on d, 'DOMContentLoaded', Main.onLoad

  onLoad: ->
    $.off d, 'DOMContentLoaded', Main.onLoad
    if conf['404 Redirect'] and d.title is '4chan - 404' and /^\d+$/.test g.THREAD_ID
      redirect()
      return
    if not $ '#navtopr'
      return
    Main.globalMessage()
    $.addStyle Main.css
    threading.init()
    Favicon.init()

    #major features
    if conf['Image Expansion']
      imgExpand.init()

    if conf['Reveal Spoilers'] and $('.postarea label')
      revealSpoilers.init()

    if conf['Quick Reply']
      Post.init()
      #QR.init()

    if conf['Thread Watcher']
      watcher.init()

    if conf['Keybinds']
      keybinds.init()

    if g.REPLY
      if conf['Thread Updater']
        updater.init()

      if conf['Thread Stats']
        threadStats.init()

      if conf['Image Preloading']
        imgPreloading.init()

      if conf['Reply Navigation']
        nav.init()

      if conf['Post in Title']
        titlePost.init()

      if conf['Unread Count']
        unread.init()

    else #not reply
      if conf['Thread Hiding']
        threadHiding.init()

      if conf['Thread Expansion']
        expandThread.init()

      if conf['Comment Expansion']
        expandComment.init()

      if conf['Index Navigation']
        nav.init()


    nodes = $$ '.op, a + table'
    g.callbacks.forEach (callback) ->
      try
        nodes.forEach callback
      catch err
        alert err
    $.on $('form[name=delform]'), 'DOMNodeInserted', Main.node
    options.init()

    unless $.get 'firstrun'
      firstRun.init()

  globalMessage: ->
    ###
    http://code.google.com/p/chromium/issues/detail?id=20773
    Let content scripts see other frames (instead of them being undefined)

    To access the parent, we have to break out of the sandbox and evaluate
    in the global context.
    ###
    $.globalEval ->
      window.addEventListener('message', (e) ->
        {data} = e
        if data.to is 'sys'
          document.getElementById('iframe').contentWindow.postMessage data, '*'
      , false)

  message: (e) ->
    {data} = e
    {to} = data
    switch to
      when 'Post.message'
        Post.message data

  node: (e) ->
    {target} = e
    return unless target.nodeName is 'TABLE'
    g.callbacks.forEach (callback) ->
      try
        callback target
      catch err
        #nothing

  css: '
      /* dialog styling */
      div.dialog {
        border: 1px solid;
      }
      div.dialog > div.move {
        cursor: move;
      }
      label, a, .favicon {
        cursor: pointer;
      }

      .new {
        background: lime;
      }
      .error {
        color: red;
      }
      td.replyhider {
        vertical-align: top;
      }

      div.thread.stub > *:not(.block) {
        display: none;
      }

      .filesize + br + a {
        float: left;
        pointer-events: none;
      }
      img[md5], img + img {
        pointer-events: all;
      }
      .fitwidth img + img {
        max-width: 100%;
        width: -moz-calc(100%); /* hack so only firefox sees this */
      }

      #qp, #iHover {
        position: fixed;
      }

      #iHover {
        max-height: 100%;
      }

      #navlinks {
        font-size: 16px;
        position: fixed;
        top: 25px;
        right: 5px;
      }

      #overlay {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        text-align: center;
        background: rgba(0,0,0,.5);
      }
      #overlay::before {
        content: "";
        display: inline-block;
        height: 100%;
        vertical-align: middle;
      }
      #options {
        display: inline-block;
        padding: 5px;
        text-align: left;
        vertical-align: middle;
        width: 500px;
      }
      #credits {
        float: right;
      }
      #options ul {
        list-style: none;
        padding: 0;
      }
      #options label {
        text-decoration: underline;
      }
      #options [name=tab]:not(:checked) + * {
        display: none;
      }
      #content > * {
        height: 450px;
        overflow: auto;
      }
      #content textarea {
        margin: 0;
        min-height: 100px;
        resize: vertical;
        width: 100%;
      }

      #updater {
        position: fixed;
        text-align: right;
      }
      #updater input[type=text] {
        width: 50px;
      }
      #updater:not(:hover) {
        border: none;
        background: transparent;
      }
      #updater:not(:hover) > div:not(.move) {
        display: none;
      }

      #stats {
        border: none;
        position: fixed;
      }

      #watcher {
        position: absolute;
      }
      #watcher > div {
        overflow: hidden;
        padding-right: 5px;
        padding-left: 5px;
        text-overflow: ellipsis;
        max-width: 200px;
        white-space: nowrap;
      }
      #watcher > div.move {
        text-decoration: underline;
        padding-top: 5px;
      }
      #watcher > div:last-child {
        padding-bottom: 5px;
      }

      #qp {
        border: 1px solid;
        padding-bottom: 5px;
      }
      #qp input, #qp .inline {
        display: none;
      }
      .qphl {
        outline: 2px solid rgba(216, 94, 49, .7);
      }
      .inlined {
        opacity: .5;
      }
      .inline td.reply {
        background-color: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(128, 128, 128, 0.5);
      }
      .filetitle, .replytitle, .postername, .commentpostername, .postertrip {
        background: none;
      }
      .filtered {
        text-decoration: line-through;
      }

      /* Firefox bug: hidden tables are not hidden. fixed in 9.0 */
      [hidden] {
        display: none;
      }

      #files > input {
        display: block;
      }
      #qr > .move {
        text-align: right;
      }
      #qr textarea {
        border: 0;
        height: 150px;
        width: 100%;
      }
      #qr #files {
        width: 300px;
        white-space: nowrap;
        overflow: auto;
        margin: 0;
        padding: 0;
      }
      #qr #files a {
        position: absolute;
        left: 0;
        font-size: 50px;
        color: red;
        z-index: 1;
      }
      #qr #cl {
        right: 0;
        padding: 2px;
        position: absolute;
      }
      #qr #files input {
        /* cannot use `display: none;`
        https://bugs.webkit.org/show_bug.cgi?id=58208
        http://code.google.com/p/chromium/issues/detail?id=78961
        */
        font-size: 100px;
        opacity: 0;
      }
      #qr #files img {
        position: absolute;
        left: 0;
        max-height: 100px;
        max-width:  100px;
      }
      #qr button + input[type=file] {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }
      #qr .wat {
        display: inline-block;
        width: 16px;
        overflow: hidden;
        position: relative;
        vertical-align: text-top;
      }
      #qr .wat input {
        opacity: 0;
        position: absolute;
        left: 0;
      }

      #post {
        position: fixed;
      }
      #post ul {
        margin: 0;
        padding: 0;
        width: 300px;
        overflow: auto;
        white-space: nowrap;
      }
      #post li {
        display: inline-block;
        position: relative;
        overflow: hidden;
        width: 100px;
        height: 100px;
      }
      #post #items .close {
        position: absolute;
        color: red;
        font-size: 14pt;
        z-index: 1;
      }
      #items img {
        max-height: 100px;
        max-width: 100px;
        position: absolute;
      }
      #post #foo input {
        width: 97px;
      }
      #post textarea {
        border: 0;
        margin: 0;
        width: 300px;
        height: 150px;
      }
      #post #recaptcha_response_field {
        width: 100%;
      }
      #post #items input {
        /* cannot use `display: none;`
        https://bugs.webkit.org/show_bug.cgi?id=58208
        http://code.google.com/p/chromium/issues/detail?id=78961
        */
        font-size: 100px;
        opacity: 0;
      }
      #post .close, #post #autohide {
        float: right;
      }
      #post .autohide {
        clear: both;
      }
      #post:not(:hover) #autohide:checked ~ .autohide {
        height: 0;
        overflow: hidden;
      }
      #post #reholder {
        position: relative;
      }
      #post #charCount {
        position: absolute;
        right: 25px;
        top: 5px;
      }
      #post #fileSpan {
        position: absolute;
        right: 5px;
        top: 5px;
        width: 16px;
        height: 16px;
        overflow: hidden;
      }
      #fileSpan img {
        position: absolute;
      }
      #fileSpan input {
        opacity: 0;
        margin: 0;
      }
    '

Main.init()
