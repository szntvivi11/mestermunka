document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const container = document.querySelector('.aloldal-container');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
      showMessage('Kérlek, töltsd ki mindkét mezőt!', 'error');
      return;
    }

    showMessage('Sikeres bejelentkezés!', 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  });

  function showMessage(text, type) {
    const existing = document.querySelector('.login-message');
    if (existing) existing.remove();

    const message = document.createElement('div');
    message.className = `login-message ${type === 'error' ? 'login-error' : 'login-success'}`;
    message.textContent = text;
    container.appendChild(message);
  }
});
