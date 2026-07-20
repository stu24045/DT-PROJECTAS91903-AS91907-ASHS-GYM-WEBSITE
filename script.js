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
      themeToggle.textContent = 'Dark Mode';
    } else {
      document.body.classList.remove('light-theme');
      themeToggle.textContent = 'Light Mode';
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

  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      message.textContent = 'Please fill in all required fields correctly.';
      return;
    }

    message.textContent = 'Application submitted! Please use the SQL schema to store your data in SQLiteStudio.';
    form.reset();
  });
});
