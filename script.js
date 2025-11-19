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

// --- Partners dropdown in nav (click to open on desktop & mobile, closes on mouseleave/click) ---
const partnersToggle = document.querySelector('.nav-link--has-submenu');
const partnersItem   = document.querySelector('.nav-item--has-submenu');

if (partnersToggle && partnersItem) {

  partnersToggle.addEventListener('click', (event) => {
    event.preventDefault();

    const isOpen = partnersItem.classList.toggle('open');
    partnersToggle.setAttribute('aria-expanded', String(isOpen));
  });

  const submenuLinks = partnersItem.querySelectorAll('.nav-submenu a');
  submenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      partnersItem.classList.remove('open');
      partnersToggle.setAttribute('aria-expanded', 'false');
    });
  });

  partnersItem.addEventListener('mouseleave', () => {
    partnersItem.classList.remove('open');
    partnersToggle.setAttribute('aria-expanded', 'false');
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


// --- Participation level: show benefits text under cards ---
const participationInputs = document.querySelectorAll('.participation-input');
const participationCards = document.querySelectorAll('.participation-card');
const participationDetails = {
  'level-businesses': document.getElementById('details-businesses'),
  'level-community': document.getElementById('details-community'),
  'level-ambassador': document.getElementById('details-ambassador')
};

function hideAllDetails() {
  Object.values(participationDetails).forEach(detail => {
    detail.classList.remove('is-active');
  });
}

function showDetailFor(id) {
  const detail = participationDetails[id];
  if (detail) detail.classList.add('is-active');
}

// Update details when clicking a radio
function updateParticipationDetails() {
  hideAllDetails();
  const selected = document.querySelector('.participation-input:checked');
  if (!selected) return;
  showDetailFor(selected.id);
}

if (participationCards.length > 0) {
  participationCards.forEach(card => {
    const inputId = card.getAttribute('for');

    // Reveal on hover
    card.addEventListener('mouseenter', () => {
      hideAllDetails();
      showDetailFor(inputId);
    });

    // Return to selected detail when leaving
    card.addEventListener('mouseleave', () => {
      updateParticipationDetails();
    });
  });
}

// Update details on click
if (participationInputs.length > 0) {
  participationInputs.forEach(input => {
    input.addEventListener('change', updateParticipationDetails);
  });

  updateParticipationDetails();
}

// --- Partner CTAs: pre-select participation level & jump to form ---
function preselectParticipation(levelId) {
  const radio = document.getElementById(levelId);
  if (!radio) return;

  // Check the matching participation radio
  radio.checked = true;

  // Trigger the same behavior as if the user clicked it
  if (typeof updateParticipationDetails === 'function') {
    updateParticipationDetails();
  } else {
    radio.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

// Map each CTA to its corresponding participation level
const givingBackCta = document.querySelector('.partners-cta a[href="#get-involved"]');
const communityCta  = document.querySelector('#community-supporters .supporter-cta a[href="#get-involved"]');
const ambassadorCta = document.querySelector('#awareness-ambassadors .supporter-cta a[href="#get-involved"]');

if (givingBackCta) {
  givingBackCta.addEventListener('click', () => {
    preselectParticipation('level-businesses');
  });
}

if (communityCta) {
  communityCta.addEventListener('click', () => {
    preselectParticipation('level-community');
  });
}

if (ambassadorCta) {
  ambassadorCta.addEventListener('click', () => {
    preselectParticipation('level-ambassador');
  });
}

// --- Donation & Thank You modals for top "Make an Impact" section ---
(function () {
  const donationModal = document.getElementById('donation-modal');
  const thankyouModal = document.getElementById('thankyou-modal');

  if (!donationModal || !thankyouModal) return;

  const body = document.body;
  const amountInput = document.getElementById('donation-amount-input');
  const donationForm = document.getElementById('donation-form');
  const customAmountForm = document.getElementById('custom-amount-form');
  const customAmountInput = document.getElementById('custom-amount');
  const shareCampaignBtn = document.getElementById('share-campaign-btn');
  const corporateLink = document.getElementById('corporate-sponsorship-link'); // NEW

  const overlays = document.querySelectorAll('.modal-overlay');
  const closeButtons = document.querySelectorAll('.modal-close');

  function formatAmount(value) {
    const numeric = Number(value);
    if (!isFinite(numeric) || numeric <= 0) return '$0.00';
    return `$${numeric.toFixed(2)}`;
  }

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('is-visible');
    modalEl.setAttribute('aria-hidden', 'false');
    body.classList.add('has-modal-open');

    const firstInput = modalEl.querySelector('input, button, [href], select, textarea');
    if (firstInput) {
      firstInput.focus();
    }
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('is-visible');
    modalEl.setAttribute('aria-hidden', 'true');

    if (!document.querySelector('.modal-overlay.is-visible')) {
      body.classList.remove('has-modal-open');
    }
  }

  function openDonationModal(amount) {
    if (amountInput) {
      const numeric = Number(amount);
      amountInput.value = isFinite(numeric) && numeric > 0 ? numeric.toFixed(2) : '';
    }
    openModal(donationModal);
  }

  // Pre-fill and open modal from preset impact cards
  const presetButtons = document.querySelectorAll('.donation-trigger');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      const amount = btn.dataset.amount || 0;
      openDonationModal(amount);
    });
  });

  // Handle custom amount CTA
  if (customAmountForm && customAmountInput) {
    customAmountForm.addEventListener('submit', event => {
      event.preventDefault();
      const amount = customAmountInput.value;
      if (!amount) {
        customAmountInput.focus();
        return;
      }
      openDonationModal(amount);
    });
  }

  // Close buttons
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalEl = btn.closest('.modal-overlay');
      if (modalEl) {
        closeModal(modalEl);
      }
    });
  });

  // Click on overlay background closes modal
  overlays.forEach(overlay => {
    overlay.addEventListener('click', event => {
      if (event.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // Escape key closes any open modal
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      overlays.forEach(closeModal);
    }
  });

  // Fake "submission" → show thank you message
  if (donationForm) {
    donationForm.addEventListener('submit', event => {
      event.preventDefault();
      closeModal(donationModal);
      openModal(thankyouModal);
      donationForm.reset();
    });
  }

  // Share campaign button - scroll to top hero section for now
  if (shareCampaignBtn) {
    shareCampaignBtn.addEventListener('click', () => {
      closeModal(thankyouModal);
      const heroSection = document.getElementById('hero') || document.getElementById('top');
      if (heroSection && typeof heroSection.scrollIntoView === 'function') {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Corporate sponsorship link: close modal, preselect corporate level, and let browser scroll to #get-involved
  if (corporateLink) {
    corporateLink.addEventListener('click', () => {
      // Close the donation modal
      closeModal(donationModal);

      // Preselect the "corporate sponsor" participation level
      if (typeof preselectParticipation === 'function') {
        preselectParticipation('level-community'); // adjust id if needed
      } else {
        const radio = document.getElementById('level-community');
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      // No preventDefault: the anchor will still jump to #get-involved
    });
  }
})();

