// --- Nav toggle ---
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// --- Partners dropdown in nav ---
const partnersToggle = document.querySelector('.nav-link--has-submenu');
const partnersItem = document.querySelector('.nav-item--has-submenu');

function isMobileNav() {
  return window.matchMedia('(max-width: 890px)').matches;
}

if (partnersToggle && partnersItem) {
  partnersToggle.addEventListener('click', (event) => {
    // Only use click-to-open on mobile
    if (!isMobileNav()) {
      return;
    }

    event.preventDefault();
    const isOpen = partnersItem.classList.toggle('open');
    partnersToggle.setAttribute('aria-expanded', String(isOpen));
  });
}



// --- Rotating ruby hero icons (random) ---
const heroIcons = document.querySelectorAll('.hero-icons .icon');

if (heroIcons.length > 0) {
  let currentIndex = 0;

  // Start with a random icon as ruby
  currentIndex = Math.floor(Math.random() * heroIcons.length);
  heroIcons[currentIndex].classList.add('is-ruby');

  setInterval(() => {
    // Remove ruby from current
    heroIcons[currentIndex].classList.remove('is-ruby');

    // Pick a *different* random index
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * heroIcons.length);
    } while (nextIndex === currentIndex);

    // Add ruby to the new one
    heroIcons[nextIndex].classList.add('is-ruby');
    currentIndex = nextIndex;
  }, 1000); // every 1 second
}

// --- "Businesses Giving Back" mobile carousel ---
const businessCarousel = document.querySelector('.partners-grid--tall');

if (businessCarousel) {
  const businessCards = Array.from(
    businessCarousel.querySelectorAll('.partner-cardT')
  );
  const dotsContainer = document.querySelector('.carousel-dots');
  const prevButton = document.querySelector('.carousel-arrow--prev');
  const nextButton = document.querySelector('.carousel-arrow--next');

  if (businessCards.length > 1 && dotsContainer) {
    let currentBusinessIndex = 0;
    let businessCarouselInterval = null;
    let isProgrammaticScroll = false;
    let cardOffsets = []; // exact scrollLeft positions for each card

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    function isMobileWidth() {
      return window.matchMedia('(max-width: 768px)').matches;
    }

    // Measure actual offsets of each card relative to the scroll container
    function updateCardOffsets() {
      if (!isMobileWidth()) {
        cardOffsets = [];
        return;
      }

      cardOffsets = businessCards.map(card => card.offsetLeft);
    }

    function createDots() {
      dotsContainer.innerHTML = '';
      businessCards.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.dataset.index = String(idx);
        dotsContainer.appendChild(dot);
      });
      updateDots();
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach(dot => {
        dot.classList.toggle(
          'is-active',
          Number(dot.dataset.index) === currentBusinessIndex
        );
      });
    }

    function scrollToBusinessCard(index, smooth = true) {
      if (!cardOffsets.length) return;

      const clampedIndex = Math.max(0, Math.min(index, cardOffsets.length - 1));
      const targetLeft = cardOffsets[clampedIndex];

      isProgrammaticScroll = true;
      businessCarousel.scrollTo({
        left: targetLeft,
        behavior: smooth ? 'smooth' : 'auto',
      });

      setTimeout(() => {
        isProgrammaticScroll = false;
      }, 400);
    }

    function goToIndex(index, smooth = true) {
      const total = businessCards.length;
      // wrap around in both directions
      currentBusinessIndex = ((index % total) + total) % total;
      scrollToBusinessCard(currentBusinessIndex, smooth);
      updateDots();
    }

    function nextCard() {
      goToIndex(currentBusinessIndex + 1);
    }

    function prevCard() {
      goToIndex(currentBusinessIndex - 1);
    }

    function startBusinessCarousel() {
      if (!isMobileWidth() || prefersReducedMotion) return;

      updateCardOffsets();
      stopBusinessCarousel(); // clear any existing interval

      // Always start autoplay from the first card
      goToIndex(0, false);

      businessCarouselInterval = setInterval(() => {
        nextCard(); // continuous loop: after last, goes back to first
      }, 4000);
    }

    function stopBusinessCarousel() {
      if (businessCarouselInterval) {
        clearInterval(businessCarouselInterval);
        businessCarouselInterval = null;
      }
    }

    // Initialize dots
    createDots();

    // Ensure we actually start at card #1 on mobile
    window.addEventListener('load', () => {
      if (isMobileWidth()) {
        // hard-reset scroll position first
        businessCarousel.scrollLeft = 0;

        updateCardOffsets();
        goToIndex(0, false); // explicitly show the first card
        if (!prefersReducedMotion) {
          startBusinessCarousel();
        }
      }
    });


    // Recompute offsets on resize and keep current card centered
    window.addEventListener('resize', () => {
      if (isMobileWidth()) {
        updateCardOffsets();
        goToIndex(currentBusinessIndex, false);
        if (!prefersReducedMotion && !businessCarouselInterval) {
          startBusinessCarousel();
        }
      } else {
        // Back to desktop/tablet layout
        stopBusinessCarousel();
        businessCarousel.scrollLeft = 0;
        currentBusinessIndex = 0;
        updateDots();
      }
    });

    // Sync dots to manual swiping by finding the closest card offset
    businessCarousel.addEventListener(
      'scroll',
      () => {
        if (!isMobileWidth() || isProgrammaticScroll || !cardOffsets.length) {
          return;
        }

        const scrollLeft = businessCarousel.scrollLeft;
        let closestIndex = 0;
        let smallestDiff = Infinity;

        cardOffsets.forEach((offset, idx) => {
          const diff = Math.abs(scrollLeft - offset);
          if (diff < smallestDiff) {
            smallestDiff = diff;
            closestIndex = idx;
          }
        });

        if (closestIndex !== currentBusinessIndex) {
          currentBusinessIndex = closestIndex;
          updateDots();
        }
      },
      { passive: true }
    );

    // Dot click jumps directly to that card and stops autoplay
    dotsContainer.addEventListener('click', event => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.classList.contains('carousel-dot')) {
        const index = Number(target.dataset.index || '0');
        stopBusinessCarousel();
        goToIndex(index);
      }
    });

    // Arrow buttons (wrap around) and stop autoplay when used
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        stopBusinessCarousel();
        prevCard();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        stopBusinessCarousel();
        nextCard();
      });
    }

    // Any manual interaction stops autoplay so it doesn’t fight the user
    ['touchstart', 'mousedown', 'wheel'].forEach(eventName => {
      businessCarousel.addEventListener(
        eventName,
        () => {
          stopBusinessCarousel();
        },
        { passive: true }
      );
    });
  }
}
