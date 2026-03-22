// Tiszta bejelentkezéskezelő adatbázis-alapú bejelentkezéshez
const loginForm = document.getElementById('login-form');

function getStoredUserSafe() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (err) {
    return null;
  }
}

function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  if (!hamburgerBtn || !mobileNavDrawer) return;

  hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.classList.toggle('open');
    mobileNavDrawer.classList.toggle('open');
  });

  mobileNavDrawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburgerBtn.classList.remove('open');
      mobileNavDrawer.classList.remove('open');
    });
  });
}

async function updateHeaderProfile() {
  const storedUser = getStoredUserSafe();
  if (!storedUser || !storedUser.id) return;

  try {
    const response = await fetch(`/api/profile?id=${storedUser.id}&role=${storedUser.role}`);
    const data = await response.json();
    if (!data.success) return;

    const user = data.user;
    const getImgSrc = (profilkep, nev, felhasznalonev) => {
      if (profilkep) return profilkep.startsWith('/') ? profilkep : `/Tanfolyamok/kepek/${profilkep}`;
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(nev || felhasznalonev || 'User')}&size=50&background=242440&color=3399ff&bold=true&font-size=0.4`;
    };
    const imgSrc = getImgSrc(user.profilkep, user.nev, user.felhasznalonev);

    const miniProfilLink = document.getElementById('miniProfilLink');
    const headerImg = document.getElementById('headerProfileImage');
    if (miniProfilLink) miniProfilLink.style.display = 'block';
    if (headerImg) {
      headerImg.src = imgSrc;
      headerImg.onerror = function () {
        this.src = 'https://ui-avatars.com/api/?name=User&size=50&background=242440&color=3399ff&bold=true';
      };
    }

    const miniProfilLinkMobile = document.getElementById('miniProfilLinkMobile');
    const headerImgMobile = document.getElementById('headerProfileImageMobile');
    if (miniProfilLinkMobile) miniProfilLinkMobile.style.display = 'flex';
    if (headerImgMobile) {
      headerImgMobile.src = imgSrc;
      headerImgMobile.onerror = function () {
        this.src = 'https://ui-avatars.com/api/?name=User&size=50&background=242440&color=3399ff&bold=true';
      };
    }

    ['nav-bejelentkezes', 'nav-regisztracio', 'nav-bejelentkezes-m', 'nav-regisztracio-m'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  } catch (err) {
    console.error(err);
  }
}

function initLoginPageUI() {
  initHamburgerMenu();
  updateHeaderProfile();
}

function initPasswordToggle() {
  const passwordInput = document.getElementById('login-password');
  const toggleBtn = document.getElementById('toggle-login-password');
  if (!passwordInput || !toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    toggleBtn.setAttribute('aria-label', isHidden ? 'Jelszó elrejtése' : 'Jelszó megjelenítése');
    toggleBtn.setAttribute('title', isHidden ? 'Jelszó elrejtése' : 'Jelszó megjelenítése');
    toggleBtn.classList.toggle('active', isHidden);
  });
}

initPasswordToggle();
initLoginPageUI();

function mergeUserWithLocal(loginUser) {
  try {
    const cached = JSON.parse(localStorage.getItem('user'));
    if (!cached || !loginUser) return loginUser;

    const cachedId = cached.id ?? cached.ua_id ?? cached.uv_id;
    const loginId = loginUser.id ?? loginUser.ua_id ?? loginUser.uv_id;
    const sameRole = cached.role === loginUser.role;
    const sameIdentity = String(cachedId) === String(loginId);

    if (!sameRole || (!sameIdentity && loginUser.role !== 'admin')) {
      return loginUser;
    }

    return {
      ...loginUser,
      nev: cached.nev || loginUser.nev,
      profilkep: cached.profilkep || loginUser.profilkep,
      bemutatkozas: cached.bemutatkozas || loginUser.bemutatkozas
    };
  } catch (err) {
    return loginUser;
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-username').value.trim();
  const jelszo = document.getElementById('login-password').value;

  const container = document.querySelector('.aloldal-container');
  const existing = document.querySelector('.login-message');
  if (existing) existing.remove();

  if (!email || !jelszo) {
    const msg = document.createElement('div');
    msg.className = 'login-message login-error';
    msg.textContent = 'Kérlek, tölts ki minden mezőt!';
    container.appendChild(msg);
    return;
  }

  try {
    // Admin bejelentkezésnél kihagyjuk a szerepkörválasztást
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
        msg.textContent = data.message || (data.success ? 'Sikeres bejelentkezés' : 'Hiba');
        container.appendChild(msg);

        if (data.success) {
          const mergedUser = mergeUserWithLocal(data.user);
          localStorage.setItem('user', JSON.stringify(mergedUser));
            setTimeout(() => window.location.href = '/profil', 800);
        }
        return;
    }

    // A kiválasztott szerepkört is elküldjük a bejelentkezési kérésben
    const selectedRole = document.querySelector('input[name="role"]:checked');
    if (!selectedRole) {
        const msg = document.createElement('div');
        msg.className = 'login-message login-error';
      msg.textContent = 'Kérlek, válassz szerepkört!';
        container.appendChild(msg);
        return;
    }

    let effectiveRole = selectedRole.value;
    let res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, jelszo, role: effectiveRole })
    });

    let data = await res.json();

    // Ha rossz szerepkör lett kiválasztva, próbáljuk meg automatikusan a másikat.
    if (!data.success && res.status === 401 && (effectiveRole === 'student' || effectiveRole === 'teacher')) {
      const fallbackRole = effectiveRole === 'student' ? 'teacher' : 'student';
      const retryRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jelszo, role: fallbackRole })
      });
      const retryData = await retryRes.json();

      if (retryData.success) {
        res = retryRes;
        data = retryData;
        effectiveRole = fallbackRole;
      }
    }

    const msg = document.createElement('div');
    msg.className = `login-message ${data.success ? 'login-success' : 'login-error'}`;
    msg.textContent = data.message || (data.success ? 'Sikeres bejelentkezés' : 'Hiba');

    container.appendChild(msg);

    if (data.success) {
      data.user.role = data.role || effectiveRole;

      // Felhasználói adatok mentése localStorage-ba a helyi profil testreszabások megőrzésével.
      const mergedUser = mergeUserWithLocal(data.user);
      localStorage.setItem('user', JSON.stringify(mergedUser));

      // A 'Bejelentkezés' és a 'Regisztráció' elemek elrejtése a navigációból
      const loginNav = document.querySelector('#nav-bejelentkezes');
      const registerNav = document.querySelector('#nav-regisztracio');
      if (loginNav) loginNav.style.display = 'none';
      if (registerNav) registerNav.style.display = 'none';

      // Átirányítás szerepkör alapján
      setTimeout(() => {
        window.location.href = '/profil';
      }, 800);
    }

  } catch (err) {
    const msg = document.createElement('div');
    msg.className = 'login-message login-error';
    msg.textContent = 'Hálózati hiba';
    container.appendChild(msg);
    console.error('Login fetch error', err);
  }
});
