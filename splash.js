(function () {
  'use strict';

  var SOUND_URL = 'sound/pannekage.mp3';
  // Phones often keep a home screen app alive in the background instead of
  // reloading it, so "opening" the app can just mean coming back to it.
  // Show the splash again when the app has been away at least this long.
  var RESHOW_AFTER_MS = 60 * 1000;
  // Fallback in case the sound never reports that it ended.
  var MAX_PLAY_MS = 9000;

  var splash = document.getElementById('splash');
  var title = splash.querySelector('.splash-title');
  var audio = new Audio();
  audio.preload = 'auto';

  // states: 'starting' (trying to play by itself), 'blocked' (waiting for a tap),
  // 'playing', 'hidden'
  var state = 'hidden';
  var timer = null;
  var hiddenAt = 0;

  // Split the title into letters so they can bounce in one at a time.
  title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
  var letterIndex = 0;
  title.querySelectorAll('.word').forEach(function (word) {
    var text = word.textContent;
    word.textContent = '';
    word.setAttribute('aria-hidden', 'true');
    Array.prototype.forEach.call(text, function (ch) {
      var span = document.createElement('span');
      span.className = 'ch';
      span.textContent = ch;
      span.style.setProperty('--i', letterIndex++);
      word.appendChild(span);
    });
  });

  // Load the sound into memory, so it plays offline from the app cache and the
  // browser doesn't need to stream it while it plays.
  var soundLoaded = fetch(SOUND_URL)
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.blob();
    })
    .then(function (blob) {
      // A tap may already have started the sound from its URL; don't restart it.
      if (!audio.src) audio.src = URL.createObjectURL(blob);
    })
    .catch(function () {
      if (!audio.src) audio.src = SOUND_URL;
    });

  function setState(next) {
    state = next;
    splash.dataset.state = next;
  }

  function show() {
    clearTimeout(timer);
    splash.hidden = false;
    splash.classList.remove('leaving');
    // Restart the letter animation.
    splash.classList.remove('animate');
    void splash.offsetWidth;
    splash.classList.add('animate');
    setState('starting');

    soundLoaded.then(function () {
      if (state !== 'starting') return;
      play().then(onPlaying, function () {
        if (state === 'starting') setState('blocked');
      });
    });
  }

  function play() {
    try {
      audio.currentTime = 0;
    } catch (e) { /* not loaded yet */ }
    var result = audio.play();
    return result && result.then ? result : Promise.resolve();
  }

  function onPlaying() {
    if (state === 'hidden') return;
    setState('playing');
    clearTimeout(timer);
    timer = setTimeout(hide, MAX_PLAY_MS);
  }

  function hide() {
    if (state === 'hidden') return;
    clearTimeout(timer);
    setState('hidden');
    splash.classList.add('leaving');
    // Remove it once the fade-out is done.
    timer = setTimeout(function () { splash.hidden = true; }, 400);
  }

  // A tap starts the sound when the phone didn't allow it to start by itself,
  // and skips the rest of the splash when it is already playing.
  splash.addEventListener('click', function () {
    if (state === 'playing') {
      hide();
    } else if (state === 'starting' || state === 'blocked') {
      if (!audio.src) audio.src = SOUND_URL;
      setState('playing');
      play().then(onPlaying, function () {
        clearTimeout(timer);
        timer = setTimeout(hide, 1200);
      });
    }
  });

  audio.addEventListener('ended', function () {
    if (state === 'playing') hide();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      hiddenAt = Date.now();
      audio.pause();
      if (state === 'playing') hide();
    } else if (state === 'hidden' && hiddenAt && Date.now() - hiddenAt >= RESHOW_AFTER_MS) {
      show();
    }
  });

  show();
})();
