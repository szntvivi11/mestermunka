// Clean login handler for DB-based login
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const emailOrUsername = document.getElementById('login-username').value.trim();
  const jelszo = document.getElementById('login-password').value.trim();

  const container = document.querySelector('.aloldal-container');
  const existing = document.querySelector('.login-message');
  if (existing) existing.remove();

  if (!emailOrUsername || !jelszo) {
    const msg = document.createElement('div');
    msg.className = 'login-message login-error';
    msg.textContent = '❌ Kérlek, tölts ki minden mezőt!';
    container.appendChild(msg);
    return;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, jelszo })
    });

    const data = await res.json();
    const msg = document.createElement('div');
    msg.className = `login-message ${data.success ? 'login-success' : 'login-error'}`;
    msg.textContent = data.message || (data.success ? '✅ Sikeres bejelentkezés' : '❌ Hiba');

    container.appendChild(msg);

    if (data.success) {
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        name: data.user.nev,
        email: data.user.email,
        role: data.role
      }));

      // Redirect based on role
      setTimeout(() => {
        if (data.role === 'teacher') {
          window.location.href = '/tanfolyamok';
        } else {
          window.location.href = '/';
        }
      }, 800);
    }

  } catch (err) {
    const msg = document.createElement('div');
    msg.className = 'login-message login-error';
    msg.textContent = '❌ Hálózati hiba';
    container.appendChild(msg);
    console.error('Login fetch error', err);
  }
});
