/* ============================================================
   GreenGrow Enterprises — site scripts
   Mobile nav · scroll header state · active link tracking
   · accessible contact form validation
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupMobileNav();
    setupScrolledHeader();
    setupActiveNavTracking();
    setupContactForm();
  }

  /* ---------------------------------------------------------
     Mobile nav toggle
     Injects a hamburger button into the header (no HTML edit
     required) and toggles the existing .nav-links list.
  --------------------------------------------------------- */
  function setupMobileNav() {
    var navbar = document.querySelector('.navbar');
    var navLinks = document.querySelector('.nav-links');
    var header = document.querySelector('.header-container');
    if (!navbar || !navLinks || !header) return;

    var toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Toggle navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'primary-navigation');
    toggle.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="4" y1="7" x2="20" y2="7"></line>' +
      '<line x1="4" y1="12" x2="20" y2="12"></line>' +
      '<line x1="4" y1="17" x2="20" y2="17"></line>' +
      '</svg>';

    navLinks.id = 'primary-navigation';
    header.insertBefore(toggle, navbar);

    toggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        var firstLink = navLinks.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });

    // Close menu after choosing a link
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (
        navLinks.classList.contains('is-open') &&
        !navLinks.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });

    // Reset state if the viewport grows back to desktop width
    window.addEventListener('resize', function () {
      if (window.innerWidth > 640 && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------------------------------------------------
     Adds a subtle shadow to the sticky header once the page
     has scrolled, so it reads as elevated above the content.
  --------------------------------------------------------- */
  function setupScrolledHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------
     Highlights the nav link for the section currently in view.
  --------------------------------------------------------- */
  function setupActiveNavTracking() {
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.nav-links a[href^="#"]')
    );
    if (!navLinks.length || !('IntersectionObserver' in window)) return;

    var sections = navLinks
      .map(function (link) {
        var id = link.getAttribute('href').slice(1);
        return document.getElementById(id);
      })
      .filter(Boolean);

    if (!sections.length) return;

    var setActive = function (id) {
      navLinks.forEach(function (link) {
        var isMatch = link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', isMatch);
        if (isMatch) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---------------------------------------------------------
     Contact form: accessible client-side validation plus a
     simulated submit (no backend wired up yet — see the
     `sendMessage` function below for where to plug one in).
  --------------------------------------------------------- */
  function setupContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var submitBtn = form.querySelector('button[type="submit"]');

    var status = document.createElement('div');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.insertBefore(status, form.firstChild);

    var fields = [
      {
        input: form.querySelector('#fullName'),
        validate: function (v) {
          return v.trim().length >= 2;
        },
        message: 'Enter your full name.'
      },
      {
        input: form.querySelector('#emailAddress'),
        validate: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
        },
        message: 'Enter a valid email address.'
      },
      {
        input: form.querySelector('#message'),
        validate: function (v) {
          return v.trim().length >= 10;
        },
        message: 'Message should be at least 10 characters.'
      }
    ];

    fields.forEach(attachFieldError);

    function attachFieldError(field) {
      if (!field.input) return;
      var group = field.input.closest('.form-group');
      if (!group) return;

      var error = document.createElement('span');
      error.className = 'form-error';
      var errorId = field.input.id + '-error';
      error.id = errorId;
      group.appendChild(error);

      field.input.addEventListener('input', function () {
        if (group.classList.contains('has-error') && field.validate(field.input.value)) {
          clearFieldError(field, group);
        }
      });

      field.errorEl = error;
      field.group = group;
    }

    function showFieldError(field) {
      field.group.classList.add('has-error');
      field.errorEl.textContent = field.message;
      field.input.setAttribute('aria-invalid', 'true');
      field.input.setAttribute('aria-describedby', field.errorEl.id);
    }

    function clearFieldError(field) {
      field.group.classList.remove('has-error');
      field.errorEl.textContent = '';
      field.input.removeAttribute('aria-invalid');
    }

    function showStatus(kind, message) {
      status.className = 'form-status is-visible ' + (kind === 'success' ? 'is-success' : 'is-error');
      status.textContent = message;
    }

    function hideStatus() {
      status.className = 'form-status';
      status.textContent = '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideStatus();

      var firstInvalid = null;
      var allValid = fields.every(function (field) {
        if (!field.input) return true;
        var valid = field.validate(field.input.value);
        if (!valid) {
          showFieldError(field);
          if (!firstInvalid) firstInvalid = field.input;
        } else {
          clearFieldError(field);
        }
        return valid;
      });

      if (!allValid) {
        showStatus('error', 'Please fix the highlighted fields before sending.');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = {
        fullName: form.fullName.value.trim(),
        emailAddress: form.emailAddress.value.trim(),
        message: form.message.value.trim()
      };

      sendMessage(data, submitBtn)
        .then(function () {
          showStatus('success', 'Thanks, ' + data.fullName.split(' ')[0] + ' — your message has been sent. We\u2019ll be in touch shortly.');
          form.reset();
        })
        .catch(function () {
          showStatus('error', 'Something went wrong sending your message. Please try again.');
        });
    });

    // Simulated network request. Replace the body of this
    // function with a real fetch() call to your backend or
    // form service (e.g. Formspree, a serverless function, etc).
    function sendMessage(data, button) {
      return new Promise(function (resolve) {
        if (button) {
          button.disabled = true;
          button.dataset.originalText = button.textContent;
          button.textContent = 'Sending…';
        }

        window.setTimeout(function () {
          if (button) {
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'Send Message';
          }
          resolve();
        }, 900);

        /* Example real integration:
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
          .then(function (res) {
            if (!res.ok) throw new Error('Request failed');
            resolve();
          })
          .catch(reject)
          .finally(function () {
            if (button) {
              button.disabled = false;
              button.textContent = button.dataset.originalText || 'Send Message';
            }
          });
        */
      });
    }
  }
})();
