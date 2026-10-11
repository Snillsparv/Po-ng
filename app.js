(function () {
  'use strict';

  var STORAGE_KEY = 'poang.scores.v1';
  // Bars are scaled against at least this many points, so the first few points
  // give short bars that grow instead of instantly filling the whole height.
  var MIN_SCALE = 10;

  var board = document.getElementById('board');
  var players = Array.prototype.slice.call(document.querySelectorAll('.player'));
  var scores = load();

  function load() {
    var saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) { /* no storage available, start from zero */ }
    var result = {};
    players.forEach(function (el) {
      var value = saved[el.dataset.id];
      result[el.dataset.id] = typeof value === 'number' && isFinite(value) ? value : 0;
    });
    return result;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (e) { /* ignore, the scores still show for this session */ }
  }

  function render() {
    var values = players.map(function (el) { return scores[el.dataset.id]; });
    var maxPos = Math.max.apply(null, [0].concat(values));
    var maxNeg = Math.max.apply(null, [0].concat(values.map(function (v) { return -v; })));
    var range = Math.max(maxPos + maxNeg, MIN_SCALE);
    var zero = maxNeg / range;

    board.style.setProperty('--zero', zero);

    players.forEach(function (el) {
      var value = scores[el.dataset.id];
      var bar = el.querySelector('.bar');
      var height = Math.abs(value) / range;

      bar.classList.toggle('negative', value < 0);
      bar.style.height = (height * 100) + '%';
      bar.style.bottom = ((value < 0 ? zero - height : zero) * 100) + '%';
      el.querySelector('.score').textContent = value < 0 ? '−' + Math.abs(value) : String(value);
    });
  }

  function pop(el) {
    var score = el.querySelector('.score');
    score.classList.remove('pop');
    void score.offsetWidth; // restart the animation
    score.classList.add('pop');
  }

  players.forEach(function (el) {
    el.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        scores[el.dataset.id] += Number(btn.dataset.delta);
        save();
        render();
        pop(el);
        if (navigator.vibrate) navigator.vibrate(12);
      });
    });
  });

  document.getElementById('reset').addEventListener('click', function () {
    if (!confirm('Nollställa poängen för båda?')) return;
    players.forEach(function (el) { scores[el.dataset.id] = 0; });
    save();
    render();
  });

  // Keep several open copies (e.g. a browser tab and the home screen app) in sync.
  window.addEventListener('storage', function (e) {
    if (e.key !== STORAGE_KEY) return;
    scores = load();
    render();
  });

  render();

  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(function () {});
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
