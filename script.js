// さんぽと自分なら — motion layer
// Handles: scroll-reveal of sections, a subtle header parallax,
// and the floating "上に戻る" button.

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal for stops + TOC ---------- */
  var revealTargets = document.querySelectorAll('.reveal');
  var observer = null;

  function startReveal(el) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    observer.observe(el);
  }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
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
  }

  revealTargets.forEach(startReveal);

  // Replay the fade-in: hide everything, then let it reveal again as
  // it scrolls back into view (used by the "上に戻る" controls).
  function replayReveal() {
    revealTargets.forEach(function (el) {
      el.classList.remove('is-visible');
    });
    if (reduceMotion) {
      revealTargets.forEach(startReveal);
      return;
    }
    // wait for the fade-out transition (0.8s) to finish before
    // re-arming the observer, so it doesn't snap straight back on
    setTimeout(function () {
      revealTargets.forEach(startReveal);
    }, 820);
  }

  /* ---------- Header parallax + back-to-top button ---------- */
  var heroPhoto = document.getElementById('heroPhoto');
  var hero = document.querySelector('.hero');
  var fab = document.getElementById('fabTop');
  var backTop = document.querySelector('.back-top');

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
      replayReveal();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  if (backTop) {
    backTop.addEventListener('click', function () {
      // let the anchor's own smooth scroll happen; just reset the reveal state
      replayReveal();
    });
  }

  /* ---------- Lightbox: click a photo to view it larger ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var galleryImages = Array.prototype.slice.call(
    document.querySelectorAll('.photo-single img, .photo-pair img')
  );
  var lastFocused = null;
  var currentIndex = -1;

  function showImage(index) {
    if (!galleryImages.length) return;
    currentIndex = (index + galleryImages.length) % galleryImages.length;
    var img = galleryImages[currentIndex];
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || '';
    if (lightboxCaption) lightboxCaption.textContent = img.alt || '';
  }

  function openLightbox(index) {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    showImage(index);
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    requestAnimationFrame(function () {
      lightbox.classList.add('is-open');
    });
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    var finish = function () {
      lightbox.hidden = true;
      if (lightboxImg) lightboxImg.src = '';
    };
    if (reduceMotion) {
      finish();
    } else {
      setTimeout(finish, 250);
    }
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  galleryImages.forEach(function (img, index) {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    if (!img.hasAttribute('aria-label') && img.alt) {
      img.setAttribute('aria-label', '写真を拡大: ' + img.alt);
    }
    img.addEventListener('click', function () {
      openLightbox(index);
    });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', function () {
      showImage(currentIndex - 1);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', function () {
      showImage(currentIndex + 1);
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showImage(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      showImage(currentIndex + 1);
    }
  });
})();
