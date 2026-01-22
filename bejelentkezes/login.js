// Clean login handler for DB-based login
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-username').value.trim();
  const jelszo = document.getElementById('login-password').value.trim();

  const container = document.querySelector('.aloldal-container');
  const existing = document.querySelector('.login-message');
  if (existing) existing.remove();

  if (!email || !jelszo) {
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
      body: JSON.stringify({ email, jelszo })
    });

    const data = await res.json();
    const msg = document.createElement('div');
    msg.className = `login-message ${data.success ? 'login-success' : 'login-error'}`;
    msg.textContent = data.message || (data.success ? '✅ Sikeres bejelentkezés' : '❌ Hiba');

    container.appendChild(msg);

    if (data.success) {
      // Include the selected role in the user data
      const selectedRole = document.querySelector('input[name="role"]:checked');
      if (selectedRole) {
          data.user.role = selectedRole.value;
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      // Hide 'Bejelentkezés' and 'Regisztráció' from the navbar
      const loginNav = document.querySelector('#nav-bejelentkezes');
      const registerNav = document.querySelector('#nav-regisztracio');
      if (loginNav) loginNav.style.display = 'none';
      if (registerNav) loginNav.style.display = 'none';

      // Redirect based on role
      setTimeout(() => {
        if (data.role === 'teacher') {
          window.location.href = '/tanfolyamok'; // pl. oktató landing
        } else {
          window.location.href = '/'; // felhasználó landing
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
