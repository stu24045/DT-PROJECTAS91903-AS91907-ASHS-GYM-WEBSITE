document.addEventListener('DOMContentLoaded', function () {
  const themeToggle = document.getElementById('themeToggle');
  const form = document.getElementById('joinForm');
  const message = document.getElementById('formMessage');
  const navLinks = document.querySelectorAll('.site-nav a[href]');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(function (link) {
    const href = link.getAttribute('href') || '';
    const normalizedHref = href.split('?')[0].split('#')[0].toLowerCase();
    const normalizedPage = currentPage.toLowerCase();

    if (normalizedHref === normalizedPage || (normalizedHref === 'index.html' && (normalizedPage === '' || normalizedPage === 'index.html'))) {
      link.classList.add('active');
    }
  });

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      if (themeToggle) {
        themeToggle.textContent = 'Dark Mode';
      }
    } else {
      document.body.classList.remove('light-theme');
      if (themeToggle) {
        themeToggle.textContent = 'Light Mode';
      }
    }
    localStorage.setItem('theme', theme);
  }

  function getPreferredTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  if (themeToggle) {
    applyTheme(getPreferredTheme());

    themeToggle.addEventListener('click', function () {
      const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        if (message) {
          message.textContent = 'Please fill in all required fields correctly.';
        }
        return;
      }

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      fetch('/submit-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
         .then(async function (response) {
           let data = null;
           try {
             data = await response.json();
           } catch (e) {
             // response wasn't JSON (HTML error page or plain text)
             try {
               data = { message: await response.text() };
             } catch (e2) {
               data = null;
             }
           }

           if (message) {
             if (data && data.message) {
               message.textContent = data.message;
             } else if (!response.ok) {
               message.textContent = `Server returned ${response.status} ${response.statusText}`;
             } else {
               message.textContent = 'Your join request has been received.';
             }
           }

           if (response.ok) {
             form.reset();
           }
         })
         .catch(function (err) {
           if (message) {
             message.textContent = 'Network error: ' + (err && err.message ? err.message : String(err));
           }
         });
    });
  }

  // Plan toggles: set aria attributes and handlers for workout plan cards
  (function initPlanToggles() {
    const planToggles = document.querySelectorAll('.plan-toggle');
    planToggles.forEach(function (btn) {
      const plan = btn.dataset.plan;
      const panelId = 'plan-' + plan;
      btn.setAttribute('aria-controls', panelId);
      const panel = document.getElementById(panelId);
      const isHidden = panel ? panel.hidden : true;
      btn.setAttribute('aria-expanded', (!isHidden).toString());
      btn.textContent = isHidden ? 'View Plan' : 'Hide Plan';

      btn.addEventListener('click', function () {
        if (!panel) return;
        panel.hidden = !panel.hidden;
        btn.textContent = panel.hidden ? 'View Plan' : 'Hide Plan';
        btn.setAttribute('aria-expanded', (!panel.hidden).toString());
      });
    });
  })();
});
