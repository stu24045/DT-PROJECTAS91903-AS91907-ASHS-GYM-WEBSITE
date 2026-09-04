document.addEventListener('DOMContentLoaded', function () {
  // Find the page elements used by the theme switcher, navigation, and join form.
  const themeToggle = document.getElementById('themeToggle');
  const form = document.getElementById('joinForm');
  const message = document.getElementById('formMessage');
  const navLinks = document.querySelectorAll('.site-nav a[href]');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Highlight the navigation link for the page the visitor is currently viewing.
  navLinks.forEach(function (navigationLink) {
    const linkAddress = navigationLink.getAttribute('href') || '';
    const cleanLinkAddress = linkAddress.split('?')[0].split('#')[0].toLowerCase();
    const cleanCurrentPage = currentPage.toLowerCase();

    if (cleanLinkAddress === cleanCurrentPage || (cleanLinkAddress === 'index.html' && (cleanCurrentPage === '' || cleanCurrentPage === 'index.html'))) {
      navigationLink.classList.add('active');
    }
  });

  // Apply the selected colour theme and remember it for the next visit.
  function applyTheme(selectedTheme) {
    if (selectedTheme === 'light') {
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
    localStorage.setItem('theme', selectedTheme);
  }

  // Use the saved theme, the workout page default, or the device preference.
  function getPreferredTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    if (currentPage === 'workout-program.html') {
      return 'light';
    }
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
    // Validate and send the join form to the Flask server without reloading the page.
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        if (message) {
          message.textContent = 'Please fill in all required fields correctly.';
        }
        return;
      }

      const submittedFormData = new FormData(form);
      const applicationDetails = Object.fromEntries(submittedFormData.entries());

      fetch('/submit-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationDetails),
      })
         .then(async function (serverResponse) {
           let responseData = null;
           try {
             responseData = await serverResponse.json();
           } catch (jsonError) {
             // response wasn't JSON (HTML error page or plain text)
             try {
               responseData = { message: await serverResponse.text() };
             } catch (textError) {
               responseData = null;
             }
           }

           if (message) {
             if (responseData && responseData.message) {
               message.textContent = responseData.message;
             } else if (!serverResponse.ok) {
               message.textContent = `Server returned ${serverResponse.status} ${serverResponse.statusText}`;
             } else {
               message.textContent = 'Your join request has been received.';
             }
           }

           if (serverResponse.ok) {
             form.reset();
           }
         })
         .catch(function (networkError) {
           if (message) {
             message.textContent = 'Network error: ' + (networkError && networkError.message ? networkError.message : String(networkError));
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
