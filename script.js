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
