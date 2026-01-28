// Clean login handler for DB-based login
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-username').value.trim();
  const jelszo = document.getElementById('login-password').value.trim();

  const container = document.querySelector('.aloldal-container');

  // Eltávolítjuk az esetleges előző üzenetet
  const existing = document.querySelector('.login-message');
  if (existing) existing.remove();

  // Ellenőrizzük, hogy minden mező ki van-e töltve
  if (!email || !jelszo) {
    const msg = document.createElement('div');
    msg.className = 'login-message login-error';
    msg.textContent = '❌ Kérlek, tölts ki minden mezőt!';
    container.appendChild(msg);
    return;
  }

  try {
    // Küldés a szerver felé
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, jelszo })
    });

    const data = await res.json();

    // Üzenet megjelenítése
    const msg = document.createElement('div');
    msg.className = `login-message ${data.success ? 'login-success' : 'login-error'}`;
    msg.textContent = data.message || (data.success ? '✅ Sikeres bejelentkezés' : '❌ Hiba');
    container.appendChild(msg);

    if (data.success) {
      // Szerep kiválasztása a formból
      const selectedRole = document.querySelector('input[name="role"]:checked');
      if (selectedRole) {
        data.user.role = selectedRole.value;
      }

      // Felhasználó mentése localStorage-be
      localStorage.setItem('user', JSON.stringify(data.user));

      // Navbar frissítése
      const loginNav = document.querySelector('#nav-bejelentkezes');
      const registerNav = document.querySelector('#nav-regisztracio');
      if (loginNav) loginNav.style.display = 'none';
      if (registerNav) registerNav.style.display = 'none';

      // Átirányítás a szerep alapján
      setTimeout(() => {
        const role = data.role || (data.user && data.user.role);
        if (role === 'teacher') {
          window.location.href = '/tanfolyamok'; // tanár landing
        } else {
          window.location.href = '/'; // diák landing
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
