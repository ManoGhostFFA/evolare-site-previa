// Menu mobile
(function () {
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') menu.classList.remove('open');
    });
  }
})();

// Animações de entrada ao rolar (scroll reveal)
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

// Mascote: se o vídeo não puder ser reproduzido (navegador antigo, dado bloqueado),
// troca pelo poster PNG, que também é recortado. Assim nunca sobra um quadro vazio.
(function () {
  var video = document.getElementById('mascoteVideo');
  if (!video) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.removeAttribute('autoplay');
    video.pause();
  }

  video.addEventListener('error', trocarPorImagem);
  var fonte = video.querySelector('source');
  if (fonte) fonte.addEventListener('error', trocarPorImagem);

  function trocarPorImagem() {
    if (!video.parentNode) return;
    var img = document.createElement('img');
    img.src = 'assets/img/mascote-poster.png';
    img.alt = 'Mascote do Instituto EVOLARE';
    img.className = 'hero__mascote';
    video.parentNode.replaceChild(img, video);
  }
})();

// Números que sobem (count-up) quando a seção aparece na tela do usuário
(function () {
  var counters = document.querySelectorAll('.count');
  if (!counters.length) return;

  // Mostra o valor final estático (usado como fallback e estado inicial visível)
  counters.forEach(function (el) {
    el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
  });

  function run(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  }

  function setup() {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }
    // rootMargin negativo: só dispara quando o número está de fato dentro da tela
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6, rootMargin: '0px 0px -80px 0px' });
    counters.forEach(function (el) { io.observe(el); });
  }

  // Só observa depois que TUDO carregou (imagens incluídas), quando o layout
  // já está no lugar final. Assim os números não disparam durante o load,
  // enquanto a seção ainda nem está na posição certa.
  if (document.readyState === 'complete') setup();
  else window.addEventListener('load', setup);
})();

// Sombra sutil no header + barra de progresso + botão voltar ao topo
(function () {
  var header = document.querySelector('.site-header');
  var progress = document.getElementById('progress');
  var toTop = document.getElementById('toTop');

  var onScroll = function () {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.style.boxShadow = y > 8 ? '0 6px 20px rgba(61,61,61,.07)' : 'none';
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    if (toTop) toTop.classList.toggle('show', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

/* Galeria em loop: pré-decodifica todas as fotos assim que a página carrega,
   pra nenhum quadro passar em branco enquanto o loop gira. */
(function () {
  var imgs = document.querySelectorAll('.marquee img');
  if (!imgs.length) return;
  var decodeAll = function () {
    Array.prototype.forEach.call(imgs, function (img) {
      if (img.decode) img.decode().catch(function () {});
    });
  };
  if (document.readyState === 'complete') decodeAll();
  else window.addEventListener('load', decodeAll);
})();

/* Vídeos em loop (ex.: Bingo Solidário): garante que voltem a tocar sempre que
   aparecem na tela ou a aba volta a ficar visível, mesmo se o navegador pausar. */
(function () {
  var vids = document.querySelectorAll('video[autoplay][loop]');
  if (!vids.length) return;
  var tocar = function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting && e.target.paused) tocar(e.target); });
    }, { threshold: 0.2 });
    Array.prototype.forEach.call(vids, function (v) { io.observe(v); });
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) Array.prototype.forEach.call(vids, function (v) { if (v.paused) tocar(v); });
  });
})();
