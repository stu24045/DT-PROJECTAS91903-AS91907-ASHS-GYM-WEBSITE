document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('joinForm');
  const message = document.getElementById('formMessage');

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
