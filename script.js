document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Mobile menu ---------- */

const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

const setMenu = (open) => {
  nav?.classList.toggle('is-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};

toggle?.addEventListener('click', () => {
  setMenu(!nav.classList.contains('is-open'));
});

nav?.addEventListener('click', (event) => {
  if (event.target instanceof Element && event.target.closest('a')) {
    setMenu(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
    setMenu(false);
    toggle?.focus();
  }
});

document.addEventListener('click', (event) => {
  if (nav?.classList.contains('is-open') && !nav.contains(event.target) && !toggle?.contains(event.target)) {
    setMenu(false);
  }
});

window.matchMedia('(min-width: 721px)').addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});

/* ---------- Header state on scroll ---------- */

const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
};

window.addEventListener('scroll', updateHeader, { passive: true });

updateHeader();

/* ---------- Reveal on scroll ---------- */

const revealItems = document.querySelectorAll('.reveal');

// Stagger siblings inside the same grid so cards cascade in
document.querySelectorAll('.why-grid, .services-grid, .university-grid').forEach((group) => {
  group.querySelectorAll(':scope > .reveal').forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min(index * 0.08, 0.4)}s`);
  });
});

if (reduceMotion.matches) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  let pending = [...revealItems];

  // Reveal anything that has reached the lower part of the viewport, or that is
  // already above it (e.g. skipped over by an anchor jump), so nothing stays hidden.
  const revealInView = () => {
    const limit = window.innerHeight * 0.92;
    pending = pending.filter((item) => {
      if (item.getBoundingClientRect().top < limit) {
        item.classList.add('is-visible');
        return false;
      }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', revealInView);
      window.removeEventListener('resize', revealInView);
    }
  };

  window.addEventListener('scroll', revealInView, { passive: true });
  window.addEventListener('resize', revealInView, { passive: true });
  window.addEventListener('load', revealInView);
  revealInView();
}

/* ---------- Grade carousel ---------- */

const rail = document.querySelector('.grade-rail');
const prevButton = document.querySelector('.rail-prev');
const nextButton = document.querySelector('.rail-next');
const gradeCards = [...document.querySelectorAll('.grade-card')];

const cardStep = () => {
  const card = gradeCards[0];
  if (!card || !rail) return 0;
  const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
  return card.getBoundingClientRect().width + gap;
};

const updateArrows = () => {
  if (!rail) return;
  const maxScroll = rail.scrollWidth - rail.clientWidth - 2;
  if (prevButton) prevButton.disabled = rail.scrollLeft <= 2;
  if (nextButton) nextButton.disabled = rail.scrollLeft >= maxScroll;
};

prevButton?.addEventListener('click', () => rail.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
nextButton?.addEventListener('click', () => rail.scrollBy({ left: cardStep(), behavior: 'smooth' }));
rail?.addEventListener('scroll', updateArrows, { passive: true });
window.addEventListener('resize', updateArrows, { passive: true });
updateArrows();

rail?.addEventListener('keydown', (event) => {
  if (event.target !== rail) return;
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    rail.scrollBy({ left: cardStep(), behavior: 'smooth' });
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    rail.scrollBy({ left: -cardStep(), behavior: 'smooth' });
  }
});

/* ---------- Grade lightbox ---------- */

const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox?.querySelector('.lightbox-img');
const lightboxCount = lightbox?.querySelector('.lightbox-count');
let lightboxIndex = 0;
let lightboxTrigger = null;

const showGrade = (index) => {
  if (!lightboxImg) return;
  lightboxIndex = (index + gradeCards.length) % gradeCards.length;
  const source = gradeCards[lightboxIndex].querySelector('img');
  lightboxImg.src = source.currentSrc || source.src;
  lightboxImg.alt = source.alt;
  // Restart the zoom-in animation for each new image
  lightboxImg.style.animation = 'none';
  void lightboxImg.offsetWidth;
  lightboxImg.style.animation = '';
  if (lightboxCount) lightboxCount.textContent = `${lightboxIndex + 1} / ${gradeCards.length}`;
};

const closeLightbox = () => {
  if (lightbox?.open) lightbox.close();
};

if (lightbox && typeof lightbox.showModal === 'function') {
  gradeCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      lightboxTrigger = card;
      showGrade(index);
      lightbox.showModal();
      document.body.classList.add('lightbox-open');
    });
  });

  lightbox.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    lightboxTrigger?.focus();
  });

  lightbox.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev')?.addEventListener('click', () => showGrade(lightboxIndex - 1));
  lightbox.querySelector('.lightbox-next')?.addEventListener('click', () => showGrade(lightboxIndex + 1));

  // Click on the dimmed backdrop (not the image or controls) closes it
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.tagName === 'FIGURE') closeLightbox();
  });

  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') showGrade(lightboxIndex + 1);
    if (event.key === 'ArrowLeft') showGrade(lightboxIndex - 1);
  });

  // Swipe between grades on touch screens
  let touchStartX = null;
  lightbox.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) showGrade(lightboxIndex + (delta < 0 ? 1 : -1));
    touchStartX = null;
  });
} else {
  // Older browsers without <dialog>: open the image directly
  gradeCards.forEach((card) => {
    card.addEventListener('click', () => {
      window.open(card.querySelector('img').src, '_blank', 'noopener');
    });
  });
}

/* ---------- Requirement form ---------- */

const requirementForm = document.querySelector('.requirement-form');
const formMessage = document.getElementById('form-message');

requirementForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  formMessage.textContent = '';
  formMessage.className = 'form-message';

  if (!requirementForm.checkValidity()) {
    requirementForm.reportValidity();
    return;
  }

  const submitButton = requirementForm.querySelector('.send-button');
  const submitLabel = submitButton.querySelector('.send-label');
  submitButton.disabled = true;
  submitButton.classList.add('is-loading');
  submitLabel.textContent = 'Sending...';

  try {
    const response = await fetch(requirementForm.action, {
      method: 'POST',
      body: new FormData(requirementForm),
      headers: {
        'Accept': 'application/json'
      }
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok) {
      formMessage.textContent = 'Your requirement has been sent successfully! We will get back to you within one working day.';
      formMessage.className = 'form-message success';
      requirementForm.reset();
    } else {
      throw new Error((result.errors && result.errors[0] && result.errors[0].message) || result.error || 'Form submission failed');
    }
  } catch (error) {
    formMessage.textContent = 'Sorry, there was an error sending your message. Please try again later or contact us directly via WhatsApp or email.';
    formMessage.className = 'form-message error';
    console.error('Form submission error:', error);
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove('is-loading');
    submitLabel.textContent = 'Send';
  }
});
