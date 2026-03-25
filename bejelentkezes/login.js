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

function initForgotPassword() {
  const link = document.getElementById('forgot-password-link');
  if (!link) return;

  link.addEventListener('click', (e) => {
    e.preventDefault();

    // Modal létrehozása
    const overlay = document.createElement('div');
    overlay.id = 'forgot-modal-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;
      display:flex;align-items:center;justify-content:center;padding:16px;
    `;

    overlay.innerHTML = `
      <div style="background:#11172a;border:1px solid rgba(51,153,255,0.3);border-radius:20px;
                  padding:30px;max-width:380px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,0.5);">
        <h2 style="color:#66b3ff;margin:0 0 8px;text-align:center;font-size:1.4em;">Elfelejtett jelszó</h2>
        <p style="color:rgba(255,255,255,0.6);text-align:center;font-size:0.9rem;margin:0 0 20px;">
          Add meg az email címed és küldünk egy visszaállítási linket.
        </p>

        <div style="margin-bottom:14px;">
          <label style="display:block;color:#66b3ff;font-size:0.82rem;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Szerepkör</label>
          <div style="display:flex;gap:10px;">
            <label style="flex:1;cursor:pointer;">
              <input type="radio" name="forgot-role" value="student" checked style="display:none;">
              <span id="forgot-role-student" style="display:block;text-align:center;padding:9px;background:rgba(51,153,255,0.9);color:#000;font-weight:bold;border-radius:10px;border:1px solid rgba(51,153,255,0.3);transition:0.2s;font-size:0.9rem;">Tanuló</span>
            </label>
            <label style="flex:1;cursor:pointer;">
              <input type="radio" name="forgot-role" value="teacher" style="display:none;">
              <span id="forgot-role-teacher" style="display:block;text-align:center;padding:9px;background:rgba(255,255,255,0.05);color:#fff;border-radius:10px;border:1px solid rgba(51,153,255,0.3);transition:0.2s;font-size:0.9rem;">Oktató</span>
            </label>
          </div>
        </div>

        <div style="margin-bottom:18px;">
          <label style="display:block;color:#66b3ff;font-size:0.82rem;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Email cím</label>
          <input id="forgot-email-input" type="email" placeholder="pelda@email.hu"
            style="width:100%;box-sizing:border-box;padding:11px 14px;background:rgba(15,17,26,0.95);
                   color:#fff;border:2px solid rgba(51,153,255,0.4);border-radius:12px;font-size:1em;outline:none;">
        </div>

        <div id="forgot-msg" style="margin-bottom:12px;min-height:20px;text-align:center;font-size:0.9rem;"></div>

        <div style="display:flex;gap:10px;">
          <button id="forgot-cancel-btn" style="flex:1;padding:12px;background:rgba(255,255,255,0.08);color:#fff;
            border:1px solid rgba(255,255,255,0.2);border-radius:10px;cursor:pointer;font-size:0.95rem;">
            Mégse
          </button>
          <button id="forgot-send-btn" style="flex:2;padding:12px;background:#3399ff;color:#fff;
            border:none;border-radius:10px;cursor:pointer;font-weight:bold;font-size:0.95rem;">
            Link küldése
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Szerepkör váltó vizuális visszajelzés
    overlay.querySelectorAll('input[name="forgot-role"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const studentSpan = document.getElementById('forgot-role-student');
        const teacherSpan = document.getElementById('forgot-role-teacher');
        if (radio.value === 'student' && radio.checked) {
          studentSpan.style.background = 'rgba(51,153,255,0.9)';
          studentSpan.style.color = '#000';
          teacherSpan.style.background = 'rgba(255,255,255,0.05)';
          teacherSpan.style.color = '#fff';
        } else if (radio.value === 'teacher' && radio.checked) {
          teacherSpan.style.background = 'rgba(51,153,255,0.9)';
          teacherSpan.style.color = '#000';
          studentSpan.style.background = 'rgba(255,255,255,0.05)';
          studentSpan.style.color = '#fff';
        }
      });
    });

    // Bezárás
    document.getElementById('forgot-cancel-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Küldés
    document.getElementById('forgot-send-btn').addEventListener('click', async () => {
      const email = document.getElementById('forgot-email-input').value.trim();
      const role = overlay.querySelector('input[name="forgot-role"]:checked').value;
      const msgEl = document.getElementById('forgot-msg');
      const sendBtn = document.getElementById('forgot-send-btn');

      if (!email) {
        msgEl.textContent = 'Kérlek, add meg az email címed!';
        msgEl.style.color = '#ff6b6b';
        return;
      }

      sendBtn.textContent = 'Küldés...';
      sendBtn.disabled = true;

      try {
        const res = await fetch('/api/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role })
        });
        const data = await res.json();

        msgEl.textContent = 'Ha létezik a fiók, elküldtük a visszaállítási linket!';
        msgEl.style.color = '#4caf50';
        sendBtn.textContent = 'Elküldve ✓';

        setTimeout(() => overlay.remove(), 3000);
      } catch (err) {
        msgEl.textContent = 'Hiba történt, próbáld újra!';
        msgEl.style.color = '#ff6b6b';
        sendBtn.textContent = 'Link küldése';
        sendBtn.disabled = false;
      }
    });
  });
}

initPasswordToggle();
initLoginPageUI();
initForgotPassword();

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

// Updating admin login logic to authenticate from the `admin` table
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

  const selectedRole = document.querySelector('input[name="role"]:checked');
  if (!selectedRole) {
    const msg = document.createElement('div');
    msg.className = 'login-message login-error';
    msg.textContent = 'Kérlek, válassz szerepkört!';
    container.appendChild(msg);
    return;
  }

  const role = selectedRole.value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, jelszo, role })
    });

    const data = await res.json();
    const msg = document.createElement('div');
    msg.className = `login-message ${data.success ? 'login-success' : 'login-error'}`;
    msg.textContent = data.message || (data.success ? 'Sikeres bejelentkezés' : 'Hiba');
    container.appendChild(msg);

    if (data.success) {
      const mergedUser = mergeUserWithLocal(data.user);
      localStorage.setItem('user', JSON.stringify(mergedUser));
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
