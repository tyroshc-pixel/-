// さんぽと自分なら — motion layer
// Handles: scroll-reveal of sections, a subtle header parallax,
// and the floating "上に戻る" button.

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal for stops + TOC ---------- */
  var revealTargets = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Header parallax + back-to-top button ---------- */
  var heroPhoto = document.getElementById('heroPhoto');
  var hero = document.querySelector('.hero');
  var fab = document.getElementById('fabTop');

  var ticking = false;

  function update() {
    ticking = false;

    // Header parallax: photo drifts slightly slower than scroll
    if (heroPhoto && hero && !reduceMotion) {
      var heroRect = hero.getBoundingClientRect();
      if (heroRect.bottom > 0) {
        var shift = heroRect.top * -0.15;
        heroPhoto.style.transform = 'translateY(' + shift + 'px)';
      }
    }

    // Floating back-to-top button visibility
    if (fab) {
      if (window.scrollY > 480) {
        fab.classList.add('show');
      } else {
        fab.classList.remove('show');
      }
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  if (fab) {
    fab.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
})();
