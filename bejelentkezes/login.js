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
    // Skip role selection for admin login
    const isAdminLogin = email === 'ADMIN1234' && jelszo === 'admin4321';
    if (isAdminLogin) {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, jelszo, role: 'admin' })
        });

        const data = await res.json();
        const msg = document.createElement('div');
        msg.className = `login-message ${data.success ? 'login-success' : 'login-error'}`;
        msg.textContent = data.message || (data.success ? '✅ Sikeres bejelentkezés' : '❌ Hiba');
        container.appendChild(msg);

        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setTimeout(() => window.location.href = '/profil', 800);
        }
        return;
    }

    // Include the selected role in the login request
    const selectedRole = document.querySelector('input[name="role"]:checked');
    if (!selectedRole) {
        const msg = document.createElement('div');
        msg.className = 'login-message login-error';
        msg.textContent = '❌ Kérlek, válassz szerepkört!';
        container.appendChild(msg);
        return;
    }

    // Add the role to the request body
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jelszo, role: selectedRole.value })
    });

    const data = await res.json();

    const msg = document.createElement('div');
    msg.className = `login-message ${data.success ? 'login-success' : 'login-error'}`;
    msg.textContent = data.message || (data.success ? '✅ Sikeres bejelentkezés' : '❌ Hiba');

    container.appendChild(msg);

    // Ensure the role matches the profile type
    if (data.success && data.role !== selectedRole.value) {
        const msg = document.createElement('div');
        msg.className = 'login-message login-error';
        msg.textContent = '❌ A kiválasztott szerepkör nem egyezik a fiók szerepével!';
        container.appendChild(msg);
        return;
    }

    if (data.success) {
      // Include the selected role in the user data
      if (selectedRole) {
          data.user.role = selectedRole.value;
      }

      // Ensure users can only log in to profiles matching their role
      if (selectedRole && selectedRole.value !== data.user.role) {
          const msg = document.createElement('div');
          msg.className = 'login-message login-error';
          msg.textContent = '❌ A kiválasztott szerep nem egyezik a fiók szerepével!';
          container.appendChild(msg);
          return;
      }

      // Ensure only students can log in to student profiles
      if (selectedRole && selectedRole.value === 'student' && data.user.role !== 'student') {
          const msg = document.createElement('div');
          msg.className = 'login-message login-error';
          msg.textContent = '❌ Csak diákok léphetnek be diák profilba!';
          container.appendChild(msg);
          return;
      }

      // Ensure only teachers can log in to teacher profiles
      if (selectedRole && selectedRole.value === 'teacher' && data.user.role !== 'teacher') {
          const msg = document.createElement('div');
          msg.className = 'login-message login-error';
          msg.textContent = '❌ Csak tanárok léphetnek be tanári profilba!';
          container.appendChild(msg);
          return;
      }

      // Strictly enforce role-based login
      if (data.user.role === 'student' && selectedRole.value !== 'student') {
          const msg = document.createElement('div');
          msg.className = 'login-message login-error';
          msg.textContent = '❌ Diákként nem léphetsz be tanári profilba!';
          container.appendChild(msg);
          return;
      }

      if (data.user.role === 'teacher' && selectedRole.value !== 'teacher') {
          const msg = document.createElement('div');
          msg.className = 'login-message login-error';
          msg.textContent = '❌ Tanárként nem léphetsz be diák profilba!';
          container.appendChild(msg);
          return;
      }

      // Explicitly block students from accessing teacher profiles
      if (data.user.role === 'student' && selectedRole.value === 'teacher') {
          const msg = document.createElement('div');
          msg.className = 'login-message login-error';
          msg.textContent = '❌ Diákként nem léphetsz be tanári profilba!';
          container.appendChild(msg);
          return;
      }

      // Explicitly block teachers from accessing student profiles
      if (data.user.role === 'teacher' && selectedRole.value === 'student') {
          const msg = document.createElement('div');
          msg.className = 'login-message login-error';
          msg.textContent = '❌ Tanárként nem léphetsz be diák profilba!';
          container.appendChild(msg);
          return;
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
