/*
 * Plugin: Keyboard Shortcuts
 *
 * Add keyboard shortcuts to OWRX receiver interface.
 * press '?' for help.
 *
 */

// Initialize the plugin
Plugins.keyboard_shortcuts.init = function () {

  // create the help overlay
  Plugins.keyboard_shortcuts.overlay = jQuery('<div id="ks-overlay"></div>');
  Plugins.keyboard_shortcuts.overlay.hide();
  Plugins.keyboard_shortcuts.overlay.appendTo(document.body);

  // catch all key presses
  $(document).on('keydown', function (e) {
    // check if we are focusiing an input
    var on_input = !!($('input:focus').length && $('input:focus')[0].type === 'text');

    // handle the global shortcuts, which will work even if an input is focused
    // please use modifier keys (like ctrl and alt) always
    var handled = false;
    switch (String(e.key).toLowerCase()) {
      // open chat
      case 'c':
        if (e.altKey) {
          $('.button[data-toggle-panel="openwebrx-panel-log"').click();
          setTimeout(function () {
            $('#openwebrx-chat-message').focus();
          }, 100);
          handled = true;
          notify('CHAT: toggle');
        }
        break;

        // open map
      case 'm':
        if (e.altKey) {
          var z = $('a.button[href="map"]');
          $('a.button[target="openwebrx-map"]')[0].click();
          handled = true;
          notify('MAP: open');
        }
        break;
    }

    // these shortcuts will be handled only when no input is focused
    if (!on_input && !handled)
      switch (String(e.key).toLowerCase()) {
        // hide help
        case 'escape':
          Plugins.keyboard_shortcuts.overlay.slideUp(100);
          break;

          // show/hide help
        case '?':
          Plugins.keyboard_shortcuts.overlay.slideToggle(100);
          notify('HELP: toggle');
          break;

          // change to previous profile
        case ',':
          var sel = $('#openwebrx-sdr-profiles-listbox');
          var prev_val = sel.find(':selected').prev().val();
          if (prev_val) sel.val(prev_val).change();
          notify('PROFILE: -');
          break;

          // change to next profile
        case '.':
          var sel = $('#openwebrx-sdr-profiles-listbox');
          var next_val = sel.find(':selected').next().val();
          if (next_val) sel.val(next_val).change();
          notify('PROFILE: +');
          break;

          // change 10 profiles behind
        case '<':
          var sel = $('#openwebrx-sdr-profiles-listbox');
          var prev_el = sel.find(':selected'); // get current (option) element
          var last_val;
          for (var i = 0;
            (i < 10 && prev_el.val()); i++) {
            prev_el = prev_el.prev();
            if (prev_el && prev_el.val()) last_val = prev_el.val();
          }
          if (last_val) sel.val(last_val).change();
          notify('PROFILE: -10');
          break;

          // change 10 profile ahead
        case '>':
          var sel = $('#openwebrx-sdr-profiles-listbox');
          var next_el = sel.find(':selected'); // get current (option) element
          var last_val;
          for (var i = 0;
            (i < 10 && next_el.val()); i++) {
            next_el = next_el.next();
            if (next_el && next_el.val()) last_val = next_el.val();
          }
          if (last_val) sel.val(last_val).change();
          notify('PROFILE: +10');
          break;

          // toggle mute
        case 'm':
          UI.toggleMute();
          notify('MUTE: toggle');
          break;

          // change volume
        case '-':
        case '+':
        case '=':
          var vol = $('#openwebrx-panel-volume');
          vol.val(parseInt(vol.val()) + (e.key === '-' ? -1 : +1)).change();
          notify('VOL: ' + (e.key === '-' ? '-' : '+'));
          break;

          // change squelch
        case ';':
        case '\'':
          var sql = $('.openwebrx-squelch-slider');
          sql.val(parseInt(sql.val()) + (e.key === ';' ? -1 : +1)).change();
          notify('SQL: ' + (e.key === ';' ? '-' : '+'));
          break;

          // auto set squelch / start scanner
        case 's':
          $('.openwebrx-squelch-auto').trigger(e.shiftKey ? 'contextmenu' : 'click');
          notify((e.shiftKey ? 'SCANNER: toggle' : 'SQL: auto'));
          break;

          // update waterfall colors
        case 'w':
          $('#openwebrx-waterfall-colors-auto').trigger(e.shiftKey ? 'contextmenu' : 'click');
          notify((e.shiftKey ? 'WATERFALL: continuous' : 'WATERFALL: auto'));
          break;

          // zoom controls
        case 'z':
          e.shiftKey ? zoomInTotal() : zoomInOneStep();
          notify((e.shiftKey ? 'ZOOM: ++' : 'ZOOM: +'));
          break;
        case 'x':
          e.shiftKey ? zoomOutTotal() : zoomOutOneStep();
          notify((e.shiftKey ? 'ZOOM: --' : 'ZOOM: -'));
          break;

          // bookmarks
        case '[':
        case ']':
          var bms = $('#openwebrx-bookmarks-container .bookmark').find('.bookmark-content');
          var idx = Plugins.keyboard_shortcuts.bookmarkIdx;
          idx = typeof idx !== 'undefined' || idx == -1 ? idx : (e.key === '[' ? bms.length : -1);
          if (bms.length) {
            idx += (e.key === '[') ? -1 : 1; // change index
            idx = Math.min(Math.max(idx, 0), bms.length - 1); // limit to min/max
            bms.eq(idx).click();
            Plugins.keyboard_shortcuts.bookmarkIdx = parseInt(idx);
            notify('BOOKMARK: ' + (parseInt(idx)+1));
          }
          break;
      }
  });


  function gen_key(key) {
    var keymap = {
      ',': ', <b style="font-size: 0.7rem">comma</b>',
      '.': '. <b style="font-size: 0.7rem">dot</b>',
      ';': '; <b style="font-size: 0.7rem">semicolon</b>',
      '\'': '\' <b style="font-size: 0.7rem">apostrophe</b>',
      'SHIFT': '&#8679; Shift',
      'CONTROL': '&#8963; Ctrl',
      'COMMAND': '&#8984; Cmd',
      'ALT': '&#8997; Alt',
      'OPTION': '&#8997; Opt',
      'ENTER': '&crarr; Enter',
      'RETURN': '&crarr; Enter',
      'DELETE': '&#8998; Del',
      'BACKSPACE': '&#9003; BS',
      'ESCAPE': '&#9099; ESC',
      'ARROWRIGHT': '&rarr;',
      'ARROWLEFT': '&larr;',
      'ARROWUP': '&uarr;',
      'ARROWDOWN': '&darr;',
      'PAGEUP': '&#8670; PgUp',
      'PAGEDOWN': '&#8671; PgDn',
      'HOME': '&#8598; Home',
      'END': '&#8600; End',
      'TAB': '&#8677; Tab',
      'SPACE': '&#9251; Space',
      'INTERVAL': '&#9251; Space',
    };
    var k = keymap[key.toUpperCase()] || key.toUpperCase();
    return `<button class="kbc-button kbc-button-sm" title="${key}"><b>${k}</b></button>`;
  }
  // fill the help overlay
  // i'm not using overlay.html('') on purpose
  // vscode syntax highlighting with 'nicolasparada.innerhtml' extension is working this way
  Plugins.keyboard_shortcuts.overlay[0].innerHTML = `
    <div class="ks-title">Keyboard shortcuts</div>
    <div class="ks-subtitle">Hide this help with '?' or Escape.</div>
    <div class="ks-separator"></div>
    <div class="ks-content">

      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key(',')}|${gen_key('.')}</div>
        <div class="ks-item-txt">change profile</div>
      </div>
      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key('Z')}|${gen_key('X')}</div>
        <div class="ks-item-txt">zoom IN/OUT 1 step </div>
      </div>
      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key('W')}</div>
        <div class="ks-item-txt">auto set waterfall colors</div>
      </div>


      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key('&lt;')}|${gen_key('&gt;')}</div>
        <div class="ks-item-txt">change profile by 10</div>
      </div>
      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key('Shift')}+${gen_key('Z')}|${gen_key('X')}</div>
        <div class="ks-item-txt">zoom IN/OUT full</div>
      </div>
      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key('Shift')}+${gen_key('W')}</div>
        <div class="ks-item-txt">continuous set waterfall colors</div>
      </div>


      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key('M')}|${gen_key('-')}|${gen_key('+/=')}</div>
        <div class="ks-item-txt">toggle mute or change volume</div>
      </div>
      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key('S')}|${gen_key(';')}|${gen_key('\'')}</div>
        <div class="ks-item-txt">auto set or change squelch</div>
      </div>
      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key('Shift')}+${gen_key('S')}</div>
        <div class="ks-item-txt">toggle scanner</div>
      </div>

      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key('Alt')}+${gen_key('C')}</div>
        <div class="ks-item-txt">toggle chat panel</div>
      </div>
      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key('Alt')}+${gen_key('M')}</div>
        <div class="ks-item-txt">open MAP</div>
      </div>
      <div class="ks-item">
        <div class="ks-item-kbd">${gen_key('[')}|${gen_key(']')}</div>
        <div class="ks-item-txt">change bookmark</div>
      </div>

    </div>
 `;


  // reset bookmark index on profile change.
  // this will work only if 'utils' plugin is loaded, but it's not a reqirement
  $(document).on('event:profile_changed', function (e, data) {
    Plugins.keyboard_shortcuts.bookmarkIdx = -1;
  });

  // show notification
  function notify(text) {
    // create the message div if it's not there
    if ($("#ks-notification").length < 1)
      $("body").append("<div id='ks-notification'></div>");

    // set the message text
    $("#ks-notification").html(text);

    // show the message
    $("#ks-notification").fadeIn('fast');

    // clear the timeout of previous message (if exists)
    clearTimeout(Plugins.keyboard_shortcuts.notify_timeout);

    // timeout the current message
    Plugins.keyboard_shortcuts.notify_timeout = setTimeout('$("#ks-notification").fadeOut("fast")', 1000);
  }

  return true;
}