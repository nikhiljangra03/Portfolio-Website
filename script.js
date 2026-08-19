(function () {
  // ---- Mobile menu toggle ----
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      navLinks.classList.toggle('show');
    });
  }

  // Close mobile menu on outside click
  document.addEventListener('click', function (event) {
    if (
      navLinks &&
      navLinks.classList.contains('show') &&
      !navLinks.contains(event.target) &&
      !mobileBtn.contains(event.target)
    ) {
      navLinks.classList.remove('show');
    }
  });

  // ---- Active link highlight on scroll ----
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-link');

  function setActiveLink() {
    let current = '';
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    navItems.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href').substring(1);
      if (href === current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', setActiveLink);
  window.addEventListener('load', setActiveLink);

  // ---- Smooth scroll for all anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        e.preventDefault();
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (navLinks && navLinks.classList.contains('show')) {
          navLinks.classList.remove('show');
        }
      }
    });
  });

  // ---- Contact form: real submission via Web3Forms ----
  const contactForm = document.getElementById('contactForm');
  const fakeBtn = document.getElementById('fakeSubmitBtn');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameVal = document.getElementById('nameInput')?.value.trim() || '';
      const emailVal = document.getElementById('emailInput')?.value.trim() || '';
      const messageVal = document.getElementById('messageInput')?.value.trim() || '';

      if (!nameVal || !emailVal || !messageVal) {
        formFeedback.innerHTML =
          '<span style="background:#fef2f2; padding:8px 14px; border-radius:50px; color:#dc2626;"><i class="fas fa-exclamation-circle"></i> Please fill all fields.</span>';
        setTimeout(() => { formFeedback.innerHTML = ''; }, 3000);
        return;
      }

      const originalBtnHTML = fakeBtn.innerHTML;
      fakeBtn.disabled = true;
      fakeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      const formData = new FormData(contactForm);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            formFeedback.innerHTML =
              '<span style="background:#eef2ff; padding:8px 14px; border-radius:50px; color:#4f46e5;"><i class="fas fa-check-circle"></i> Thanks! I\'ll reach out soon.</span>';
            contactForm.reset();
          } else {
            formFeedback.innerHTML =
              '<span style="background:#fef2f2; padding:8px 14px; border-radius:50px; color:#dc2626;"><i class="fas fa-exclamation-circle"></i> Something went wrong. Please try again.</span>';
          }
        })
        .catch(() => {
          formFeedback.innerHTML =
            '<span style="background:#fef2f2; padding:8px 14px; border-radius:50px; color:#dc2626;"><i class="fas fa-exclamation-circle"></i> Network error. Please try again.</span>';
        })
        .finally(() => {
          fakeBtn.disabled = false;
          fakeBtn.innerHTML = originalBtnHTML;
          setTimeout(() => { formFeedback.innerHTML = ''; }, 5000);
        });
    });
  }

  // ---- Scroll reveal animations ----
  // Safe by design: elements are visible by default in CSS (.reveal { opacity:1 }).
  // Only after this script confirms IntersectionObserver support and the user
  // doesn't prefer reduced motion do we add '.js-ready' to <html>, which is what
  // actually hides elements before they animate in. If this script never runs,
  // or errors out, or the browser lacks IntersectionObserver, nothing is ever
  // stuck invisible — the page just displays normally with no animation.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    document.documentElement.classList.add('js-ready');

    // Stagger cards within the same group (education, experience, skills,
    // projects, achievements) so they animate in one after another.
    document
      .querySelectorAll('.timeline-wrapper, .skills-container, .projects-grid, .achievements-grid')
      .forEach(container => {
        const items = container.querySelectorAll(':scope > .reveal');
        items.forEach((item, i) => {
          item.style.transitionDelay = (i * 0.1) + 's';
        });
      });

    const revealEls = document.querySelectorAll('.reveal');

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    revealEls.forEach(el => io.observe(el));

    // Safety net: if anything is somehow never observed as in-view
    // (e.g. a very short page, or a layout edge case), force it visible
    // after a few seconds so nothing can stay hidden forever.
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.in-view)').forEach(el => {
        el.classList.add('in-view');
      });
    }, 4000);
  }
})();
